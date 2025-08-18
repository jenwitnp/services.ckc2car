export default function LoginPageLayout({ children }) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-main-900 p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md mx-auto px-4 sm:px-0">{children}</div>
    </div>
  );
}
