/**
 * General guidance checklists. Requirements change and depend on the applicant;
 * every checklist links to the official portal, which is the final authority.
 */
export type Question = { id: string; label: string; options: { value: string; label: string }[] };
export type ChecklistResult = {
  required: string[];
  conditional: string[];
  tips: string[];
};
export type ChecklistDef = {
  id: string;
  name: string;
  officialName: string;
  officialUrl: string;
  questions: Question[];
  build: (a: Record<string, string>) => ChecklistResult;
};

const yesNo = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const CHECKLISTS: ChecklistDef[] = [
  {
    id: "passport",
    name: "Passport",
    officialName: "Passport Seva (Ministry of External Affairs)",
    officialUrl: "https://www.passportindia.gov.in",
    questions: [
      { id: "type", label: "Is this a fresh passport or a re-issue/renewal?", options: [{ value: "fresh", label: "Fresh" }, { value: "reissue", label: "Re-issue / Renewal" }] },
      { id: "minor", label: "Is the applicant below 18 years?", options: yesNo },
    ],
    build: (a) => ({
      required: [
        "Proof of present address (e.g. Aadhaar, bank passbook with photo, utility bill, as accepted on Passport Seva)",
        "Proof of date of birth (e.g. birth certificate, Aadhaar, school leaving certificate, as accepted on Passport Seva)",
        ...(a["type"] === "reissue" ? ["Your old/current passport (original) with self-attested copies of first and last pages"] : []),
        ...(a["minor"] === "yes" ? ["Parents' passports or address proof, and Annexure as required for minors"] : []),
      ],
      conditional: [
        "Marriage certificate or Annexure if name/spouse details have changed",
        "Name change documents (gazette/affidavit) if your name differs across documents",
        "Non-ECR proof (e.g. 10th marksheet) if applicable",
      ],
      tips: [
        "Keep originals and one set of self-attested photocopies for the PSK appointment.",
        "Make sure your name and date of birth match across all documents.",
        "Fees and the accepted documents list are shown on Passport Seva at the time of application.",
      ],
    }),
  },
  {
    id: "pan",
    name: "PAN Card",
    officialName: "Protean (NSDL) / UTIITSL PAN portals",
    officialUrl: "https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html",
    questions: [
      { id: "kind", label: "What do you need?", options: [{ value: "new", label: "New PAN" }, { value: "correction", label: "Correction / Reprint" }] },
      { id: "aadhaar", label: "Does your Aadhaar have your current name and date of birth?", options: yesNo },
    ],
    build: (a) => ({
      required: [
        "Proof of identity (Aadhaar is commonly used)",
        "Proof of address",
        "Proof of date of birth",
        "Recent passport size photo and signature (for physical applications)",
        ...(a["kind"] === "correction" ? ["Copy of existing PAN card or PAN number", "Proof supporting the correction"] : []),
      ],
      conditional: [
        ...(a["aadhaar"] === "no" ? ["Update Aadhaar details first, or carry other accepted proofs of name/DOB"] : []),
        "Representative assessee documents if applying for a minor",
      ],
      tips: ["Instant e-PAN via the Income Tax portal may be available for eligible Aadhaar holders.", "Check the latest list of accepted documents on the official portal."],
    }),
  },
  {
    id: "voter",
    name: "Voter ID",
    officialName: "Voters' Service Portal (Election Commission of India)",
    officialUrl: "https://voters.eci.gov.in",
    questions: [{ id: "kind", label: "What do you need?", options: [{ value: "new", label: "New registration (Form 6)" }, { value: "correction", label: "Correction / Shifting (Form 8)" }] }],
    build: (a) => ({
      required: ["Recent passport size photo", "Proof of age", "Proof of ordinary residence", ...(a["kind"] === "correction" ? ["Your EPIC (Voter ID) number"] : [])],
      conditional: ["Declaration form if age proof is not available, as specified by ECI"],
      tips: ["You must be an Indian citizen aged 18+ on the qualifying date.", "Application status can be tracked on the official portal."],
    }),
  },
  {
    id: "domicile",
    name: "Domicile Certificate",
    officialName: "Aaple Sarkar (Government of Maharashtra)",
    officialUrl: "https://aaplesarkar.mahaonline.gov.in",
    questions: [{ id: "born", label: "Were you born in Maharashtra?", options: yesNo }, { id: "minor", label: "Is the applicant a minor?", options: yesNo }],
    build: (a) => ({
      required: ["Proof of identity", "Proof of address", "Proof of age", "Proof of residence in Maharashtra for the required period (as specified on Aaple Sarkar)", "Recent photograph"],
      conditional: [
        ...(a["born"] === "yes" ? ["Birth certificate showing place of birth"] : ["Documents showing continuous residence (e.g. ration card, utility bills, school records)"]),
        ...(a["minor"] === "yes" ? ["Parent's documents and school bonafide certificate"] : []),
        "Self-declaration / affidavit, if required by the issuing office",
      ],
      tips: ["The required residence period and list of documents are set by the Maharashtra government — confirm on Aaple Sarkar."],
    }),
  },
  {
    id: "income",
    name: "Income Certificate",
    officialName: "Aaple Sarkar (Government of Maharashtra)",
    officialUrl: "https://aaplesarkar.mahaonline.gov.in",
    questions: [{ id: "job", label: "Source of income", options: [{ value: "salaried", label: "Salaried" }, { value: "self", label: "Self-employed / Business" }, { value: "agri", label: "Agriculture" }] }],
    build: (a) => ({
      required: ["Proof of identity", "Proof of address", "Recent photograph", "Self-declaration of income"],
      conditional: [
        ...(a["job"] === "salaried" ? ["Salary certificate / Form 16 from employer"] : []),
        ...(a["job"] === "self" ? ["ITR acknowledgements or business income proof"] : []),
        ...(a["job"] === "agri" ? ["7/12 extract and talathi report as required"] : []),
      ],
      tips: ["Income certificates are often needed for scholarships and schemes — check the purpose-specific requirement."],
    }),
  },
  {
    id: "gst",
    name: "GST Registration",
    officialName: "GST Portal",
    officialUrl: "https://www.gst.gov.in",
    questions: [{ id: "entity", label: "Business type", options: [{ value: "prop", label: "Proprietorship" }, { value: "firm", label: "Partnership / LLP" }, { value: "company", label: "Company" }] }],
    build: (a) => ({
      required: ["PAN of the business / proprietor", "Aadhaar of proprietor / partners / directors (for authentication)", "Proof of principal place of business (e.g. electricity bill, rent agreement / NOC)", "Bank account details (cancelled cheque or statement)", "Photograph of proprietor / partners / directors"],
      conditional: [
        ...(a["entity"] === "firm" ? ["Partnership deed / LLP agreement"] : []),
        ...(a["entity"] === "company" ? ["Certificate of incorporation, MOA/AOA, board resolution for authorised signatory"] : []),
        "Consent letter from owner if premises are not owned",
      ],
      tips: ["Registration thresholds depend on turnover, state and nature of supply — check whether registration is mandatory for you."],
    }),
  },
  {
    id: "itr",
    name: "ITR Filing",
    officialName: "Income Tax e-Filing Portal",
    officialUrl: "https://www.incometax.gov.in",
    questions: [{ id: "income", label: "Main source of income", options: [{ value: "salary", label: "Salary" }, { value: "business", label: "Business / Profession" }, { value: "other", label: "Other (interest, rent, capital gains)" }] }],
    build: (a) => ({
      required: ["PAN (linked with Aadhaar)", "Bank account details for refund", "Form 26AS / Annual Information Statement (downloadable from the portal)"],
      conditional: [
        ...(a["income"] === "salary" ? ["Form 16 from employer"] : []),
        ...(a["income"] === "business" ? ["Books of accounts / profit & loss summary", "GST returns if registered"] : []),
        ...(a["income"] === "other" ? ["Interest certificates, rent receipts, capital gains statements"] : []),
        "Investment / deduction proofs (if claiming deductions under the applicable regime)",
      ],
      tips: ["Due dates are announced by the Income Tax Department each year.", "Keep your e-filing login handy — never share OTPs with anyone you don't trust."],
    }),
  },
  {
    id: "birth",
    name: "Birth Certificate",
    officialName: "Civil Registration System / Mira-Bhayandar Municipal Corporation",
    officialUrl: "https://crsorgi.gov.in",
    questions: [{ id: "late", label: "Was the birth registered within 21 days?", options: yesNo }],
    build: (a) => ({
      required: ["Hospital discharge / birth report", "Parents' identity proof", "Parents' address proof"],
      conditional: a["late"] === "no" ? ["Affidavit and other documents for delayed registration, as required by the registrar"] : [],
      tips: ["Births are registered with the local municipal corporation where the birth took place."],
    }),
  },
];
