import logo from "../assets/react.png";

export default function Header({ onOpenAddEvent }) {
  return (
    <header className="w-full bg-white/90 backdrop-blur shadow flex items-center justify-between px-8 py-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Gramytu logo" className="w-10 h-10" />
        <span className="font-bold text-2xl text-indigo-700">GramyTu</span>
      </div>
      <nav className="flex gap-6">
        <button
          type="button"
          onClick={onOpenAddEvent}
          className="hover:text-indigo-700 font-medium transition bg-transparent border-none outline-none cursor-pointer"
        >
          Dodaj wydarzenie
        </button>
        <a href="#events" className="hover:text-indigo-700 font-medium transition">
          Przeglądaj wydarzenia
        </a>
        <a href="#about" className="hover:text-indigo-700 font-medium transition">
          O nas
        </a>
      </nav>
    </header>
  );
}
