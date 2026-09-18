# pro_shunsuke.

[日本語](README.md) | [English](README.en.md)

A personal website with a résumé and blog. Published at: https://proshunsuke.github.io/

About this site: https://proshunsuke.github.io/about/

## Local development

With mise installed, run:

```fish
mise trust
mise install node
mise run install
mise run dev
```

- `mise run check`: Run lint, formatting checks, type checks, and Vitest (Node and Browser Mode)
- `mise run lint`: Run Oxlint
- `mise run format`: Format files with Oxfmt
- `mise run format:check`: Check formatting without modifying files
- `mise run build`: Generate static pages for the entire site in `build/client/`
- `mise run preview`: Preview the built site
- `node scripts/verify-build.mjs`: Verify deployment artifacts after building
- `mise run auth:check`: Run type checks, tests, and the build for the OAuth Worker

## Tests

Run `mise run test:install` to install test browsers before the first test run and after updating Playwright.

| Command                 | Coverage                                                          |
| ----------------------- | ----------------------------------------------------------------- |
| `mise run test`         | Vitest in the Node environment and Browser Mode                   |
| `mise run test:unit`    | Markdown conversion, content loading, and input validation        |
| `mise run test:browser` | Theme components and Google Analytics calls in Chromium           |
| `mise run test:e2e`     | Site-wide Playwright tests after building and verifying artifacts |
| `mise run test:e2e:ui`  | Run and inspect tests in the Playwright UI after building         |

## Managing official skills

Official skills are managed with the `skills` CLI, installed as an npm development dependency.

```fish
mise run skills:list
mise run skills:update
```

## CMS

Sign in with GitHub at https://proshunsuke.github.io/admin/.

1. Select a blog post or a fixed page to edit.
2. Saved changes are managed in a draft branch and pull request.
3. Review changes in the editorial workflow. Publishing merges them into main.
4. A push to main triggers GitHub Actions to run checks, build the site, and deploy to GitHub Pages.

You can also review and merge pull requests directly on GitHub. Since this repository is public, draft content and edit history are public as well. The CMS preview is for checking Markdown; it does not reproduce the site's layout or provide a dedicated preview URL before publication.

A Cloudflare Worker handles GitHub OAuth authentication. Configuration and setup instructions are available in [workers/cms-auth/README.md](workers/cms-auth/README.md).
