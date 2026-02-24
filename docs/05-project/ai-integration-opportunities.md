# AI Integration Opportunities

House of Veritas uses Azure AI Foundry (OpenAI-compatible API) for AI-assisted choices where users
select from a list of options.

## Future Work (from backlog)

- **Document type classification** — Classify from document content
- **Vehicle selection suggestion** — Suggest vehicle for trip type
- **Tasks Add form** — AI suggestions for assignee, priority, project (partially done: refine
  description, project/assignee/priority selects)
- **Assets** — Assign bought resources to projects/subprojects

## Implemented

| Feature            | API                                       | Use Case                                     |
| ------------------ | ----------------------------------------- | -------------------------------------------- |
| Storage location   | `POST /api/ai/suggest-storage`            | Suggest storage location when adding assets  |
| Asset category     | `POST /api/ai/suggest-category`           | Suggest category when adding assets          |
| Project            | `POST /api/ai/suggest-project`            | Suggest project for tasks/expenses           |
| Project from photo | `POST /api/ai/suggest-project-from-photo` | Suggest project from uploaded image          |
| Task assignee      | `POST /api/ai/suggest-assignee`           | Suggest team member for task assignment      |
| Project member     | `POST /api/ai/suggest-project-member`     | Suggest member by responsibilities/specialty |
| Expense category   | `POST /api/ai/suggest-expense-category`   | Suggest category from vendor/description     |
| Task priority      | `POST /api/ai/suggest-priority`           | Suggest priority from task description       |

## Configuration

Set these environment variables for Azure AI:

- `AZURE_AI_ENDPOINT` or `AZURE_OPENAI_ENDPOINT` – API endpoint
- `AZURE_AI_KEY` or `AZURE_OPENAI_API_KEY` – API key
- `AZURE_AI_DEPLOYMENT` or `AZURE_OPENAI_DEPLOYMENT` – (optional) deployment name, default `gpt-4o-mini`

Without these, the APIs return the first option from the list (no AI).

## Other Opportunities

| Area              | Options                 | AI Use                         |
| ----------------- | ----------------------- | ------------------------------ |
| Document type     | Contract, Invoice, etc. | Classify from document content |
| Vehicle selection | Fleet list              | Suggest vehicle for trip type  |

## Adding New AI Suggestions

1. Create `lib/ai/azure-foundry.ts` helper (or extend existing).
2. Add API route under `app/api/ai/`.
3. Call from the relevant form (e.g. asset add/edit) with a "Suggest" button.
4. Use `options` from the response for the Select dropdown.
