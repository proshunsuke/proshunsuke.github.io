import { DarkMode } from './DarkMode';
import { Home } from './menu/Home';
import { GitHub } from './menu/GitHub';
import { Twitter } from './menu/Twitter';
import { Posts } from './menu/Posts';

export const MenuLarge = () => (
  <>
    <div className="py-2 px-3 flex ">
      <Home />
    </div>
    <div className="py-2 px-3 flex ">
      <Posts />
    </div>
    <div className="py-2 px-3 flex hover:text-black">
      <GitHub />
    </div>
    <div className="py-2 px-3 flex hover:text-black">
      <Twitter />
    </div>
    <div className="py-2 px-3 flex hover:text-black">
      <DarkMode />
    </div>
  </>
);
