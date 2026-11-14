# Setup for workspace admins

1. Create a Scavio account at https://scavio.dev/?via=twenty (50 free credits).
2. Copy the API key from the Scavio dashboard.
3. Open **Settings > Applications > Scavio Company Enrichment > Settings** and set:

| Variable | Required | Purpose |
|---|---|---|
| Scavio API key (`SCAVIO_API_KEY`) | Yes | Key used for every enrichment. Stored as a secret: it is only passed to the app's server-side functions, never to the browser. |
| Companies enriched at the same time (`SCAVIO_PARALLEL_REQUESTS`) | No, default 1 | Parallel requests to Scavio, 1 to 10. Keep 1 on the free Scavio plan. |

If the key is missing or rejected, the app's settings page shows a banner, and a run marks companies **Failed** with a note saying what to fix. If the Scavio account runs out of credits mid-run, the remaining companies are marked **Out of Scavio credits**.
