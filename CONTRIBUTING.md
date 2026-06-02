# Contributing to Praxis

Thanks for taking the time to contribute. Praxis is open source and built for developers — your feedback and contributions directly shape what gets built next.

## Ways to contribute

- **Report a bug** — open an issue with steps to reproduce
- **Suggest a feature** — open an issue describing the problem it solves
- **Improve signal extraction** — the scoring pipeline is in `apps/api/src/scoring/` and improvements to signal accuracy are always welcome
- **Add a challenge** — new challenge tracks (frontend, full-stack, DevOps) are on the roadmap
- **Fix documentation** — typos, unclear instructions, missing setup steps
- **Submit a PR** — see the workflow below

## Development setup

See the [README](README.md) for full setup instructions.

## Pull request workflow

1. Fork the repository
2. Create a branch: `git checkout -b fix/your-fix` or `feat/your-feature`
3. Make your changes
4. Run the builds to confirm nothing is broken:
   ```bash
   pnpm exec tsc --noEmit -p packages/shared/tsconfig.json
   pnpm --filter @praxis/api build
   pnpm --filter @praxis/web build
   ```
5. Open a pull request against `main` with a clear description of what changed and why

## What gets prioritized

PRs that improve signal extraction quality — better citations, more accurate scoring, improved narratives — are the highest priority. The analyzer lives in `apps/api/src/scoring/` and is designed to be extended.

## Code style

- TypeScript everywhere — no `any` in security-critical paths
- No comments explaining what code does — only comments explaining why
- No half-finished implementations — if it's not complete, it doesn't ship

## Opening issues

When reporting a bug, include:
- What you expected to happen
- What actually happened
- Steps to reproduce
- The submission ID if it's a scoring issue (visible in the URL)

When suggesting a feature, describe the problem it solves — not just the solution.

## Questions

Open an issue or reach out directly. This project is community-driven and every piece of feedback matters.
