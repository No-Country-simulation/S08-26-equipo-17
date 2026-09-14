interface props {
  name: string;
  building: string;
}

export const HeaderNameAddress = ({ name, building }: props) => {
  return (
    <div>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-black mb-1">
            Buen día, {name}
          </h1>
          <p className="text-gray-400 text-sm">{building}</p>
        </div>
        <div className="relative">
          <button className="p-2 hover:bg-gray-100  transition-colors border-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-black"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
