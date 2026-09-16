import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
await writeFile('build/client/.nojekyll', '');

// Give each CMS configuration its own URL so a cached config cannot outlive a deploy.
const config = await readFile('build/client/admin/config.yml');
const version = createHash('sha256').update(config).digest('hex').slice(0, 12);
const configFile = `config.${version}.yml`;
await writeFile(`build/client/admin/${configFile}`, config);
const admin = await readFile('build/client/admin/index.html', 'utf8');
await writeFile(
  'build/client/admin/index.html',
  admin.replace('/admin/config.yml', `/admin/${configFile}`),
);
