import type { Config } from '@react-router/dev/config';
import { readdir } from 'node:fs/promises';

export default {
  ssr: false,
  prerender: async () => [
    '/',
    '/about-page/',
    '/resume/',
    '/posts/',
    ...(await readdir('content/posts'))
      .filter((file) => file.endsWith('.md'))
      .map((file) => `/posts/${file.slice(0, -3)}/`),
  ],
} satisfies Config;
