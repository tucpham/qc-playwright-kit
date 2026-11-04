# App map - demo-tasks

<!--
Application map for newcomers and for AI agents. Keep it short; update it when screens/flows are added.
AI reads this file before plan/generate to know: which screens exist, which URL reaches them,
what each role can see, and which Page Objects already exist.
-->

## Environments
- local: http://localhost:4173 (demo app, `npm run demo:app`)
- The test env is NEVER production.

## Roles
| Role | Main permissions |
|---|---|
| user | View, add, mark tasks as done |
| admin | Same as user + delete tasks |
| anonymous | Not logged in, can only see /login |

## Screens
| Screen | URL | Page Object | Notes |
|---|---|---|---|
| Sign in | /login | project/pages/LoginPage.ts | Errors shown in role=alert |
| Task list | / | project/pages/TasksPage.ts | Success messages in role=status, validation errors in role=alert |

## Main flows
1. Login -> Task list
2. Add task -> appears in the list + message
3. Mark done -> saved in the backend
4. Delete task (admin) -> disappears from the list + backend

## Test data
- Create/delete tasks through `project/api.ts` (fixtures `api`, `adminApi`)
- Data shared between tests running in parallel: always use `uniqueName()` and filter by name; never count total items.

## Known testability gaps
- (record missing labels / data-testid / seed APIs here to feed into the dev backlog)
