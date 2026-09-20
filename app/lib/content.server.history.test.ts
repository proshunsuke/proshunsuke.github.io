import { expect, test } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { readPublishedAt } from "~/lib/content.server";

const exec = promisify(execFile);

test("初回追加日を取得し、編集・移動後も維持する。履歴不足は拒否する", async () => {
  const root = await mkdtemp(join(tmpdir(), "publication-history-"));
  const cwd = join(root, "repo");
  await mkdir(cwd);
  const git = (...args: string[]) =>
    exec("git", args, {
      cwd,
      env: {
        ...process.env,
        GIT_CONFIG_GLOBAL: "/dev/null",
        GIT_CONFIG_NOSYSTEM: "1",
        GIT_AUTHOR_NAME: "Test",
        GIT_AUTHOR_EMAIL: "test@example.com",
        GIT_COMMITTER_NAME: "Test",
        GIT_COMMITTER_EMAIL: "test@example.com",
        GIT_COMMITTER_DATE: "2026-09-20T12:00:00+09:00",
      },
    });
  try {
    await git("init");
    await writeFile(join(cwd, "original post.md"), "Original article\n");
    await git("add", "original post.md");
    await git(
      "-c",
      "core.hooksPath=/dev/null",
      "commit",
      "-m",
      "Initial article",
      "--date=2022-01-23T00:30:00+09:00",
    );
    expect(await readPublishedAt("original post.md", cwd)).toBe("2022-01-23");
    await git("mv", "original post.md", "renamed.md");
    await git(
      "-c",
      "core.hooksPath=/dev/null",
      "commit",
      "-m",
      "Rename",
      "--date=2024-02-29T12:00:00+09:00",
    );
    await writeFile(join(cwd, "renamed.md"), "Original article\nUpdated text\n");
    await git("add", "renamed.md");
    await git(
      "-c",
      "core.hooksPath=/dev/null",
      "commit",
      "-m",
      "Update",
      "--date=2026-09-20T12:00:00+09:00",
    );
    expect(await readPublishedAt("renamed.md", cwd)).toBe("2022-01-23");
    await writeFile(join(cwd, "draft.md"), "Uncommitted draft");
    expect(await readPublishedAt("draft.md", cwd)).toBeUndefined();
    const shallow = join(root, "shallow");
    await git("clone", "--depth=1", pathToFileURL(cwd).href, shallow);
    await expect(readPublishedAt("renamed.md", shallow)).rejects.toThrow("full Git history");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
