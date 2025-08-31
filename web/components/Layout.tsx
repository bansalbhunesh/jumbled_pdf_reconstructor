import Link from 'next/link';
import { useTheme } from 'next-themes';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <header className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg" style={{background:'linear-gradient(135deg,#60a5fa,#a855f7)'}}/>
          <Link href="/" className="font-extrabold text-xl">Value AI Labs — Reconstruct</Link>
        </div>
        <div className="flex items-center gap-3">
          <button className="badge" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
          <a className="badge" href="http://localhost:3001" target="_blank" rel="noreferrer">API</a>
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}
