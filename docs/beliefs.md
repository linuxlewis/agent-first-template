# Core Beliefs

These are the operating principles for this codebase. They guide architectural decisions and resolve ambiguity.

## Agent-First Principles

1. **Repository is the system of record.** If knowledge isn't in the repo, it doesn't exist. No Google Docs, no Slack threads, no tribal knowledge.

2. **Constraints enable speed.** Strict architecture, enforced linting, and mechanical validation let agents ship fast without drift.

3. **Map over manual.** Give agents a small, stable entry point (AGENTS.md) and teach them where to look. Don't overwhelm with upfront context.

4. **Enforce invariants, not implementations.** Define the "what" (parse at boundaries, structured logging). Let agents decide the "how."

5. **Corrections are cheap, waiting is expensive.** Prefer short-lived PRs and follow-up fixes over blocking merge gates.

6. **Boring technology wins.** Stable APIs, composable abstractions, well-documented libraries. Agents reason better about boring tech.

7. **Reimplement over wrapping opaque dependencies.** If a library's behavior is hard to reason about, build a focused replacement with full test coverage.

## Engineering Standards

8. **Parse, don't validate.** External data enters the system through Zod schemas. After parsing, the type system guarantees correctness.

9. **Structured logging only.** Every log line is JSON with consistent fields. Agents (and observability tools) can query them.

10. **Tests are documentation.** A well-named test describes the expected behavior better than a comment.

11. **Small files, clear names.** 300-line max. One concept per file. Name it what it does.
