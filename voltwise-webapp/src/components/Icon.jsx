const PATHS = {
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6z" />,
  bell: (
    <>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 7 2 7H4s2-2 2-7" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2 20h20z" />
      <line x1="12" y1="9" x2="12" y2="14" />
      <line x1="12" y1="17" x2="12" y2="17.5" />
    </>
  ),
  home: (
    <>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <line x1="9" y1="7" x2="9" y2="7.5" />
      <line x1="15" y1="7" x2="15" y2="7.5" />
      <line x1="9" y1="11" x2="9" y2="11.5" />
      <line x1="15" y1="11" x2="15" y2="11.5" />
      <path d="M10 21v-4h4v4" />
    </>
  ),
  check: <path d="M4 12l5 5L20 6" />
};

export function Icon({ name, size = 22, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
