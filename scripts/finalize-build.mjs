import { writeFile } from 'node:fs/promises';
await writeFile('build/client/.nojekyll', '');
