export const metadata = {
  title: '404 - Page Not Found',
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-cyan-600 dark:text-cyan-400">404</h1>
          <h2 className="text-3xl font-[TitleFont] font-normal">Page Not Found</h2>
          <p className="text-muted-foreground mt-4">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
      </div>
    </div>
  )
}
