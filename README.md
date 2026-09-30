# Website Admin

Private React/Vite administration interface for portfolio content stored in Supabase.

## Managed content

- Projects
- Work, club/design-team, and volunteer experience
- Awards (title, organization, year, credential URL) and skills
- Profile and contact details
- Personal journal and journey scene descriptions
- Public media uploads

Content is written directly to the live tables. There is no draft, publish-status, visibility, translation, or content-preview workflow.

## Local development

Create `.env` with:

```text
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Then run:

```bash
npm install
npm run dev
```

Run `npm run lint`, `npm test`, and `npm run build` before deployment.

The live Supabase project is the database source of truth. See
[the database documentation](https://github.com/KaiusJin/Website_Public/blob/main/supabase/README.md)
for the current content model. Applied SQL migrations are retained in
[Website_Public/supabase/migrations](https://github.com/KaiusJin/Website_Public/tree/main/supabase/migrations).
Use the live database and its recorded migration history when planning future changes.
