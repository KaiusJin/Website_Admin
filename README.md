# Website Admin

Private React/Vite administration interface for portfolio content stored in Supabase.

## Managed content

- Projects
- Work, club/design-team, and volunteer experience
- Awards and skills
- Profile and contact details
- Personal journal and journey scene descriptions
- Public media uploads

Content is written directly to the live tables. The Profile & Contact editor includes Classic copy and Journey English/Chinese copy in one profile record. There is no draft, publish-status, visibility, or content-preview workflow.

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

Run `npm run lint` and `npm run build` before deployment. The live Supabase project is the database source of truth; see `Website_Public/supabase/README.md` for its current content model. The seven applied migration SQL files are retained in Website_Public/supabase/migrations/; use the live database and its recorded migration history when planning future changes.
