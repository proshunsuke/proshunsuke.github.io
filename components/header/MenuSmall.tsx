import { useState } from 'react';
import { default as cn } from 'classnames';
import { Home } from './menu/Home';
import { GitHub } from './menu/GitHub';
import { Twitter } from './menu/Twitter';
import { DarkMode } from './DarkMode';
import { Posts } from './menu/Posts';

export const MenuSmall = () => {
  const [isShowMenu, setIsShowMenu] = useState(false);
  return (
    <>
      <button
        className="flex flex-col"
        onClick={() => setIsShowMenu((s) => !s)}
      >
        <span className="w-6 h-1 bg-gray-800 dark:bg-white mb-1" />
        <span className="w-6 h-1 bg-gray-800 dark:bg-white mb-1" />
        <span className="w-6 h-1 bg-gray-800 dark:bg-white mb-1" />
      </button>
      <div className={cn('z-30 fixed inset-0', { hidden: !isShowMenu })}>
        <div
          className="absolute inset-0 bg-black opacity-50"
          onClick={() => setIsShowMenu(false)}
        />
      </div>
      <aside
        className={cn(
          'transform ease-in-out transition-opacity transition-transform duration-300 top-0 right-0 w-24 bg-white fixed h-full overflow-auto z-40 dark:bg-gray-800 bg-white flex flex-col',
          { 'translate-x-0': isShowMenu },
          { 'translate-x-full': !isShowMenu }
        )}
      >
        <div className="mt-5 mx-auto">
          <ul>
            <li className="mb-5">
              <DarkMode />
            </li>
            <li className="my-10">
              <Home />
            </li>
            <li className="my-10">
              <Posts />
            </li>
            <li className="my-10">
              <GitHub />
            </li>
            <li className="my-10">
              <Twitter />
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};
