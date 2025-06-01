import { RocketLaunchIcon, UsersIcon, CalendarDaysIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

function FeatureCard({ icon, title, desc }) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      className="bg-white/80 backdrop-blur-lg border border-indigo-100 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center transition"
    >
      <div className="mb-3">{icon}</div>
      <div className="font-bold text-lg text-indigo-800 mb-2">{title}</div>
      <div className="text-indigo-600">{desc}</div>
    </motion.div>
  );
}

export default function Landing2025() {
  return (
    <section className="relative w-full flex flex-col items-center pt-24 pb-16 bg-gradient-to-b from-white via-indigo-50 to-blue-100 overflow-hidden">
      {/* abstrakcyjny dekoracyjny shape */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-72 bg-gradient-to-tr from-indigo-200 via-indigo-100 to-blue-100 rounded-b-[40%] blur-2xl opacity-60 pointer-events-none" />
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-5xl md:text-6xl font-extrabold text-indigo-800 text-center mb-6 leading-tight drop-shadow"
      >
        Planszówki. Ludzie. <span className="bg-gradient-to-r from-indigo-500 to-blue-400 bg-clip-text text-transparent">Wydarzenia.</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="text-xl md:text-2xl text-indigo-700 text-center max-w-2xl mb-10"
      >
        GramyTu to nowoczesna platforma, która łączy miłośników gier planszowych i pozwala odkrywać najciekawsze wydarzenia w Twojej okolicy. Dołącz do gry, poznawaj ludzi, twórz własne eventy!
      </motion.p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl w-full">
        <FeatureCard
          icon={<CalendarDaysIcon className="w-10 h-10 text-indigo-600" />}
          title="Wydarzenia na mapie"
          desc="Odkrywaj planszówkowe spotkania w Twojej okolicy dzięki interaktywnej mapie."
        />
        <FeatureCard
          icon={<UsersIcon className="w-10 h-10 text-indigo-600" />}
          title="Poznawaj ludzi"
          desc="Dołączaj do gier, poznawaj nowych znajomych i buduj społeczność."
        />
        <FeatureCard
          icon={<RocketLaunchIcon className="w-10 h-10 text-indigo-600" />}
          title="Twórz własne eventy"
          desc="Organizuj swoje wydarzenia i zapraszaj innych do wspólnej zabawy."
        />
      </div>
      <motion.a
        href="#"
        whileHover={{ scale: 1.05 }}
        className="inline-block bg-gradient-to-r from-indigo-500 to-blue-400 text-white font-bold px-10 py-4 rounded-full shadow-xl text-xl transition hover:from-indigo-600 hover:to-blue-500"
      >
        Zacznij już teraz
      </motion.a>
    </section>
  );
}
