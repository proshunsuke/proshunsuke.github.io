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

export const getLastUpdated = async ({ path }: Props) => {
  const result = await axios.get<CommitsResponse>(
    'https://api.github.com/repos/proshunsuke/proshunsuke.github.io/commits',
    {
      params: {
        path,
      },
    }
  );
  const data = result.data;
  const latestCommit = data[0];
  return dayjs(latestCommit.commit.committer.date).format('YYYY.MM.DD');
};
