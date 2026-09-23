# SIPPA AI Working Rules

## Mandatory first step for every new session
Before reading or changing application code, read these files in order:
1. `.ai/PROJECT_CONTEXT.md`
2. `.ai/BUSINESS_RULES.md`
3. `.ai/ARCHITECTURE.md`
4. `.ai/DATABASE.md`
5. `.ai/UX_GUIDELINES.md`
6. `.ai/DECISIONS.md`
7. `.ai/SESSION_LOG.md`

## Rules
- Do not invent requirements, fields, roles, statuses, workflows, or business rules that are not documented.
- When a requirement is missing, mark it as `[NEEDS_DECISION]` instead of guessing.
- Before changing existing behavior, inspect the related code and the context files first.
- Keep the domain terminology consistent: Request Baru, New Application, RFC, DevTI Request, Laptri, Pencapaian SLA, User, Admin, Developer.
- Any database/schema change must be reflected in `.ai/DATABASE.md`.
- Any architectural decision must be recorded in `.ai/DECISIONS.md`.
- Any meaningful implementation change must be summarized in `.ai/SESSION_LOG.md`.
- Prefer small, reversible changes and preserve existing behavior unless the task explicitly changes it.
- Do not silently add dependencies. Record important dependency decisions in `.ai/DECISIONS.md`.
- Do not assume a feature is complete until its acceptance criteria are checked.

## Session close-out
At the end of a meaningful session:
- Update `.ai/SESSION_LOG.md`.
- Update relevant context/schema/decision documents.
- Add unresolved items under `Open Questions` rather than guessing.
