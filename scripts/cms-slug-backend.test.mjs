import { expect, test, vi } from "vite-plus/test";
import { registerSlugBackend } from "../public/admin/slug-backend.mjs";

const path = (slug) => `content/posts/${slug}.md`;
const setup = () => {
  const events = new Map();
  const main = new Map();
  const drafts = new Map();
  const branches = new Map([["main", main]]);
  const bases = new Map();
  const diffFiles = (branch) => {
    const files = branches.get(branch);
    const base = bases.get(branch);
    return [...new Set([...base.keys(), ...files.keys()])]
      .filter((file) => base.get(file) !== files.get(file))
      .map((filename) => ({
        filename,
        status: !files.has(filename) ? "removed" : base.has(filename) ? "modified" : "added",
      }));
  };
  const api = {
    branch: "main",
    generateContentKey: (collection, slug) => `${collection}/${slug}`,
    getHeadReference: async (branch) => branch,
    getDifferences: vi.fn(async (_base, branch) => ({ files: diffFiles(branch) })),
    getFileSha: vi.fn(async (file, { branch }) => {
      const contents = branches.get(branch)?.get(file);
      if (contents === undefined) throw Object.assign(new Error("Not Found"), { status: 404 });
      return contents;
    }),
    diffFromFile: async (file) => ({
      path: file.filename,
      newFile: file.status === "added",
      binary: file.status === "renamed" || !file.patch,
    }),
  };
  const originalSave = vi.fn(async (entry, options) => {
    const file = entry.dataFiles[0];
    const branch = backend.getBranch(options.collectionName, file.slug);
    if (!options.unpublished) {
      branches.set(branch, new Map(main));
      bases.set(branch, new Map(main));
      drafts.set(`${options.collectionName}/${file.slug}`, {
        collection: options.collectionName,
        slug: file.slug,
      });
    }
    const files = branches.get(branch);
    if (file.newPath) {
      expect(options.hasSubfolders).toBe(false);
      files.delete(file.path);
    }
    files.set(file.newPath || file.path, file.raw);
  });
  const originalPublish = vi.fn(async (collection, slug) => {
    const branch = backend.getBranch(collection, slug);
    const changed = diffFiles(branch);
    for (const file of changed) {
      if (file.status === "removed") main.delete(file.filename);
      else main.set(file.filename, branches.get(branch).get(file.filename));
    }
    drafts.delete(`${collection}/${slug}`);
  });
  const backend = {
    api,
    persistEntry: originalSave,
    publishUnpublishedEntry: originalPublish,
    unpublishedEntries: async () => [...drafts.keys()],
    unpublishedEntry: async ({ id, collection, slug }) => {
      const entry = drafts.get(id || `${collection}/${slug}`);
      if (!entry) throw new Error("Missing draft");
      const branch = backend.getBranch(entry.collection, entry.slug);
      return {
        ...entry,
        diffs: diffFiles(branch).map((file) => ({
          path: file.filename,
          id: "old-sha",
          newFile: file.status === "added",
        })),
      };
    },
    getBranch: (collection, slug) => `cms/${collection}/${slug}`,
  };
  const github = { init: vi.fn(() => backend) };
  let Backend;
  const CMS = {
    getBackend: () => github,
    registerBackend: (_name, implementation) => {
      Backend = implementation;
    },
    registerEventListener: ({ name, handler }) => events.set(name, handler),
  };
  const navigate = vi.fn();
  registerSlugBackend(CMS, navigate);
  new Backend({ backend: { name: "github-slug" } }, {});
  const entry = (slug, internalSlug = "kari", collection = "posts") =>
    new Map([
      ["collection", collection],
      ["slug", internalSlug],
      ["data", new Map([["slug", slug]])],
    ]);
  const save = (slug, options = {}, internalSlug = "kari") => {
    events.get("preSave")({ entry: entry(slug, internalSlug) });
    return backend.persistEntry(
      { dataFiles: [{ path: path(internalSlug), slug: internalSlug, raw: slug }], assets: [] },
      {
        collectionName: "posts",
        newEntry: false,
        useWorkflow: true,
        unpublished: true,
        ...options,
      },
    );
  };
  const addDraft = (slug, filename = slug, collection = "posts") => {
    const branch = backend.getBranch(collection, slug);
    branches.set(branch, new Map(main));
    bases.set(branch, new Map(main));
    branches.get(branch).set(path(filename), filename);
    drafts.set(`${collection}/${slug}`, { collection, slug });
    return branches.get(branch);
  };
  return {
    backend,
    api,
    main,
    drafts,
    branches,
    save,
    addDraft,
    events,
    entry,
    navigate,
    originalSave,
    originalPublish,
  };
};

test("slug変更と本文保存を同じPRで行い、再保存・再リネームしても旧ファイルを残さない", async () => {
  const state = setup();
  state.main.set(path("unrelated"), "別の記事");
  const draft = state.addDraft("kari");
  await state.save("portal-site-rebuild");
  expect(draft.has(path("kari"))).toBe(false);
  expect(draft.get(path("portal-site-rebuild"))).toBe("portal-site-rebuild");
  await state.save("portal-site-rebuild");
  await state.save("final-name");
  expect([...draft.keys()]).toEqual([path("unrelated"), path("final-name")]);
  expect([...state.drafts.keys()]).toEqual(["posts/kari"]);
  expect(state.originalSave.mock.calls.at(-1)[0].dataFiles[0]).toMatchObject({
    path: path("portal-site-rebuild"),
    newPath: path("final-name"),
    slug: "kari",
  });
});

test("公開記事のリネーム後、削除済みファイルを再読み込みせず公開できる", async () => {
  const state = setup();
  state.main.set(path("kari"), "公開本文");
  await state.save("renamed", { unpublished: false });
  const loaded = await state.backend.unpublishedEntry({ id: "posts/kari" });
  expect(loaded.diffs).toEqual([{ path: path("renamed"), id: "renamed", newFile: true }]);
  await state.save("renamed");
  await state.backend.publishUnpublishedEntry("posts", "kari");
  state.events.get("postPublish")({ entry: state.entry("renamed") });
  expect([...state.main.entries()]).toEqual([[path("renamed"), "renamed"]]);
  expect(state.navigate).toHaveBeenCalledWith("renamed");
  expect(state.originalPublish).toHaveBeenCalledWith("posts", "kari");
});

test("公開記事の識別子を同じPR内で元に戻せる", async () => {
  const state = setup();
  state.main.set(path("kari"), "公開本文");
  await state.save("renamed", { unpublished: false });
  await state.save("kari");
  expect([...state.branches.get("cms/posts/kari").keys()]).toEqual([path("kari")]);
});

test("公開内容に完全に戻した差分のない下書きも再保存できる", async () => {
  const state = setup();
  state.main.set(path("kari"), "kari");
  await state.save("renamed", { unpublished: false });
  await state.save("kari");
  await state.save("kari");
  expect(state.originalSave).toHaveBeenCalledTimes(3);
});

test("保存に失敗しても元のパスからリネームを再試行できる", async () => {
  const state = setup();
  const draft = state.addDraft("kari");
  state.originalSave.mockRejectedValueOnce(new Error("保存失敗"));
  await expect(state.save("renamed")).rejects.toThrow("保存失敗");
  expect(draft.has(path("kari"))).toBe(true);
  await state.save("renamed");
  expect(draft.has(path("kari"))).toBe(false);
  expect(draft.get(path("renamed"))).toBe("renamed");
});

test("編集ワークフローなしでは記事フォルダー全体を移動せず保存を止める", async () => {
  const state = setup();
  await expect(state.save("renamed", { useWorkflow: false })).rejects.toThrow("編集ワークフロー");
  expect(state.originalSave).not.toHaveBeenCalled();
});

test("新規作成では存在しない旧パスを削除せず、識別子通りのファイルを保存する", async () => {
  const state = setup();
  await state.save("new-post", { newEntry: true, unpublished: false }, "new-post-1");
  expect(state.originalSave.mock.calls[0][0].dataFiles[0]).toMatchObject({
    path: path("new-post"),
    newPath: undefined,
    slug: "new-post-1",
  });
});

test.each(["published", "draft", "branch"])(
  "%sとの重複時は既存ファイルを上書きしない",
  async (kind) => {
    const state = setup();
    const ownDraft = state.addDraft("kari");
    if (kind === "published") state.main.set(path("taken"), "既存本文");
    if (kind === "draft") state.addDraft("another", "taken");
    if (kind === "branch") ownDraft.set(path("taken"), "別のファイル");
    await expect(state.save("taken")).rejects.toThrow();
    expect(state.originalSave).not.toHaveBeenCalled();
    expect(ownDraft.get(path("kari"))).toBe("kari");
  },
);

test("下書き作成後に公開先が埋まった場合は公開を止める", async () => {
  const state = setup();
  state.addDraft("kari");
  await state.save("renamed");
  state.main.set(path("renamed"), "別の記事");
  await expect(state.backend.publishUnpublishedEntry("posts", "kari")).rejects.toThrow("同じURL");
  expect(state.originalPublish).not.toHaveBeenCalled();
});

test("認証・通信エラーをファイル不存在として扱わない", async () => {
  const state = setup();
  state.addDraft("kari");
  state.api.getFileSha.mockRejectedValue(Object.assign(new Error("Forbidden"), { status: 403 }));
  await expect(state.save("renamed")).rejects.toThrow("Forbidden");
  expect(state.originalSave).not.toHaveBeenCalled();
});

test.each(["../outside", "", "Upper", undefined])("不正なslug %sは保存前に止める", (slug) => {
  const state = setup();
  expect(() => state.events.get("preSave")({ entry: state.entry(slug) })).toThrow("URLの識別子");
});

test("リネームされたMarkdownをメディア削除対象にせず、画像の扱いは維持する", async () => {
  const state = setup();
  state.addDraft("kari");
  await state.backend.unpublishedEntry({ id: "posts/kari" });
  expect(
    await state.api.diffFromFile({ filename: path("renamed"), status: "renamed" }),
  ).toMatchObject({ binary: false });
  expect(
    await state.api.diffFromFile({ filename: "public/images/upload.png", status: "added" }),
  ).toMatchObject({ binary: true });
});

test("固定ページの保存と公開は標準GitHubバックエンドに委ねる", async () => {
  const state = setup();
  const entry = {
    dataFiles: [{ path: "content/pages/about.md", slug: "about", raw: "固定ページ" }],
    assets: [],
  };
  const options = { collectionName: "pages", unpublished: false };
  await state.backend.persistEntry(entry, options);
  expect(state.originalSave).toHaveBeenCalledWith(entry, options);
  await state.backend.publishUnpublishedEntry("pages", "about");
  expect(state.originalPublish).toHaveBeenCalledWith("pages", "about");
  state.events.get("postPublish")({ entry: state.entry("about", "about", "pages") });
  expect(state.navigate).not.toHaveBeenCalled();
});
