// src/app/components/ui/Icons.js
// ✅ Only custom icons that don't exist in lucide-react

// Custom LINE icon (since Lucide doesn't have it)
const LineIcon = (props) => (
  <svg viewBox="0 0 48 48" fill="none" {...props}>
    {/* <rect width="48" height="48" rx="12" fill="#06C755" /> */}
    <path
      d="M24 12C16.268 12 10 17.019 10 23.012c0 4.13 3.09 7.74 7.74 9.53-.11.42-.7 2.67-.72 2.87 0 0-.01.21.11.29.12.08.28.05.28.05.37-.05 2.6-1.7 3.02-1.98.96.14 1.95.22 2.97.22 7.732 0 14-5.019 14-11.012S31.732 12 24 12z"
      fill="#fff"
    />
    <path
      d="M18.5 25.5v-6h1.5v6h-1.5zm3.5 0v-6h1.5v4.5h2V19.5h1.5v6h-1.5v-2h-2v2h-1.5zm7.5 0v-6h1.5v6h-1.5zm3.5 0v-6h1.5v4.5h2V19.5h1.5v6h-1.5v-2h-2v2h-1.5z"
      fill="#06C755"
    />
  </svg>
);

// Custom Google icon (more recognizable than Chrome)
const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const Icons = {
  // Custom icons that don't exist in lucide-react
  Line: LineIcon,
  Google: GoogleIcon,
  // Add more custom icons here as needed

  Spinner: ({ className = "", ...props }) => (
    <svg
      className={`animate-spin ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  ),

  Check: ({ className = "", ...props }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <polyline points="20,6 9,17 4,12"></polyline>
    </svg>
  ),

  AlertCircle: ({ className = "", ...props }) => (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      {...props}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),

  Line: ({ className = "", ...props }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.28-.63.626-.63.352 0 .631.285.631.63v4.771z" />
    </svg>
  ),
};
