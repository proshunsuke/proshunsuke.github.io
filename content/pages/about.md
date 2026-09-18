---
title: このサイトについて
---

## 目的

[職務経歴書](/resume/)を紹介するために作成した、pro_shunsukeの個人サイトです。ブログでは、開発に関する記録や作ったものを紹介しています。

## 作成理由

最初は職務経歴書をgistなどで手軽に書くことを考えていました。しかし、文章だけでなく見せ方や更新方法も自分で工夫したいと思い、このサイトを作りました。

以前は技術の経験年数を動的に計算していました。現在は、いつ使っていた技術なのかが分かるよう、開始年月と終了年月、または継続中であることを記載しています。時間が経つだけで経験が増える表現を避け、実際の経験に合わせて内容を更新します。

## 大切にしていること

- 本文をMarkdownで管理し、画面の実装と分けて更新できること
- スマートフォン、タブレット、PCで読みやすいこと
- 明るい画面と暗い画面を選べること
- 無料で公開でき、更新履歴をGitで残せること

## 構成と公開の仕組み

[React Router](https://reactrouter.com/)のFramework Modeとファイル規約によるルーティングを使用しています。SPAとして動作し、公開時に各ページのHTMLを事前生成することで、記事のURLに直接アクセスしても本文を読める構成にしています。

デザインには[Tailwind CSS](https://tailwindcss.com/)を使用しています。本文は[Decap CMS](https://decapcms.org/)から編集でき、GitHubで変更を管理します。mainブランチに反映された内容をGitHub Actionsでビルドし、[GitHub Pages](https://pages.github.com/)へ公開しています。

このプロジェクトは[proshunsuke/proshunsuke.github.io](https://github.com/proshunsuke/proshunsuke.github.io)で公開しています。
