import { createHash } from "node:crypto";
import { readFile, readdir, mkdir, writeFile, copyFile, rm } from "node:fs/promises";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { site, fixedPages } from "../app/lib/site.ts";
import { imageTemplate, imageWidth, imageHeight, titleBounds } from "./og-template.mjs";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const hash = (...parts) => {
  const digest = createHash("sha256");
  for (const part of parts) digest.update(part);
  return digest.digest("hex");
};

export const renderImage = async (input, font) => {
  for (let fontSize = 68; fontSize >= 32; fontSize -= 4) {
    let fits = false;
    const svg = await satori(imageTemplate({ ...input, fontSize }), {
      width: imageWidth,
      height: imageHeight,
      fonts: [{ name: "Noto Sans JP", data: font, weight: 700, style: "normal" }],
      onNodeDetected: (node) => {
        if (node.props.id === "title")
          fits = node.height <= titleBounds.height && node.width <= titleBounds.width;
      },
    });
    if (fits) return new Resvg(svg).render().asPng();
  }
  throw new Error(`OGP title does not fit at the minimum font size: ${input.title}`);
};

export const validImage = (buffer) =>
  buffer.length > 24 &&
  buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
  buffer.readUInt32BE(16) === imageWidth &&
  buffer.readUInt32BE(20) === imageHeight;

// root is injectable so cache behavior can be tested without touching the real content.
export const generateImages = async (root = projectRoot) => {
  const font = await readFile(join(root, "assets/fonts/NotoSansJP-Bold.otf"));
  const icon = await readFile(join(root, "public/images/icon.jpg"));
  const renderer = hash(
    await readFile(new URL("./og-template.mjs", import.meta.url)),
    await readFile(new URL("./og-images.mjs", import.meta.url)),
    await readFile(join(root, "package-lock.json")),
    font,
    icon,
    `${process.platform}-${process.arch}-${process.versions.node}`,
  );
  const pages = Object.entries(fixedPages).map(([path, page]) => ({
    path,
    title: page.imageTitle,
    label: page.label,
  }));
  for (const file of (await readdir(join(root, "content/posts")))
    .filter((file) => file.endsWith(".md"))
    .sort()) {
    const slug = file.slice(0, -3);
    const { data } = matter(await readFile(join(root, "content/posts", file), "utf8"));
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || data.slug !== slug)
      throw new Error(`Invalid article slug: ${file}`);
    if (typeof data.title !== "string" || !data.title.trim())
      throw new Error(`Missing title: ${file}`);
    pages.push({ path: `/posts/${slug}/`, title: data.title, label: "BLOG" });
  }

  const cache = join(root, ".cache/og");
  const output = join(root, "public/og");
  await mkdir(cache, { recursive: true });
  await mkdir(output, { recursive: true });
  const manifest = {};
  const active = new Set();
  let generated = 0;
  for (const { path, title, label } of pages) {
    const input = { title, label, name: site.name, domain: new URL(site.url).host };
    const key = hash(renderer, JSON.stringify(input));
    const filename = `${key}.png`;
    const cached = join(cache, filename);
    let reusable = false;
    try {
      const png = await readFile(cached);
      const checksum = await readFile(`${cached}.sha256`, "utf8");
      reusable = validImage(png) && hash(png) === checksum;
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (!reusable) {
      const png = await renderImage(
        { ...input, icon: `data:image/jpeg;base64,${icon.toString("base64")}` },
        font,
      );
      await writeFile(cached, png);
      await writeFile(`${cached}.sha256`, hash(png));
      generated++;
    }
    await copyFile(cached, join(output, filename));
    active.add(filename);
    manifest[path] = {
      url: `/og/${filename}`,
      alt: `${title} — ${site.name}`,
      width: imageWidth,
      height: imageHeight,
    };
  }
  // Cache may retain old entries, but only current pages' images are published.
  for (const filename of await readdir(output)) {
    if (!active.has(filename)) await rm(join(output, filename), { recursive: true });
  }
  await mkdir(join(root, "app/generated"), { recursive: true });
  const manifestPath = join(root, "app/generated/og-images.json");
  const json = `${JSON.stringify(manifest, null, 2)}\n`;
  let previous;
  try {
    previous = await readFile(manifestPath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (previous !== json) await writeFile(manifestPath, json);
  return { generated, reused: pages.length - generated, manifest };
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { generated, reused } = await generateImages();
  console.log(`OGP images: ${generated} generated, ${reused} reused.`);
}
