# Website Admin

Private React/Vite administration interface for portfolio content stored in Supabase.

## Managed content

- Projects
- Work, club/design-team, and volunteer experience
- Awards and skills
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

Run `npm run lint` and `npm run build` before deployment. Database migrations live in `Website_Public/supabase`.
