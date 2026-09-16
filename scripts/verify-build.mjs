import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { readContent, listPosts } from '../app/lib/content.server.ts';
const pages = [
  { path: '/', title: 'ホーム' },
  ...(await Promise.all(
    ['resume', 'about-page'].map(async (slug) => ({
      path: `/${slug}/`,
      title: (await readContent('pages', slug)).title,
    })),
  )),
  { path: '/posts/', title: 'ブログ' },
  ...(await listPosts()).map(({ title, slug }) => ({
    path: `/posts/${slug}/`,
    title,
  })),
];
const escape = (text) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#x27;');
for (const { path, title } of pages) {
  const file = `build/client${path}index.html`;
  const html = await readFile(file, 'utf8');
  assert.ok(
    html.includes(`<title>${escape(title)} | pro_shunsuke</title>`),
    `Incorrect page title in ${file}`,
  );
  assert.ok(
    html.includes(`href="https://proshunsuke.github.io${path}"`),
    `Incorrect canonical in ${file}`,
  );
  assert.ok(
    !/test-post-[123]/.test(html),
    `Removed article leaked into ${file}`,
  );
  if (path !== '/' && path !== '/posts/')
    assert.ok(html.includes('<article'), `Missing article in ${file}`);
}
for (const file of [
  '404.html',
  '.nojekyll',
  'admin/index.html',
  'admin/config.yml',
  '.well-known/nostr.json',
  'favicons/favicon.ico',
])
  await access(`build/client/${file}`);
for (const slug of ['test-post-1', 'test-post-2', 'test-post-3'])
  await assert.rejects(access(`build/client/posts/${slug}/index.html`));
console.log(
  `${pages.length} static pages, metadata, CMS, Nostr and removed URLs verified.`,
);
