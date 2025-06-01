// src/components/CommunityStats.jsx
import { CalendarDaysIcon, UserGroupIcon, ArrowTrendingUpIcon, FireIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useState } from "react";


const stats = [
  {
    label: "Wydarzeń",
    value: 124,
    icon: <CalendarDaysIcon className="w-6 h-6 text-indigo-500" />,
  },
  {
    label: "Graczy",
    value: 289,
    icon: <UserGroupIcon className="w-6 h-6 text-fuchsia-500" />,
  },
  {
    label: "Aktywnych dzisiaj",
    value: 41,
    icon: <ArrowTrendingUpIcon className="w-6 h-6 text-green-500" />,
  },
  {
    label: "Rekord online",
    value: 102,
    icon: <FireIcon className="w-6 h-6 text-orange-400" />,
  },
];

export default function CommunityStats({ customStats }) {
  const display = customStats || stats;
  return (
    <section className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-8">
      <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6">
        {display.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
            className="bg-white/80 border border-indigo-100 rounded-2xl shadow-sm flex flex-col items-center py-6 px-2 hover:shadow-lg transition group"
          >
            <div className="mb-2">{stat.icon}</div>
            <div className="text-3xl md:text-4xl font-extrabold text-indigo-900 group-hover:text-fuchsia-600 transition tabular-nums">
              <AnimatedNumber value={stat.value} />
            </div>
            <div className="text-xs md:text-sm text-indigo-500 group-hover:text-indigo-800 font-medium tracking-wide mt-1 uppercase">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Minimalistyczna animacja liczb
function AnimatedNumber({ value }) {
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
  return <span>{display}</span>;
}
