export default function Footer() {
    return (
      <footer className="w-full bg-indigo-900 text-white py-6 mt-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4">
          <div>
            <span className="font-semibold">© 2025 BoardMatch</span>
          </div>
          <div className="flex gap-4">
            <a href="mailto:kontakt@boardmatch.pl" className="hover:underline">Kontakt</a>
            <a href="#" className="hover:underline">Polityka prywatności</a>
            <a href="#" className="hover:underline">GitHub</a>
          </div>
        </div>
        <div className="mt-4 text-center text-sm opacity-60">
          Z pasji do planszówek • Stworzone na studia 🚀
        </div>
      </footer>
    );
  }
  