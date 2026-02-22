# Contributing

## Branch Strategy

| Branch | Purpose | Protection |
| ------ | ------- | ---------- |
| `main` | Production-ready code | Protected, requires PR |
| `develop` | Integration branch | Default PR target |
| `feature/*` | New features | Branch from `develop` |
| `fix/*` | Bug fixes | Branch from `develop` |
| `hotfix/*` | Urgent production fixes | Branch from `main` |

## Development Workflow

1. Create a branch from `develop` using the naming convention above
2. Make changes and commit with descriptive messages
3. Push and open a pull request to `develop`
4. CI runs Terraform plan and linting automatically
5. Get review approval
6. Merge via squash merge

## Commit Messages

Use conventional commits:

```text
feat: add asset photo upload to blob storage
fix: correct DNS zone resource group reference
docs: update deployment guide with SSL steps
refactor: extract gateway SSL config into dynamic blocks
chore: update terraform provider versions
```

## Code Style

### Terraform

- Run `terraform fmt -recursive` before committing
- Use `terraform validate` to check syntax
- Variables must have descriptions
- Sensitive values marked with `sensitive = true`
- Follow naming convention in `docs/02-architecture/02-naming-convention.md`

### TypeScript / Next.js

- Use TypeScript strict mode
- Format with Prettier
- Lint with ESLint
- Components use PascalCase filenames
- Utilities use camelCase filenames

### Python (Azure Functions)

- Format with Black
- Type hints on function signatures
- Docstrings on public functions

## Secrets

- Never commit secrets, credentials, or API keys
- All secrets go in `.env.local` (gitignored)
- For CI/CD, mirror values into GitHub repository secrets
- See `docs/03-deployment/01-deployment-guide.md` for the full secrets reference

## Pull Request Checklist

- [ ] Code follows project style conventions
- [ ] `terraform fmt` passes (for infrastructure changes)
- [ ] `terraform validate` passes
- [ ] No secrets or credentials in committed files
- [ ] Documentation updated if applicable
- [ ] PR description explains the "why"
