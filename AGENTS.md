<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Public booking and tracking go through SECURITY DEFINER RPCs (`create_booking`, `track_booking`) so anonymous visitors never read the bookings table directly.
- Admin access = row in `public.user_roles` (role `admin`); the first signed-up account is auto-assigned by a trigger. Check with `has_role`.
- AI assistant runs in `src/lib/ai.functions.ts` (server function, web search enabled); only topic + language are logged to `ai_chat_events`, never message text.
- Editable contact details live in `site_settings` (single row) and are read via `useSiteInfo`; `src/lib/business.ts` holds fallbacks.
