import axios from 'axios';
import dayjs from 'dayjs';

type CommitType = {
  url: string;
  sha: string;
  node_id: string;
  html_url: string;
  comments_url: string;
  commit: {
    url: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      url: string;
      sha: string;
    };
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string;
      payload: string;
    };
  };
  author: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: false;
  };
  committer: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  parents: [
    {
      url: string;
      sha: string;
    }
  ];
};

type CommitsResponse = CommitType[];

type Props = {
  path: string;
};

export const getCommitDates = async ({ path }: Props) => {
  type configType = {
    params: { path: string; client_id?: string; client_secret?: string };
  };
  const config: configType = {
    params: {
      path,
    },
  };
  if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
    config.params = {
      ...config.params,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    };
  }
  // 開発している時にAPI実行がたくさん走るとAPI制限に引っかかって面倒なのでダミーのランダム日付データを返す
  if (process.env.NODE_ENV === 'development') {
    const day = (Math.floor(Math.random() * 30) + 1).toString();
    const date = dayjs(`2021-10-${day}`).format('YYYY.MM.DD');
    return {
      latestUpdated: date,
      created: date,
    };
  }
  const result = await axios.get<CommitsResponse>(
    'https://api.github.com/repos/proshunsuke/proshunsuke.github.io/commits',
    config
  );
  const data = result.data;
  const latestCommit = data[0];
  const firstCommit = data[data.length - 1];
  return {
    latestUpdated: dayjs(latestCommit?.commit.committer.date).format(
      'YYYY.MM.DD'
    ),
    created: dayjs(firstCommit?.commit.committer.date).format('YYYY.MM.DD'),
  };
};

export const latestUpdatedProps = async () => {
  // getStaticProps実行時にはmdxファイルはjsファイルと解釈されるため
  const match = /.*(\/pages\/.*)\.js$/.exec(__filename);
  if (!match) throw Error(`記事ファイルを特定できませんでした。__filename: ${__filename}`);
  const path = `${match[1]}.mdx`;
  const latestUpdated = (await getCommitDates({ path })).latestUpdated;
  return { props: { latestUpdated } };
};
