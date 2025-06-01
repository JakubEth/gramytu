import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RocketLaunchIcon, UsersIcon, CalendarDaysIcon, SparklesIcon, FireIcon, UserGroupIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/solid";
import LandingMap from "./LandingMap";
import EventStats from "./EventStats";
import CommunityStats from "./CommunityStats";

// --- ANIMOWANE LICZNIKI ---
function AnimatedCounter({ value, label, icon, color }) {
  const [display, setDisplay] = useState(0);
  useState(() => {
    let raf;
    let start = 0;
    const step = () => {
      start += Math.ceil((value - start) / 7) || 1;
      setDisplay(Math.min(start, value));
      if (start < value) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div className="flex flex-col items-center">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <div className="text-3xl font-extrabold text-indigo-800 tabular-nums">{display}</div>
      <div className="text-xs text-indigo-500">{label}</div>
    </div>
  );
}

// --- FEATURE KAFELKI ---
const features = [
  {
    icon: <SparklesIcon className="w-8 h-8 text-fuchsia-500" />,
    title: "Setki wydarzeń",
    desc: "Codziennie nowe planszówki, turnieje, gry miejskie i spotkania społeczności w całej Polsce.",
  },
  {
    icon: <UserGroupIcon className="w-8 h-8 text-indigo-400" />,
    title: "Poznaj ludzi",
    desc: "Dołączaj do gier, poznawaj nowych znajomych i buduj własną ekipę.",
  },
  {
    icon: <FireIcon className="w-8 h-8 text-orange-400" />,
    title: "Zero spamu, maksimum zabawy",
    desc: "Tylko gry, wydarzenia i ludzie. Bez reklam, bez chaosu. Tylko to, co naprawdę Cię kręci.",
  },
];

// --- TESTIMONIALS ---
const testimonials = [
  {
    stars: 5,
    text: "W końcu znalazłem ekipę do planszówek w moim mieście. GramyTu to złoto!",
    author: "Kuba, Poznań",
  },
  {
    stars: 5,
    text: "Super prosty sposób na znalezienie turniejów e-sportowych. Polecam każdemu graczowi!",
    author: "Ania, Warszawa",
  },
  {
    stars: 5,
    text: "Dzięki GramyTu poznałem ludzi, z którymi gram regularnie. Najlepsza społeczność ever!",
    author: "Michał, Kraków",
  },
];

// --- CTA z efektem glow ---
function GlowCTA() {
  return (
    <motion.a
      href="/events"
      whileHover={{ scale: 1.06, boxShadow: "0 0 32px 8px #a78bfa" }}
      className="inline-block relative bg-white text-indigo-700 font-bold px-10 py-4 rounded-full shadow-xl text-xl transition hover:bg-indigo-50 focus:ring-4 focus:ring-fuchsia-300"
      style={{
        boxShadow: "0 0 0 0 #a78bfa",
      }}
    >
      <span className="absolute -z-10 inset-0 rounded-full bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-indigo-500 blur-lg opacity-40 animate-pulse" />
      Przeglądaj wydarzenia
    </motion.a>
  );
}

export default function Landing2025({ events, user }) {
  // Przykładowe statystyki, możesz podpiąć z backendu
  const stats = {
    events: events?.length || 124,
    users: 289,
    aktywni: 41,
    rekord: 102,
  };

  return (
    <>
      {/* HERO SECTION + MAPA */}
      <section className="relative w-full flex flex-col items-center pt-24 pb-16 bg-gradient-to-b from-white via-indigo-50 to-blue-100 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-72 bg-gradient-to-tr from-indigo-200 via-indigo-100 to-blue-100 rounded-b-[40%] blur-2xl opacity-60 pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start gap-12 w-full max-w-7xl mx-auto">
          {/* LEWA: tekst i feature cards */}
          <div className="flex-1 flex flex-col items-center lg:items-start">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-5xl md:text-6xl font-extrabold text-indigo-800 text-center lg:text-left mb-6 leading-tight drop-shadow"
            >
              Planszówki. Ludzie. <span className="bg-gradient-to-r from-indigo-500 to-blue-400 bg-clip-text text-transparent">Wydarzenia.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-lg md:text-xl text-indigo-700 text-center lg:text-left max-w-2xl mb-8"
            >
              GramyTu to nowoczesna platforma, która łączy miłośników gier planszowych i pozwala odkrywać najciekawsze wydarzenia w Twojej okolicy. Dołącz do gry, poznawaj ludzi, twórz własne eventy!
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl w-full">
              <FeatureCard
                icon={<CalendarDaysIcon className="w-7 h-7 text-indigo-500" />}
                title="Wydarzenia na mapie"
                desc="Odkrywaj planszówkowe spotkania w Twojej okolicy dzięki interaktywnej mapie."
              />
              <FeatureCard
                icon={<UsersIcon className="w-7 h-7 text-indigo-500" />}
                title="Poznawaj ludzi"
                desc="Dołączaj do gier, poznawaj nowych znajomych i buduj społeczność."
              />
              <FeatureCard
                icon={<RocketLaunchIcon className="w-7 h-7 text-indigo-500" />}
                title="Twórz własne eventy"
                desc="Organizuj swoje wydarzenia i zapraszaj innych do wspólnej zabawy."
              />
            </div>
            <motion.a
              href="/events"
              whileHover={{ scale: 1.05 }}
              className="inline-block bg-gradient-to-r from-indigo-500 to-blue-400 text-white font-bold px-10 py-4 rounded-full shadow-xl text-xl transition hover:from-indigo-600 hover:to-blue-500"
            >
              Zacznij już teraz
            </motion.a>
          </div>
          {/* PRAWA: mapa + statystyki */}
          <div className="flex-1 flex flex-col items-center w-full max-w-xl">
            <LandingMap events={events} user={user} />
            <EventStats events={events} />
          </div>
        </div>
      </section>

      {/* --- SEKCJA: Dlaczego GramyTu? --- */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-6 tracking-tight"
          >
            Dlaczego <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">GramyTu?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto"
          >
            Największa w Polsce społeczność graczy planszowych, komputerowych i imprezowych. Odkrywaj wydarzenia, poznawaj ludzi, graj lokalnie i online!
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {features.map(f => (
              <motion.div
                key={f.title}
                whileHover={{ y: -4, scale: 1.03, boxShadow: "0 8px 24px 0 #a5b4fc44" }}
                className="bg-white/80 border border-indigo-100 rounded-xl p-7 shadow transition flex flex-col items-center"
              >
                <div className="mb-3">{f.icon}</div>
                <div className="font-bold text-xl text-indigo-700 mb-2">{f.title}</div>
                <div className="text-gray-600">{f.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CommunityStats />

      {/* --- SEKCJA: Jak to działa? --- */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-extrabold text-indigo-800 text-center mb-8 tracking-tight"
          >
            Jak to działa?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-10 mt-10">
            <motion.div
              whileHover={{ scale: 1.04, rotate: -2 }}
              className="flex flex-col items-center bg-indigo-50 rounded-xl p-7 shadow"
            >
              <div className="rounded-full bg-indigo-100 w-16 h-16 flex items-center justify-center text-3xl mb-4">🔍</div>
              <h4 className="font-bold text-lg text-indigo-700 mb-2">Przeglądaj wydarzenia</h4>
              <p className="text-gray-600 text-center">Zobacz co dzieje się w Twojej okolicy lub online. Filtruj po typie gry, dacie, miejscu i poziomie zaawansowania.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.04, rotate: 2 }}
              className="flex flex-col items-center bg-indigo-50 rounded-xl p-7 shadow"
            >
              <div className="rounded-full bg-indigo-100 w-16 h-16 flex items-center justify-center text-3xl mb-4">📝</div>
              <h4 className="font-bold text-lg text-indigo-700 mb-2">Twórz własne eventy</h4>
              <p className="text-gray-600 text-center">Organizujesz turniej, planszówkowy wieczór, lan-party albo spontaniczną grę w parku? Dodaj wydarzenie w kilka sekund.</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.04, rotate: -2 }}
              className="flex flex-col items-center bg-indigo-50 rounded-xl p-7 shadow"
            >
              <div className="rounded-full bg-indigo-100 w-16 h-16 flex items-center justify-center text-3xl mb-4">💬</div>
              <h4 className="font-bold text-lg text-indigo-700 mb-2">Dołącz i baw się!</h4>
              <p className="text-gray-600 text-center">Zgłoś się do wydarzenia, poznaj ekipę, baw się dobrze i wracaj po więcej. GramyTu to społeczność, która żyje!</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- SEKCJA: Opinie społeczności --- */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-8"
          >
            Co mówią nasi użytkownicy?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatePresence>
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                  className="bg-white/80 border border-indigo-100 rounded-xl p-7 shadow flex flex-col items-center"
                >
                  <div className="text-2xl mb-2 text-yellow-400">
                    {"⭐️".repeat(t.stars)}
                  </div>
                  <blockquote className="italic text-gray-700 mb-4">
                    “{t.text}”
                  </blockquote>
                  <div className="mt-auto text-sm text-gray-500">{t.author}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* --- SEKCJA: CTA --- */}
      <section className="bg-gradient-to-b from-indigo-50 to-white py-12 px-4 mt-0 mb-0">
  <div className="max-w-2xl mx-auto text-center">
    <h2 className="text-2xl md:text-3xl font-bold text-indigo-800 mb-2">
      Gotowy do gry?
    </h2>
    <p className="text-base text-indigo-600 mb-6">
      Dołącz do społeczności, odkrywaj wydarzenia i poznawaj ludzi z Twojej okolicy. GramyTu to miejsce, gdzie każdy gracz znajdzie coś dla siebie.
    </p>
    <a
      href="/events"
      className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3 rounded-full shadow transition text-base"
    >
      Przeglądaj wydarzenia
    </a>
  </div>
</section>

    </>
  );
}

// --- FeatureCard z Twojego hero ---
function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.015 }}
      className="bg-white/70 border border-indigo-100 rounded-lg px-5 py-6 flex flex-col items-center text-center transition"
    >
      <div className="mb-2">{icon}</div>
      <div className="font-medium text-base text-indigo-800 mb-1">{title}</div>
      <div className="text-sm text-indigo-500">{desc}</div>
    </motion.div>
  );
}
