# Submission Checklist

Use this before sharing the repository with Incubyte.

## Must Have

- [ ] repository is public or the reviewers have access
- [ ] local setup commands in [README.md](../README.md) are still correct
- [ ] `npm run test` passes
- [ ] `npm run seed` passes
- [ ] `npm run build` passes
- [ ] [docs/requirements.md](./requirements.md) is present
- [ ] [docs/architecture.md](./architecture.md) is present
- [ ] [docs/ai-worklog.md](./ai-worklog.md) is present

## Strongly Recommended

- [ ] deploy the app to a host with persistent disk support
- [ ] record a `3-5` minute demo using [docs/demo-script.md](./demo-script.md)
- [ ] add deployed URL and demo URL to the README
- [ ] add `2-3` screenshots or a short GIF after recording the demo
- [ ] confirm `/api/health` returns `status: "ok"` on the deployed instance

## Good Final Sanity Checks

- [ ] commit history is incremental and readable
- [ ] no placeholder text remains in docs
- [ ] no secrets are committed
- [ ] the seeded dataset still shows meaningful band exceptions and outliers
