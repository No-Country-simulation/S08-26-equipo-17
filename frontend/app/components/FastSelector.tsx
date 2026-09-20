interface props {
  title: string;
  subtitle: string;
}

export const FastSelector = ({ title, subtitle }: props) => {
  return (
    <div className="mx-2">
      <div>
        <p className="font-bold text-secondary-text text-xs">{subtitle}</p>
        <p className="text-4xl font-black">{title}</p>
      </div>
      <div className="flex items-center justify-between p-3 rounded-2xl bg-background-components w-full text-xs font-bold ">
        <div className="flex items-center gap-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
          ver mis reservas
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          className="h-4 w-4"
        >
          <path d="m9 5 7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};
