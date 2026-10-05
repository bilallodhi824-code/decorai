export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Not Found</h1>
        <p className="text-gray-600">The page you are looking for does not exist.</p>
        <a href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg">Return Home</a>
      </div>
    </div>
  );
}
