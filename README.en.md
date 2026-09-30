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

Run development and CI commands through mise. Task names describe operations independently of the tools used, so callers stay unchanged when tools are replaced. Currently, mise manages Node.js, npm manages dependencies, and Vite+ 1.0.0 provides the frontend toolchain.

- `mise run check`: Run lint, formatting checks, type checks, and Vitest (Node and Browser Mode)
- `mise run check:static`: Run lint, formatting checks, and type checks
- `mise run typecheck`: Generate types and run type checks
- `mise run lint`: Run Oxlint
- `mise run format`: Format files with Oxfmt
- `mise run format:check`: Check formatting without modifying files
- `mise run build`: Generate static pages for the entire site in `build/client/`
- `mise run preview`: Preview the built site
- `mise run build:verify`: Verify deployment artifacts after building
- `mise run assets:generate`: Generate OGP images
- `mise run auth:check`: Run type checks, tests, and the build for the OAuth Worker

Commands are defined in `mise.toml`. Development, builds, and tests include OGP image generation lifecycle hooks. Lint and formatting settings live in `vite.config.ts`; tests remain in `vitest.config.ts` to isolate them from the React Router plugin configuration. The OAuth Worker remains an independent npm package.

## Tests

Run `mise run test:setup` before the first test run and after updating test browsers. Use `mise run test:setup:ci` to prepare Node and Browser tests in CI.

On macOS 27, access restrictions on Firefox's application data directory can cause startup to fail with `Could not find profile folder` ([Playwright #42768](https://github.com/microsoft/playwright/issues/42768)). If affected, check Full Disk Access permissions for the application running the tests. CI runs all tests, including Firefox, on Linux.

| Command                   | Coverage                                                          |
| ------------------------- | ----------------------------------------------------------------- |
| `mise run test`           | Vitest in the Node environment and Browser Mode                   |
| `mise run test:unit`      | Markdown conversion, content loading, and input validation        |
| `mise run test:browser`   | Theme components and Google Analytics calls in Chromium           |
| `mise run test:e2e`       | Site-wide Playwright tests after building and verifying artifacts |
| `mise run test:e2e:built` | E2E tests against an existing build                               |
| `mise run test:e2e:ui`    | Run and inspect tests in the Playwright UI after building         |

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
