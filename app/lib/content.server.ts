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
  return { title: data.title, slug, html, headings };
};

export const listPosts = async () =>
  Promise.all(
    (await readdir("content/posts"))
      .filter((file) => file.endsWith(".md"))
      .sort()
      .map(async (file) => {
        const { title, slug } = await readContent("posts", file.slice(0, -3));
        return { title, slug };
      }),
  );
