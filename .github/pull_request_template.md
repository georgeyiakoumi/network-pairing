## What changed

<!-- 2–4 sentences, plain English. What does this PR do to the template? -->

## Why

<!-- The problem, lesson, or gap this addresses. -->

## Linear ticket

<!-- Link: https://linear.app/george-yiakoumi/issue/GEO-XX -->

## Type of change

<!-- Tick all that apply -->

- [ ] PATCH — bug fix, typo, doc correction (no behaviour change)
- [ ] MINOR — new feature, new add-on option, new rule or doc section
- [ ] MAJOR — breaking change, changed default, removed option (requires migration note)

## Checklist

- [ ] `bash -n create-project.sh` passes
- [ ] `bash -n .scripts/scaffold.sh` passes
- [ ] `bash -n .scripts/install.sh` passes
- [ ] `bash -n .scripts/output.sh` passes
- [ ] `sync-template.sh` `SYNC_FILES` updated if new files were added to `.claude/`
- [ ] `CHANGELOG.md` updated with this version's entry (Added / Changed / Fixed / Removed)
- [ ] Migration note added to CHANGELOG if existing projects are affected

## Intentional trade-offs

<!-- Anything that looks like an issue but is a deliberate decision. -->
