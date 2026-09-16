import test from 'node:test';
import assert from 'node:assert/strict';
import { readContent, listPosts } from '../app/lib/content.server.ts';

test('retained article and fixed pages render with useful headings', async () => {
  const posts = await listPosts();
  assert.ok(posts.some(({ slug }) => slug === 'github-copy-title-link'));
  assert.ok(posts.every(({ slug }) => !/^test-post-[123]$/.test(slug)));
  for (const slug of ['resume', 'about-page']) {
    const page = await readContent('pages', slug);
    assert.ok(page.headings.length >= 3);
    assert.ok(page.html.includes('<h2 id="section-'));
    assert.ok(!page.html.includes('<Career'));
  }
});
test('missing and unsafe slugs return 404', async () => {
  for (const slug of [
    '../pages/resume',
    'test-post-1',
    'test-post-2',
    'test-post-3',
  ]) {
    await assert.rejects(
      readContent('posts', slug),
      (error) => error.status === 404,
    );
  }
});
