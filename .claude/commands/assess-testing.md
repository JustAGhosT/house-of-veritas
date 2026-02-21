# Assess Testing

Read the agent definition at `.claude/agents/03-testing.md` and execute a thorough assessment of test coverage and quality.

## Instructions
1. Read `.claude/agents/03-testing.md` for the full checklist
2. Scan `tests/`, `vitest.config.ts`, `playwright.config.ts`
3. Cross-reference test files against `lib/`, `app/api/`, and `components/` to identify coverage gaps
4. Evaluate test quality (assertions, independence, edge cases)
5. Check CI integration of tests
6. Write your findings to `.claude/reports/testing-report.md`
7. Return a brief summary of coverage gaps

Focus on: untested code paths, missing edge cases, and test infrastructure gaps.
