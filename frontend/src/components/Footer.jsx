// src/components/Footer.jsx
import { FaGithub, FaDiscord, FaFacebook, FaInstagram } from "react-icons/fa";
import logo from "../assets/react.png";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-tr from-[#181f3a] via-[#232a4d] to-[#1e2233] text-white pt-10 pb-6 px-4 mt-0 overflow-hidden">
      {/* Subtelny animowany gradient w tle */}
      <div className="pointer-events-none absolute inset-0 opacity-60 blur-2xl z-0"
        style={{
          background: "radial-gradient(ellipse at 60% 60%, #6366f1 0%, transparent 70%)"
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between gap-8">
        {/* Logo i opis */}
        <div className="flex-1 min-w-[220px] mb-8 md:mb-0">
          <div className="flex items-center gap-3 mb-3">
            <img src={logo} alt="GramyTu" className="w-10 h-10 drop-shadow-lg" />
            <span className="font-bold text-2xl tracking-wide bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">GramyTu</span>
          </div>
          <p className="text-indigo-100/80 text-sm mb-4 max-w-xs">
            Łączymy graczy planszowych, komputerowych i wszystkich innych. Odkrywaj wydarzenia, poznawaj ludzi, graj lokalnie i online!
          </p>
          <div className="flex gap-4 mt-2">
            <a href="https://github.com/gramytu" target="_blank" rel="noopener noreferrer" aria-label="GitHub"
              className="hover:text-fuchsia-400 transition text-xl duration-200">
              <FaGithub />
            </a>
            <a href="https://discord.gg/gramytu" target="_blank" rel="noopener noreferrer" aria-label="Discord"
              className="hover:text-fuchsia-400 transition text-xl duration-200">
              <FaDiscord />
            </a>
            <a href="https://facebook.com/gramytu" target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="hover:text-fuchsia-400 transition text-xl duration-200">
              <FaFacebook />
            </a>
            <a href="https://instagram.com/gramytu" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
              className="hover:text-fuchsia-400 transition text-xl duration-200">
              <FaInstagram />
            </a>
          </div>
        </div>
        {/* Nawigacja */}
        <div className="flex-1 min-w-[180px]">
          <h3 className="font-semibold text-lg mb-3 tracking-wide text-indigo-200">Nawigacja</h3>
          <ul className="space-y-2 text-indigo-100/80">
            <li>
              <a href="/" className="relative group hover:text-white transition">
                Strona główna
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-fuchsia-400 rounded group-hover:w-full transition-all duration-300"></span>
              </a>
            </li>
            <li>
              <a href="/events" className="relative group hover:text-white transition">
                Przeglądaj wydarzenia
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-fuchsia-400 rounded group-hover:w-full transition-all duration-300"></span>
              </a>
            </li>
            <li>
              <a href="/events/swipe" className="relative group hover:text-white transition">
                Swipe'uj wydarzenia
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-fuchsia-400 rounded group-hover:w-full transition-all duration-300"></span>
              </a>
            </li>
            <li>
              <a href="#about" className="relative group hover:text-white transition">
                O nas
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-fuchsia-400 rounded group-hover:w-full transition-all duration-300"></span>
              </a>
            </li>
          </ul>
        </div>
        {/* Kontakt */}
        <div className="flex-1 min-w-[180px]">
          <h3 className="font-semibold text-lg mb-3 tracking-wide text-indigo-200">Kontakt</h3>
          <ul className="space-y-2 text-indigo-100/80 text-sm">
            <li>
              Email: <a href="mailto:kontakt@gramytu.pl" className="hover:text-white transition">kontakt@gramytu.pl</a>
            </li>
            <li>
              Discord: <a href="https://discord.gg/gramytu" className="hover:text-white transition">discord.gg/gramytu</a>
            </li>
            <li>
              Facebook: <a href="https://facebook.com/gramytu" className="hover:text-white transition">facebook.com/gramytu</a>
            </li>
          </ul>
        </div>
      </div>
      {/* Dolny pasek */}
      <div className="border-t border-indigo-400/30 mt-10 pt-4 text-center text-indigo-200/80 text-xs relative z-10 flex flex-col items-center">
        <span>
          &copy; {new Date().getFullYear()} GramyTu. Wszelkie prawa zastrzeżone.
        </span>
        {/* To top button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs text-indigo-100 shadow transition-all duration-200"
        >
          ↑ Wróć na górę
        </button>
      </div>
    </footer>
  );
}
