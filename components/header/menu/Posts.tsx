import Link from 'next/link';

export const Posts = () => (
  <Link href="/posts">
    <a>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        className="fill-current dark:text-white mx-auto"
      >
        <path d="M4 4v20h20v-20h-20zm18 18h-16v-13h16v13zm-3-3h-10v-1h10v1zm0-3h-10v-1h10v1zm0-3h-10v-1h10v1zm3-10h-19v19h-1v-20h20v1zm-2-2h-19v19h-1v-20h20v1z" />
      </svg>
    </a>
  </Link>
);
