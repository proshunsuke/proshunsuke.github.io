import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

export type Period = {
  from: string;
  to?: string;
};

type Props = {
  periodList: Period[];
};

export const Career = ({ periodList }: Props) => {
  const milliseconds = periodList.map((period) => {
    const from = dayjs(period.from);
    const to = dayjs(period.to);
    return to.diff(from);
  });
  const sumMilliseconds = milliseconds.reduce((s, c) => s + c);
  const asYears = dayjs.duration({ milliseconds: sumMilliseconds }).asYears();
  const year = Math.trunc(asYears);
  const month = Math.trunc((asYears - year) * 12);

  let career = '';
  if (year > 0) career = career + year.toString() + '年';
  if (month > 0) career = career + month.toString() + 'ヶ月';

  return <>{career}</>;
};
