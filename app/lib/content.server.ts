import { execFile } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { toString } from "hast-util-to-string";
import type { Heading } from "~/lib/headings";

const gitOutput = (args: string[], cwd: string) =>
  new Promise<string>((resolve, reject) => {
    execFile("git", args, { cwd }, (error, stdout) => {
      if (error) reject(error);
      else resolve(stdout.trim());
    });
  });

export const readPublishedAt = async (path: string, cwd = process.cwd()) => {
  if ((await gitOutput(["rev-parse", "--is-shallow-repository"], cwd)) === "true")
    throw new Error("Publication dates require full Git history. Run git fetch --unshallow.");
  const dates = await gitOutput(
    ["log", "--follow", "--diff-filter=A", "--format=%as", "--", path],
    cwd,
  );
  // New, uncommitted posts have no publication date yet.
  return dates ? dates.split("\n").at(-1) : undefined;
};

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeSlug, { prefix: "section-" })
  .use(rehypeStringify);

export const readContent = async (collection: "pages" | "posts", slug: string) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Response("Not found", { status: 404 });
  let source: string;
  try {
    source = await readFile(`content/${collection}/${slug}.md`, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      throw new Response("Not found", { status: 404 });
    throw error;
  }
  const { data, content } = matter(source);
  if (typeof data.title !== "string" || !data.title.trim())
    throw new Error(`Missing title: ${slug}`);
  if (collection === "posts" && data.slug !== slug)
    throw new Error(`Slug must match filename: ${slug}`);
  if (typeof data.description !== "string" || !data.description.trim())
    throw new Error(`Missing description: ${slug}`);
  const publishedAt =
    collection === "posts" ? await readPublishedAt(`content/posts/${slug}.md`) : undefined;
  const tree = await processor.run(processor.parse(content));
  const headings: Heading[] = tree.children.flatMap((node) => {
    if (
      node.type !== "element" ||
      (node.tagName !== "h2" && node.tagName !== "h3") ||
      typeof node.properties.id !== "string"
    )
      return [];
    return [
      { id: node.properties.id, label: toString(node), level: node.tagName === "h2" ? 2 : 3 },
    ];
  });
  const html = processor.stringify(tree);
  return { title: data.title, description: data.description, publishedAt, slug, html, headings };
};

export const listPosts = async () =>
  (
    await Promise.all(
      (await readdir("content/posts"))
        .filter((file) => file.endsWith(".md"))
        .sort()
        .map(async (file) => {
          const { title, slug, publishedAt } = await readContent("posts", file.slice(0, -3));
          return { title, slug, publishedAt };
        }),
    )
  ).sort(
    (a, b) =>
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "") || a.slug.localeCompare(b.slug),
  );
