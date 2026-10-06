const postPath = (slug) => `content/posts/${slug}.md`;
const isPost = (path) => /^content\/posts\/[^/]+\.md$/.test(path);

const fileExists = async (api, path, branch) => {
  try {
    return await api.getFileSha(path, { branch });
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
};

// Keep the pinned GitHub backend's authentication, PRs, status and publication logic.
export const registerSlugBackend = (
  CMS,
  navigate = (slug) => {
    window.location.hash = `/collections/posts/entries/${slug}`;
    window.location.reload();
  },
) => {
  let pendingPost;
  CMS.registerEventListener({
    name: "preSave",
    handler: ({ entry }) => {
      pendingPost = undefined;
      if (entry.get("collection") === "posts") {
        const slug = entry.get("data").get("slug");
        if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
          throw new Error("URLの識別子は英小文字・数字・ハイフンで入力してください。");
        pendingPost = slug;
      }
      return entry;
    },
  });
  CMS.registerEventListener({
    name: "postPublish",
    handler: ({ entry }) => {
      if (entry.get("collection") !== "posts") return;
      const slug = entry.get("data").get("slug");
      if (slug !== entry.get("slug")) navigate(slug);
    },
  });

  CMS.registerBackend(
    "github-slug",
    class {
      constructor(config, options) {
        if (config.backend.open_authoring || config.backend.always_fork)
          throw new Error("記事のリネームはリポジトリへの直接アクセスでのみ利用できます。");
        const backend = CMS.getBackend("github").init(config, options);
        const persistEntry = backend.persistEntry.bind(backend);
        const unpublishedEntry = backend.unpublishedEntry.bind(backend);
        const publishEntry = backend.publishUnpublishedEntry.bind(backend);
        const preparedApis = new WeakSet();

        const prepareApi = () => {
          const api = backend.api;
          if (!api) throw new Error("GitHubにログインしてください。");
          if (!preparedApis.has(api)) {
            const diffFromFile = api.diffFromFile.bind(api);
            // GitHub omits patches for renames. Do not treat renamed Markdown as
            // an unused binary upload and delete it on the next draft save.
            api.diffFromFile = async (file) => {
              const diff = await diffFromFile(file);
              return isPost(diff.path) ? { ...diff, binary: false } : diff;
            };
            preparedApis.add(api);
          }
          return api;
        };

        backend.unpublishedEntry = async (args) => {
          const api = prepareApi();
          const entry = await unpublishedEntry(args);
          if (entry.collection !== "posts") return entry;
          const branch = backend.getBranch(entry.collection, entry.slug);
          const diffs = await Promise.all(
            entry.diffs.map(async (diff) => {
              if (!isPost(diff.path)) return diff;
              const id = await fileExists(api, diff.path, branch);
              return id ? { ...diff, id } : null;
            }),
          );
          return { ...entry, diffs: diffs.filter(Boolean) };
        };

        const draftPost = async (slug) => {
          const entry = await backend.unpublishedEntry({ collection: "posts", slug });
          const files = entry.diffs.filter((diff) => isPost(diff.path));
          if (files.length === 0) {
            const api = prepareApi();
            const path = postPath(slug);
            const id = await fileExists(api, path, backend.getBranch("posts", slug));
            if (id) return { path, id, newFile: false };
          }
          if (files.length !== 1) throw new Error("下書きPRには記事ファイルが1つだけ必要です。");
          return files[0];
        };

        const checkDestination = async (slug, source, target, unpublished) => {
          const api = prepareApi();
          const branch = backend.getBranch("posts", slug);
          const conflict = () => {
            throw new Error(`同じURLの識別子の記事が存在します: ${target}`);
          };
          const mainFile = await fileExists(api, target, api.branch);
          if (mainFile && !(target === source.path && !source.newFile)) {
            // A published article may be renamed back to its original path in
            // the same PR. Only permit a main file that this PR already removed.
            const { files } = unpublished
              ? await api.getDifferences(api.branch, await api.getHeadReference(branch))
              : { files: [] };
            const removed = files.some(
              (file) =>
                (file.status === "removed" && file.filename === target) ||
                (file.status === "renamed" && file.previous_filename === target),
            );
            if (target !== postPath(slug) || !removed) conflict();
          }
          if (unpublished && target !== source.path && (await fileExists(api, target, branch)))
            conflict();
          const ids = await backend.unpublishedEntries();
          for (const id of ids) {
            if (id === api.generateContentKey("posts", slug)) continue;
            const entry = await backend.unpublishedEntry({ id });
            if (entry.collection === "posts" && entry.diffs.some((diff) => diff.path === target))
              conflict();
          }
        };

        backend.persistEntry = async (entry, saveOptions) => {
          if (saveOptions.collectionName !== "posts") return persistEntry(entry, saveOptions);
          if (!saveOptions.useWorkflow)
            throw new Error("記事のリネームには編集ワークフローが必要です。");
          const desiredSlug = pendingPost;
          pendingPost = undefined;
          if (!desiredSlug) throw new Error("記事のURLの識別子を取得できませんでした。");
          if (entry.dataFiles.length !== 1) throw new Error("記事ファイルは1つだけ保存できます。");
          const file = entry.dataFiles[0];
          const source = saveOptions.unpublished
            ? await draftPost(file.slug)
            : { path: file.path, newFile: saveOptions.newEntry };
          const target = postPath(desiredSlug);
          await checkDestination(file.slug, source, target, saveOptions.unpublished);
          const dataFile = {
            ...file,
            path: saveOptions.newEntry ? target : source.path,
            newPath: saveOptions.newEntry || source.path === target ? undefined : target,
          };
          // The internal slug continues to identify the original branch/PR.
          return persistEntry(
            { ...entry, dataFiles: [dataFile] },
            { ...saveOptions, hasSubfolders: false },
          );
        };

        backend.publishUnpublishedEntry = async (collection, slug) => {
          if (collection === "posts") {
            const source = await draftPost(slug);
            await checkDestination(slug, source, source.path, true);
          }
          return publishEntry(collection, slug);
        };
        return backend;
      }
    },
  );
};
