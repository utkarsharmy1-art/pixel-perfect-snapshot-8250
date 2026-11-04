
create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- first registered account becomes admin
create or replace function public.assign_first_admin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_admin after insert on auth.users for each row execute function public.assign_first_admin();

-- services
create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null default '',
  handled_at_shop boolean not null default false,
  keywords text not null default '',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.services to anon, authenticated;
grant insert, update, delete on public.services to authenticated;
grant all on public.services to service_role;
alter table public.services enable row level security;
create policy "public read active services" on public.services for select to anon, authenticated using (active or public.has_role(auth.uid(),'admin'));
create policy "admin manage services" on public.services for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  mobile text not null,
  service text not null,
  preferred_date date not null,
  preferred_time text not null,
  message text,
  booking_status text not null default 'pending',
  progress_status text not null default 'Enquiry Received',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update, delete on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "admin read bookings" on public.bookings for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update bookings" on public.bookings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admin delete bookings" on public.bookings for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create or replace function public.validate_booking()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.booking_status not in ('pending','accepted','rejected','completed') then raise exception 'invalid booking status'; end if;
  if new.progress_status not in ('Enquiry Received','Documents Pending','Under Preparation','Submitted to Relevant Authority','Awaiting Official Processing','Ready for Collection','Completed') then raise exception 'invalid progress status'; end if;
  new.updated_at = now();
  return new;
end $$;
create trigger bookings_validate before insert or update on public.bookings for each row execute function public.validate_booking();

create or replace function public.create_booking(_name text, _mobile text, _service text, _date date, _time text, _message text)
returns text language plpgsql security definer set search_path = public as $$
declare ref text;
begin
  _name := trim(_name); _mobile := regexp_replace(coalesce(_mobile,''), '\D', '', 'g');
  if length(_name) < 2 or length(_name) > 100 then raise exception 'Please enter a valid name'; end if;
  if _mobile !~ '^[6-9][0-9]{9}$' then raise exception 'Please enter a valid 10-digit Indian mobile number'; end if;
  if length(coalesce(_service,'')) < 2 or length(_service) > 120 then raise exception 'Please choose a service'; end if;
  if _date < current_date or _date > current_date + 90 then raise exception 'Please choose a date within the next 90 days'; end if;
  if length(coalesce(_time,'')) = 0 or length(_time) > 20 then raise exception 'Please choose a time'; end if;
  if length(coalesce(_message,'')) > 1000 then raise exception 'Message is too long'; end if;
  loop
    ref := 'AIO-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    exit when not exists (select 1 from public.bookings where reference = ref);
  end loop;
  insert into public.bookings(reference, customer_name, mobile, service, preferred_date, preferred_time, message)
  values (ref, _name, _mobile, _service, _date, _time, nullif(trim(_message),''));
  return ref;
end $$;
grant execute on function public.create_booking(text,text,text,date,text,text) to anon, authenticated;

create or replace function public.track_booking(_reference text, _mobile text)
returns table(reference text, service text, preferred_date date, preferred_time text, booking_status text, progress_status text, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select b.reference, b.service, b.preferred_date, b.preferred_time, b.booking_status, b.progress_status, b.updated_at
  from public.bookings b
  where b.reference = upper(trim(_reference)) and b.mobile = regexp_replace(coalesce(_mobile,''), '\D', '', 'g')
  limit 1
$$;
grant execute on function public.track_booking(text,text) to anon, authenticated;

-- enquiries
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  mobile text not null check (mobile ~ '^[6-9][0-9]{9}$'),
  email text check (email is null or char_length(email) <= 255),
  subject text check (subject is null or char_length(subject) <= 150),
  message text not null check (char_length(message) between 5 and 2000),
  status text not null default 'new',
  created_at timestamptz not null default now()
);
grant insert on public.enquiries to anon, authenticated;
grant select, update, delete on public.enquiries to authenticated;
grant all on public.enquiries to service_role;
alter table public.enquiries enable row level security;
create policy "anyone can send enquiry" on public.enquiries for insert to anon, authenticated with check (status = 'new');
create policy "admin read enquiries" on public.enquiries for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin update enquiries" on public.enquiries for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete enquiries" on public.enquiries for delete to authenticated using (public.has_role(auth.uid(),'admin'));

-- site settings (single row)
create table public.site_settings (
  id int primary key default 1 check (id = 1),
  phone text not null default '8779018806',
  whatsapp text not null default '8779018806',
  email text not null default 'allinonexerox77@gmail.com',
  address text not null default 'Shop No. B-12, Bella Dona 4 Co-operative Society Ltd., Queens Park, Mira-Bhayandar Road, Mira Road East, Thane – 401107, Maharashtra, India',
  hours text not null default 'Monday to Sunday, 10:00 AM – 9:00 PM',
  announcement text not null default '',
  updated_at timestamptz not null default now()
);
grant select on public.site_settings to anon, authenticated;
grant update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;
create policy "public read settings" on public.site_settings for select to anon, authenticated using (true);
create policy "admin update settings" on public.site_settings for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
insert into public.site_settings(id) values (1);

-- AI analytics (no message content stored)
create table public.ai_chat_events (
  id uuid primary key default gen_random_uuid(),
  language text,
  topic text,
  created_at timestamptz not null default now()
);
grant select on public.ai_chat_events to authenticated;
grant all on public.ai_chat_events to service_role;
alter table public.ai_chat_events enable row level security;
create policy "admin read ai events" on public.ai_chat_events for select to authenticated using (public.has_role(auth.uid(),'admin'));

insert into public.services(slug,name,category,description,handled_at_shop,keywords,sort_order) values
('pan-card','PAN Card','Government Documentation','Assistance with new PAN applications, corrections and reprints through the official NSDL/UTIITSL portals.',false,'pan tax id income tax card correction',1),
('aadhaar-card','Aadhaar Card Assistance','Government Documentation','Guidance for Aadhaar updates and downloads. Biometric updates are done only at authorised Aadhaar centres.',false,'aadhaar uidai address update mobile link',2),
('passport','Passport Services','Government Documentation','Help filling the Passport Seva application and booking an appointment at the PSK. Verification is done by the Passport Office.',false,'passport fresh renewal travel abroad visa',3),
('passport-photo','Passport Size Photography','Government Documentation','Professional passport and visa size photos clicked and printed at the shop.',true,'photo picture passport size visa photo',4),
('voter-id','Voter ID','Government Documentation','Assistance with new voter registration and corrections via the official voters service portal.',false,'voter election card epic vote',5),
('driving-licence','Driving Licence','Government Documentation','Help with learner and permanent licence applications on the Parivahan portal.',false,'driving licence dl learner rto vehicle',6),
('gun-license','Gun License Assistance','Government Documentation','Guidance on preparing documents for arms licence applications submitted to the licensing authority.',false,'arms gun weapon license',7),
('marriage-certificate','Marriage Certificate','Government Documentation','Help preparing marriage registration applications for the local registrar.',false,'marriage wedding registration certificate',8),
('birth-certificate','Birth Certificate','Government Documentation','Assistance applying for birth certificates with the municipal corporation.',false,'birth certificate child born',9),
('death-certificate','Death Certificate','Government Documentation','Assistance applying for death certificates with the municipal corporation.',false,'death certificate deceased',10),
('domicile-certificate','Domicile Certificate','Government Documentation','Help applying on the Aaple Sarkar portal for a domicile (residence) certificate.',false,'domicile residence address proof resident nationality',11),
('income-certificate','Income Certificate','Government Documentation','Help applying on the Aaple Sarkar portal for an income certificate.',false,'income certificate salary scholarship earnings',12),
('senior-citizen-card','Senior Citizen Card','Government Documentation','Assistance applying for a senior citizen identity card.',false,'senior citizen old age elderly',13),
('smart-card','Smart Card Services','Government Documentation','Assistance with smart card applications and related forms.',false,'smart card',14),
('gst','GST Registration and Filing','Business and Tax Services','Assistance with GST registration and periodic return filing on the GST portal.',false,'gst business tax registration return filing gstin',20),
('itr','ITR Filing','Business and Tax Services','Help filing income tax returns on the Income Tax e-filing portal.',false,'itr income tax return filing refund',21),
('tds-refund','TDS Refund Assistance','Business and Tax Services','Guidance on claiming TDS refunds through your income tax return.',false,'tds refund tax deducted',22),
('udyam','Udyam Registration (MSME)','Business and Tax Services','Assistance with free Udyam (MSME) registration on the official portal.',false,'udyam msme small business registration',23),
('fssai','FSSAI / Food Licence','Business and Tax Services','Help applying for FSSAI food registration or licence.',false,'fssai food licence restaurant hotel',24),
('pf-withdrawal','PF Withdrawal Assistance','Business and Tax Services','Guidance with EPF withdrawal claims on the EPFO portal.',false,'pf epf provident fund withdrawal',25),
('newspaper-ad','News Paper Advertisement','Business and Tax Services','Booking newspaper advertisements such as name change or lost document notices.',true,'newspaper advertisement notice lost',26),
('bw-xerox','Black & White Xerox','Printing and Digital Services','Fast black & white photocopies.',true,'xerox photocopy copy black white',30),
('colour-xerox','Colour Xerox','Printing and Digital Services','High-quality colour photocopies.',true,'colour color xerox copy',31),
('bw-printout','Black & White Printout','Printing and Digital Services','Print from email, WhatsApp or pen drive.',true,'print printout black white',32),
('colour-printout','Colour Printout','Printing and Digital Services','Vibrant colour printouts.',true,'colour color print printout',33),
('lamination','Lamination','Printing and Digital Services','Lamination for documents, cards and certificates.',true,'lamination laminate',34),
('scanning','Scanning','Printing and Digital Services','Document and photo scanning to PDF or image.',true,'scan scanning pdf',35),
('school-projects','School Projects','Printing and Digital Services','Printing and binding for school projects.',true,'school project student assignment binding',36),
('photo-printing','Photo Printing','Printing and Digital Services','Photo prints in various sizes.',true,'photo print picture',37),
('smart-cards','All Types of Smart Cards','Printing and Digital Services','PVC card printing for ID and other cards.',true,'pvc card print id card',38),
('name-change','Change of Name (Gazette)','Other Services','Assistance preparing name change applications for the Maharashtra Government Gazette.',false,'name change gazette surname',40),
('marriage-assistance','Marriage Certificate Assistance','Other Services','Document preparation help for marriage registration.',false,'marriage certificate wedding',41),
('iec','Export & Import Licence (IEC)','Other Services','Assistance applying for an Importer-Exporter Code on the DGFT portal.',false,'iec import export dgft licence',42);
