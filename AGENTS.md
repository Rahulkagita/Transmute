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

## Architecture rules
- Frontend only; all data goes through `src/services/api.ts` (wire types in `src/services/types.ts`, normalized to UI models) to the external FastAPI backend at `VITE_API_BASE_URL` — backend is locked to FastAPI + PostgreSQL and built separately.
- No server functions, Lovable Cloud, or JS backend — user's locked stack forbids them.
- Static demo content lives only in `src/lib/sample.ts` and must render with the "not AI generated" SampleBanner — never mixed with real API results.
- UI models live in `src/lib/api/types.ts`; only `src/services/*` knows the FastAPI JSON shape, so schema changes stay isolated there.
