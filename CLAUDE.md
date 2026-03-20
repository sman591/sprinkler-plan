# Claude instructions

## Git rules
- Never force-push (`git push --force` or `git push --force-with-lease`) under any circumstance.

## Commit message format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`

- `<subject>`: imperative, lowercase, no trailing period
- `<body>`: explain *what* and *why*, not *how* (wrap at 72 chars)
- `<footer>`: `Closes #123`, `BREAKING CHANGE: description`, `Co-Authored-By: ...`
- Breaking changes: use `!` after type/scope (`feat(api)!: ...`) and/or a `BREAKING CHANGE:` footer

Make a commit after each material step during implementation.
