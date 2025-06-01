export default function Header() {
    return (
      <header className="w-full bg-white/90 backdrop-blur shadow flex items-center justify-between px-8 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tracking-tight text-indigo-600">GramyTu</span>
        </div>
        <nav className="flex gap-6">
          <a href="#" className="hover:text-indigo-700 font-medium transition">Mapa</a>
          <a href="#" className="hover:text-indigo-700 font-medium transition">Dodaj wydarzenie</a>
          <a href="#" className="hover:text-indigo-700 font-medium transition">O nas</a>
        </nav>
      </header>
    );
  }
  