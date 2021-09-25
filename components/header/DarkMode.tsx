import {useDarkMode} from '../../hooks/useDarkMode';
import Switch from 'react-switch';

export const DarkMode = () => {
  const { isDarkMode, toggle } = useDarkMode();
  return (
    <Switch
      onChange={toggle}
      checked={isDarkMode}
      aria-label="switch between day and night themes"
      offColor="#555"
      onHandleColor="#eee"
      handleDiameter={20}
      uncheckedIcon={
        <div className="flex justify-center items-center h-full">
          🌞
        </div>
      }
      checkedIcon={
        <div className="flex justify-center items-center h-full">
          🌙
        </div>
      }
      height={24}
      width={48}
    />
  );
};
