# release.md — gy-basecamp Template Versioning

This file covers releasing new versions of the gy-basecamp template itself.
For releasing a scaffolded project to production, see `.claude/rules/process.md` → **Production release**.

---

## When to cut a release

Cut a new template release when a batch of work on this repo is ready — typically when a feature branch merges to main. A release marks a stable, tested snapshot of the scaffold that scaffolded projects can reference.

**Every merged PR to this repo should result in a release.**

---

## Versioning scheme (semver)

`MAJOR.MINOR.PATCH`

| Increment | When |
|---|---|
| **PATCH** (e.g. `1.0.1`) | Bug fixes, typo corrections, minor wording changes to rules or docs |
| **MINOR** (e.g. `1.1.0`) | New add-on options, new questions, new sub-scripts, new rule sections |
| **MAJOR** (e.g. `2.0.0`) | Breaking changes — changed defaults, removed options, restructured scaffold output that would require migration in existing projects |

When in doubt: if an existing project created from this template would need to change something as a result of this update, it's at least MINOR. If it would break something without manual intervention, it's MAJOR.

---

## Release checklist

Before tagging, confirm:

- [ ] All changes are committed and pushed to main (merged from branch)
- [ ] `bash -n create-project.sh` passes
- [ ] `bash -n .scripts/scaffold.sh` passes
- [ ] `bash -n .scripts/install.sh` passes
- [ ] `bash -n .scripts/output.sh` passes
- [ ] The script has been run end-to-end at least once on this batch of changes (or the changes are low-risk doc/rule edits)
- [ ] `CHANGELOG.md` is updated (see below)

---

## Step-by-step release process

### 1. Update CHANGELOG.md

Add an entry at the top of `CHANGELOG.md` using this format:

```
## [1.2.0] — 29/07/2026

### Added
- Animation system question in Phase 0 + recorded in CONTEXT.md
- .github/pull_request_template.md scaffolded for all project types

### Changed
- create-project.sh split into 4 files: main + .scripts/{scaffold,install,output}.sh

### Fixed
- Strapi tsconfig.json exclude missing — Next.js was compiling Strapi's TypeScript
- Netlify auto-publish warning now prominent with exact UI path

### Removed
- (nothing)
```

Date format: DD/MM/YYYY. Never MM/DD/YYYY.

Sections to include: **Added**, **Changed**, **Fixed**, **Removed** — omit empty sections.

### 2. Commit the changelog

```bash
git add CHANGELOG.md
git commit -m "geo-[N]: Bump to v[X.Y.Z]"
```

### 3. Tag the release

```bash
git tag -a v[X.Y.Z] -m "v[X.Y.Z] — [one-line summary]"
git push origin v[X.Y.Z]
```

Example:
```bash
git tag -a v1.2.0 -m "v1.2.0 — Script split, 9 scaffold fixes, animation system question"
git push origin v1.2.0
```

### 4. Create the GitHub Release

```bash
gh release create v[X.Y.Z] \
  --title "v[X.Y.Z] — [short description]" \
  --notes-file <(sed -n '/## \[X\.Y\.Z\]/,/## \[/p' CHANGELOG.md | head -n -1)
```

Or manually via GitHub UI:
1. github.com/georgeyiakoumi/gy-basecamp → Releases → Draft a new release
2. Tag: `v[X.Y.Z]` (select the tag you just pushed)
3. Title: `v[X.Y.Z] — [short description]`
4. Body: paste the CHANGELOG entry for this version
5. Check **Set as the latest release**
6. Publish release

### 5. Update the Linear issue

Post a comment on the active Linear issue:
- Version released: `v[X.Y.Z]`
- GitHub release link
- Mark the issue Done

---

## What goes in release notes

Release notes = the CHANGELOG entry for this version, written for someone who uses the template. Focus on:

- What changed from their perspective (not implementation details)
- Any action required for existing projects (migration notes)
- What to watch out for

**Format:** plain English, bullet points. No jargon about internal variable names.

---

## CHANGELOG.md location

`CHANGELOG.md` lives at the repo root, alongside `create-project.sh`. It is committed to the repo — not just on GitHub Releases — so it's readable locally and via `sync-template.sh`.

If `CHANGELOG.md` does not yet exist, create it with:

```
# Changelog

All notable changes to gy-basecamp are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
Versioning: [Semantic Versioning](https://semver.org/)

---
```

Then add the first entry below that header.

---

## Migration notes for existing projects

When a MINOR or MAJOR release changes scaffold output, note explicitly what existing projects need to do — even if the answer is "nothing, this only affects new projects." Silence looks like an oversight.

Add a `### Migration` subsection to the CHANGELOG entry when applicable:

```
### Migration

Existing projects are unaffected — this only applies to projects created after v1.2.0.

— or —

Existing projects: add `"strapi"` to the `exclude` array in `tsconfig.json` if your
project uses Strapi and you haven't already done this manually.
```
