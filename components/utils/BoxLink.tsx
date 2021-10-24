import Link from 'next/link';

type Props = {
  href: string;
  name: string;
};
export const BoxLink = ({ href, name }: Props) => (
  <Link href={href}>
    <a className="w-full">
      <div className="shadow border select-none cursor-pointer bg-white dark:bg-gray-800 rounded-md flex flex-1 items-center p-4">
        <div className="flex-1 pl-1 md:mr-16">
          <div className="font-medium dark:text-white">{name}</div>
        </div>
        <svg
          width="12"
          fill="currentColor"
          height="12"
          className="hover:text-gray-800 dark:hover:text-white dark:text-gray-200 text-gray-500 ml-1"
          viewBox="0 0 1792 1792"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1363 877l-742 742q-19 19-45 19t-45-19l-166-166q-19-19-19-45t19-45l531-531-531-531q-19-19-19-45t19-45l166-166q19-19 45-19t45 19l742 742q19 19 19 45t-19 45z" />
        </svg>
      </div>
    </a>
  </Link>
);
