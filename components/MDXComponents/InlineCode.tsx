type Props = {
  children: string;
};

export const InlineCode = ({ children }: Props) => {
  return (
    <code className="dark:bg-gray-300 bg-gray-200 px-2 py-1 rounded-lg">
      {children}
    </code>
  );
};
