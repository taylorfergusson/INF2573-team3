# Vendored Claude Code skills

Copied from upstream at the commits below. Don't edit these files here; to update, re-copy from upstream and bump the SHA.

| Source | Commit | Copied from |
|---|---|---|
| [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | `c982cd411abb53323c4baa1baa3c2f020b8d0b08` | `skills/` |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | `a06bc63b3f8b829c14b0bbf53d99fefc39d58092` | `skills/`, plus `references/` → `.claude/references/` |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | `e103efe779e2dd01274dabae83531fef00bf2563` | `plugin/skills/` |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | `ce26fc25c0e5e8cab638f883de62d9a86ee5e45b` | `skills/` |
| [emilkowalski/skills](https://github.com/emilkowalski/skills) | `e8a175de22ae1e49370fc144c1f3bb9aeedf988d` | `skills/` |
| [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) | graphifyy 0.9.74 | `graphify install --project --platform claude` |

## Notes

- **ponytail** and **impeccable** are also enabled as plugins in `.claude/settings.json`, which adds their hooks on local machines once you trust the folder. Cloud sessions don't install plugins, so their skills are vendored here too, without hooks. Locally you may see each skill twice (for example `impeccable` and `impeccable:impeccable`).
- **agent-skills** links to shared checklists with `../../references/...`, so the shared folder sits at `.claude/references/`, matching the upstream layout.

## Skills

| Skill | Source |
|---|---|
| `animate` | emilkowalski/skills |
| `animate-expo` | emilkowalski/skills |
| `animation-vocabulary` | emilkowalski/skills |
| `api-and-interface-design` | addyosmani/agent-skills |
| `apple-design` | emilkowalski/skills |
| `ask-sonner` | emilkowalski/skills |
| `brandkit` | Leonxlnx/taste-skill |
| `break-ui` | emilkowalski/skills |
| `browser-testing-with-devtools` | addyosmani/agent-skills |
| `brutalist-skill` | Leonxlnx/taste-skill |
| `ci-cd-and-automation` | addyosmani/agent-skills |
| `code-review-and-quality` | addyosmani/agent-skills |
| `code-simplification` | addyosmani/agent-skills |
| `constraint-driven-development` | addyosmani/agent-skills |
| `context-engineering` | addyosmani/agent-skills |
| `debugging-and-error-recovery` | addyosmani/agent-skills |
| `deprecation-and-migration` | addyosmani/agent-skills |
| `documentation-and-adrs` | addyosmani/agent-skills |
| `doubt-driven-development` | addyosmani/agent-skills |
| `emil-design-eng` | emilkowalski/skills |
| `find-animation-opportunities` | emilkowalski/skills |
| `frontend-ui-engineering` | addyosmani/agent-skills |
| `git-workflow-and-versioning` | addyosmani/agent-skills |
| `gpt-tasteskill` | Leonxlnx/taste-skill |
| `idea-refine` | addyosmani/agent-skills |
| `image-to-code-skill` | Leonxlnx/taste-skill |
| `imagegen-frontend-mobile` | Leonxlnx/taste-skill |
| `imagegen-frontend-web` | Leonxlnx/taste-skill |
| `impeccable` | pbakaus/impeccable |
| `improve-animations` | emilkowalski/skills |
| `incremental-implementation` | addyosmani/agent-skills |
| `interview-me` | addyosmani/agent-skills |
| `minimalist-skill` | Leonxlnx/taste-skill |
| `mobile-native` | emilkowalski/skills |
| `observability-and-instrumentation` | addyosmani/agent-skills |
| `output-skill` | Leonxlnx/taste-skill |
| `performance-optimization` | addyosmani/agent-skills |
| `pick-ui-library` | emilkowalski/skills |
| `planning-and-task-breakdown` | addyosmani/agent-skills |
| `ponytail` | DietrichGebert/ponytail |
| `ponytail-audit` | DietrichGebert/ponytail |
| `ponytail-debt` | DietrichGebert/ponytail |
| `ponytail-gain` | DietrichGebert/ponytail |
| `ponytail-help` | DietrichGebert/ponytail |
| `ponytail-review` | DietrichGebert/ponytail |
| `prototype` | emilkowalski/skills |
| `redesign-skill` | Leonxlnx/taste-skill |
| `review-animations` | emilkowalski/skills |
| `security-and-hardening` | addyosmani/agent-skills |
| `shipping-and-launch` | addyosmani/agent-skills |
| `soft-skill` | Leonxlnx/taste-skill |
| `source-driven-development` | addyosmani/agent-skills |
| `spec-driven-development` | addyosmani/agent-skills |
| `stitch-skill` | Leonxlnx/taste-skill |
| `taste-skill` | Leonxlnx/taste-skill |
| `taste-skill-v1` | Leonxlnx/taste-skill |
| `test-driven-development` | addyosmani/agent-skills |
| `using-agent-skills` | addyosmani/agent-skills |
| `write-swift` | emilkowalski/skills |
| `graphify` | Graphify-Labs/graphify |
