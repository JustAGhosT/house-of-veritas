# Infrastructure Rules

Rules for Terraform and Azure infrastructure in HouseOfVeritas.

## Terraform

- All modules must have `main.tf`, `variables.tf`, `outputs.tf`
- Variables must have `description` and `type`
- Sensitive variables must be marked `sensitive = true`
- No hardcoded values that should be variables
- Provider versions must be pinned (`azurerm ~> 3.80`)
- Run `terraform fmt -recursive` before committing
- State backend uses Azure Storage with locking

## Azure Resources

- All resources must be tagged with `environment` and `project`
- Resource names follow convention: `nl-prod-hov-{type}-san`
- TLS 1.2 minimum on all services
- Storage accounts use deny-by-default network ACLs
- Database must be in a private subnet with no public access
- Use managed identities over access keys
- WAF must be in Prevention mode with SQL injection rules enabled

## CI/CD

- All GitHub Actions jobs must have `timeout-minutes` set
- All secrets must use `${{ secrets.* }}` or `${{ vars.* }}`
- Use `npm ci` (not `yarn`) for dependency installation
- Cache strategy must match package manager (`cache: 'npm'`)
- Health checks after deployment must `exit 1` on failure
- Terraform plan must run before apply
- Production environment should have required reviewers

## Docker

- Use multi-stage builds (deps, builder, runner)
- Run as non-root user in final image
- Use `.dockerignore` to minimize build context
