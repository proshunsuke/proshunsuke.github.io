import assert from "node:assert/strict";
import { readFile, access, readdir } from "node:fs/promises";
import { readContent, listPosts } from "../app/lib/content.server.ts";
import { fixedPages, site } from "../app/lib/site.ts";
const pages = [
  { path: "/", title: fixedPages["/"].title, description: fixedPages["/"].description },
  ...(await Promise.all(
    ["resume", "about"].map(async (slug) => ({
      path: `/${slug}/`,
      title: (await readContent("pages", slug)).title,
      description: (await readContent("pages", slug)).description,
    })),
  )),
  {
    path: "/posts/",
    title: fixedPages["/posts/"].title,
    description: fixedPages["/posts/"].description,
  },
  ...(await Promise.all(
    (await listPosts()).map(async ({ title, slug }) => ({
      path: `/posts/${slug}/`,
      title,
      description: (await readContent("posts", slug)).description,
    })),
  )),
];
const escape = (text) =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
const publishedImages = new Set();
for (const { path, title, description } of pages) {
  const file = `build/client${path}index.html`;
  const html = await readFile(file, "utf8");
  assert.ok(
    html.includes(`<title>${escape(title)} | pro_shunsuke</title>`),
    `Incorrect page title in ${file}`,
  );
  assert.ok(
    html.includes(`href="https://proshunsuke.github.io${path}"`),
    `Incorrect canonical in ${file}`,
  );
  assert.ok(!/test-post-[123]/.test(html), `Removed article leaked into ${file}`);
  const head = html.slice(0, html.indexOf("</head>"));
  const meta = (name) => {
    const matches = [
      ...head.matchAll(/<meta (?:property|name)="([^"]+)" content="([^"]*)"\s*\/?\s*>/g),
    ].filter((match) => match[1] === name);
    assert.equal(matches.length, 1, `Expected one ${name} in ${file}`);
    return matches[0][2];
  };
  assert.equal(meta("description"), escape(description));
  assert.equal(meta("og:description"), escape(description));
  assert.equal(meta("og:title"), escape(path === "/" ? site.name : `${title} | ${site.name}`));
  assert.equal(meta("og:url"), `${site.url}${path}`);
  assert.equal(
    meta("og:type"),
    path.startsWith("/posts/") && path !== "/posts/" ? "article" : "website",
  );
  assert.equal(meta("og:site_name"), site.name);
  assert.equal(meta("og:locale"), "ja_JP");
  assert.equal(meta("twitter:card"), "summary_large_image");
  assert.equal(meta("twitter:site"), site.account);
  assert.equal(meta("twitter:creator"), site.account);
  for (const field of ["title", "description", "image", "image:alt"])
    assert.equal(meta(`twitter:${field}`), meta(`og:${field}`));
  assert.ok(meta("og:image:alt").length > 0);
  assert.equal(meta("og:image:width"), "1200");
  assert.equal(meta("og:image:height"), "630");
  assert.equal(meta("og:image:type"), "image/png");
  const image = new URL(meta("og:image"));
  assert.equal(image.origin, site.url);
  assert.match(image.pathname, /^\/og\/[a-f0-9]{64}\.png$/);
  publishedImages.add(image.pathname.slice("/og/".length));
  const png = await readFile(`build/client${image.pathname}`);
  assert.ok(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])));
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
  if (path !== "/" && path !== "/posts/")
    assert.ok(html.includes("<article"), `Missing article in ${file}`);
}
assert.deepEqual(
  new Set(await readdir("build/client/og")),
  publishedImages,
  "Only current OGP images should be published",
);
for (const file of [
  "404.html",
  ".nojekyll",
  "admin/index.html",
  "admin/config.yml",
  ".well-known/nostr.json",
  "favicons/favicon.ico",
])
  await access(`build/client/${file}`);
for (const slug of ["test-post-1", "test-post-2", "test-post-3"])
  await assert.rejects(access(`build/client/posts/${slug}/index.html`));
console.log(`${pages.length} static pages, metadata, CMS, Nostr and removed URLs verified.`);

const notFound = await readFile("build/client/404.html", "utf8");
assert.ok(notFound.includes("ページが見つかりません"));
assert.ok(!notFound.includes("<script"), "404 must not request missing route data");

const admin = await readFile("build/client/admin/index.html", "utf8");
const cmsConfig = admin.match(/href="(\/admin\/config\.[a-f0-9]{12}\.yml)"/);
assert.ok(cmsConfig, "CMS config needs a versioned URL");
assert.equal(
  await readFile(`build/client${cmsConfig[1]}`, "utf8"),
  await readFile("public/admin/config.yml", "utf8"),
);
