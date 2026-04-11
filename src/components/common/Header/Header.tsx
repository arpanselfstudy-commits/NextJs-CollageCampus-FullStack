import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <nav className="flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          App
        </Link>
        <div className="flex gap-4 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">Home</Link>
          <Link href="/login" className="hover:text-gray-900">Login</Link>
        </div>
      </nav>
    </header>
  )
}
