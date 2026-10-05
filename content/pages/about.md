---
title: このサイトについて
description: pro_shunsukeの個人サイトの目的、作成理由、技術構成と公開の仕組みを紹介します。
---
## 目的

主な目的な[職務経歴書](/resume/)を公開するためです。その他、開発に関する記録や作ったものを紹介しています。

## 要件

- 本文をMarkdownで管理し、画面の実装と分けて更新できること
- スマートフォン、タブレット、PCで読みやすいこと
- 明るい画面と暗い画面を選べること
- 無料で公開でき、更新履歴をGitで残せること

## 構成と公開

[React Router](https://reactrouter.com/)を使用しています。SPAとして動作し、公開時に各ページのHTMLを事前生成しています。

デザインには[Tailwind CSS](https://tailwindcss.com/)を使用しています。本文は[Decap CMS](https://decapcms.org/)から編集でき、GitHubで変更を管理します。mainブランチに反映された内容をGitHub Actionsでビルドし、[GitHub Pages](https://pages.github.com/)へ公開しています。

このプロジェクトは[proshunsuke/proshunsuke.github.io](https://github.com/proshunsuke/proshunsuke.github.io)で公開しています。
