# Git Workflow Standards

## Branch Strategy

- `main` — production-ready. Never commit directly.
- `develop` — integration branch. Features merge here first.
- `feature/<name>` — new features (e.g. `feature/waste-reduction-agent`)
- `fix/<name>` — bug fixes (e.g. `fix/recipe-parsing-error`)
- `chore/<name>` — non-functional (e.g. `chore/update-dependencies`)

## Commit Messages

Conventional commits format:

```
<type>(<scope>): <short description>
```

Types: feat, fix, refactor, docs, test, chore

Scopes: agent, ui, api, store, config

Examples:
```
feat(agent): add waste reduction agent
fix(agent): handle null response from cooking agent
refactor(api): extract retry logic into shared util
test(agent): add orchestrator routing tests
chore: upgrade expo SDK to 53
```

## Pull Request Process

1. Branch from `develop`
2. Commit with conventional messages
3. PR must include: what changed, how to test, screenshots for UI
4. All tests pass before merge
5. Squash merge to keep history clean

## What NOT to Commit

- `.env` files
- `node_modules/`
- Build outputs (`dist/`, `.expo/`, `ios/`, `android/`)
- IDE config (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`)

## Release

Semantic versioning when app reaches public release:
- Major: breaking changes
- Minor: new features (e.g. new agent)
- Patch: bug fixes
