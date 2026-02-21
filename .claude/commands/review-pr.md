# Review PR

Review a pull request against project standards.

## Instructions

1. Get the PR number from the user (or use the current branch's PR)
2. Run `gh pr diff <number>` to see all changes
3. Run `gh pr view <number>` for description and metadata
4. Evaluate the changes against:

### Security Checklist
- [ ] No hardcoded secrets or credentials
- [ ] Auth checks on new API routes
- [ ] Input validation on new endpoints
- [ ] No `error.message` leaks in responses
- [ ] Rate limiting on sensitive operations

### Code Quality Checklist
- [ ] No `any` types introduced
- [ ] No `console.log` (use `logger` from `lib/logger.ts`)
- [ ] No duplicated code
- [ ] TypeScript types properly defined
- [ ] Tests included for new functionality

### Architecture Checklist
- [ ] No new in-memory stores (use persistent storage)
- [ ] Follows existing patterns (service layer, RBAC decorators)
- [ ] No circular dependencies
- [ ] API response format consistent with existing routes

### Infrastructure Checklist (if Terraform changes)
- [ ] Variables have descriptions and types
- [ ] Sensitive values marked `sensitive = true`
- [ ] No hardcoded values that should be variables
- [ ] `terraform fmt` clean

5. Write a review comment with findings using `gh pr comment`
6. Use `gh pr review --approve` to approve or `gh pr review --request-changes` to request changes
