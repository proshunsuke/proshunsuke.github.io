import { copyFile, writeFile } from 'node:fs/promises';
await copyFile('build/client/__spa-fallback.html', 'build/client/404.html');
await writeFile('build/client/.nojekyll', '');
