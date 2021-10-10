import Link from 'next/link';
import { MenuLarge } from './MenuLarge';
import { MenuSmall } from './MenuSmall';

export const Header = () => (
  <div className="print:hidden">
    <header className="fixed top-0 left-0 h-14 sm:h-16 flex items-center z-30 w-full dark:bg-gray-700 bg-white border-b-2 border-gray-100 dark:border-gray-700">
      <div className="container mx-auto px-3 flex items-center justify-between">
        <div className="text-gray-800 dark:text-white font-black text-3xl flex items-center">
          <Link href="/">
            <a className="text-xl ml-3 mt-1">{"pro_shunsuke's page"}</a>
          </Link>
        </div>
        <div className="flex items-center">
          <nav className="font-sen text-gray-800 dark:text-white uppercase text-lg lg:flex items-center hidden">
            <MenuLarge />
          </nav>
          <div className="lg:hidden ml-4">
            <MenuSmall />
          </div>
        </div>
      </div>
    </header>
    <div className="relative h-14 sm:h-16 w-full" />
  </div>
);
