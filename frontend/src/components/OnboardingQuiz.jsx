import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Przykładowa autoryzacja (dostosuj do swojego systemu!)
function useAuth() {
  return !!localStorage.getItem("token");
}

const preferenceQuestions = [
  {
    question: "Czy jesteś pełnoletni?",
    type: "isAdult",
    options: ["Tak", "Nie"],
    required: true,
    multi: false
  },
  {
    question: "Które z tych wydarzeń wybierasz najchętniej?",
    type: "favoriteEventType",
    options: [
      "Turniej planszówkowy",
      "Turniej e-sportowy",
      "Wspólna gra w piłkę/kosza",
      "Warsztaty kreatywne",
      "Spotkanie networkingowe",
      "Wydarzenie charytatywne",
      "Wykład lub seminarium",
      "Inne"
    ],
    multi: true,
    max: 3
  },
  {
    question: "Wolisz wydarzenia:",
    type: "preferredEventSize",
    options: ["Kameralne (do 10 osób)", "Średnie (10-30 osób)", "Duże (30+ osób)"],
    multi: false
  },
  {
    question: "Które kategorie eventów najbardziej Cię interesują?",
    type: "preferredCategories",
    options: [
      "Gry planszowe",
      "Gry komputerowe",
      "Sport/fizyczne",
      "Networking/biznes",
      "Kultura/sztuka",
      "Nauka/technologia",
      "Inne"
    ],
    multi: true,
    max: 4
  },
  {
    question: "Jakie tagi najlepiej opisują Twoje zainteresowania?",
    type: "preferredTags",
    options: [
      "strategia",
      "przygodowe",
      "sport",
      "edukacja",
      "muzyka",
      "startup",
      "wolontariat",
      "inne"
    ],
    multi: true,
    max: 5
  },
  {
    question: "Wydarzenia online czy offline?",
    type: "preferredMode",
    options: ["Online", "Offline", "Bez znaczenia"],
    multi: false
  }
];

const mbtiQuestions = [
  { question: "Lubię spędzać czas w dużych grupach ludzi.", dimension: "EI" },
  { question: "Często podejmuję decyzje na podstawie logiki, a nie uczuć.", dimension: "TF" },
  { question: "Wolę mieć wszystko zaplanowane niż działać spontanicznie.", dimension: "JP" },
  { question: "Często rozważam różne możliwości, zanim podejmę decyzję.", dimension: "SN" },
  { question: "Czuję się naładowany po spotkaniach z ludźmi.", dimension: "EI" },
  { question: "Łatwo rozpoznaję emocje innych.", dimension: "TF" },
  { question: "Wolę trzymać się faktów niż teorii.", dimension: "SN" },
  { question: "Lubię mieć jasno określone zasady i struktury.", dimension: "JP" }
];

// Opisy typów MBTI
const mbtiDescriptions = {
  ENFP: "Inspirator – kreatywny, entuzjastyczny, motywuje innych do działania.",
  ISTJ: "Logistyk – zorganizowany, odpowiedzialny, praktyczny.",
  INFJ: "Doradca – wrażliwy, lojalny, idealista.",
  INTJ: "Architekt – niezależny, analityczny, wizjoner.",
  INFP: "Mediator – empatyczny, lojalny, idealista.",
  ENFJ: "Protagonista – charyzmatyczny, opiekuńczy, inspiruje innych.",
  ENTJ: "Dowódca – zdecydowany, lider, strateg.",
  ENTP: "Dyskutant – pomysłowy, błyskotliwy, lubi debatować.",
  ISFJ: "Obrońca – lojalny, troskliwy, sumienny.",
  ISFP: "Poszukiwacz przygód – wrażliwy, artystyczny, spontaniczny.",
  ISTP: "Wirtuoz – praktyczny, elastyczny, lubi eksperymentować.",
  ESTP: "Przedsiębiorca – energiczny, towarzyski, praktyczny.",
  ESTJ: "Dyrektor – zorganizowany, odpowiedzialny, konkretny.",
  ESFJ: "Konsul – serdeczny, opiekuńczy, społeczny.",
  ESFP: "Animator – entuzjastyczny, spontaniczny, lubi zabawę.",
  // Dodaj pozostałe jeśli chcesz
};

export default function OnboardingQuiz({ onUserUpdate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const token = location.state?.token;

  // Ochrona trasy (tylko dla zalogowanych)
  const isAuth = useAuth();
  useEffect(() => {
    if (!isAuth) navigate("/login", { replace: true });
  }, [isAuth, navigate]);

  const [step, setStep] = useState(0);
  const [prefAnswers, setPrefAnswers] = useState({});
  const [mbtiAnswers, setMbtiAnswers] = useState(Array(mbtiQuestions.length).fill(null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mbtiType, setMbtiType] = useState(null);

  function handlePrefSelect(type, value, multi, max) {
    setPrefAnswers(a => {
      if (multi) {
        const prev = a[type] || [];
        if (prev.includes(value)) {
          return { ...a, [type]: prev.filter(v => v !== value) };
        } else if (!max || prev.length < max) {
          return { ...a, [type]: [...prev, value] };
        } else {
          return a;
        }
      } else {
        return { ...a, [type]: value };
      }
    });
    setError("");
  }

  function nextPref() {
    const q = preferenceQuestions[step];
    const val = prefAnswers[q.type];
    if (q.required && (!val || (q.multi && val.length === 0))) {
      setError("To pytanie jest obowiązkowe!");
      return;
    }
    setStep(s => s + 1);
  }

  function handleMbtiSelect(idx, value) {
    const newMbti = [...mbtiAnswers];
    newMbti[idx] = value;
    setMbtiAnswers(newMbti);
    setError("");
  }

  function nextMbti() {
    if (mbtiAnswers[step - preferenceQuestions.length] === null) {
      setError("Wybierz odpowiedź!");
      return;
    }
    setStep(s => s + 1);
  }

  function calculateMBTI() {
    let EI = 0, SN = 0, TF = 0, JP = 0;
    mbtiQuestions.forEach((q, i) => {
      const val = mbtiAnswers[i] ?? 3;
      if (q.dimension === "EI") EI += val - 3;
      if (q.dimension === "SN") SN += val - 3;
      if (q.dimension === "TF") TF += val - 3;
      if (q.dimension === "JP") JP += val - 3;
    });
    return `${EI >= 0 ? "E" : "I"}${SN >= 0 ? "N" : "S"}${TF >= 0 ? "T" : "F"}${JP >= 0 ? "J" : "P"}`;
  }

  async function submitAll() {
    setLoading(true);
    setError("");
    const mbti = calculateMBTI();
    setMbtiType(mbti); // zapisz typ, żeby pokazać na ekranie sukcesu
    try {
      const body = {
        ...prefAnswers,
        mbtiType: mbti,
        isAdult: prefAnswers.isAdult === "Tak"
      };
      if (Array.isArray(body.preferredCategories) && body.preferredCategories.length === 0) {
        delete body.preferredCategories;
      }
      if (Array.isArray(body.preferredTags) && body.preferredTags.length === 0) {
        delete body.preferredTags;
      }

      const res = await fetch(`https://gramytu.onrender.com/users/${user._id}/preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Błąd zapisu");
      if (onUserUpdate) await onUserUpdate();
      setStep(preferenceQuestions.length + mbtiQuestions.length); // przejdź do ekranu sukcesu
      setLoading(false);
    } catch {
      setError("Błąd połączenia z serwerem.");
      setLoading(false);
    }
  }

  async function handleSkip() {
    if (onUserUpdate) await onUserUpdate();
    navigate("/");
  }

  const gradientBg = "bg-gradient-to-br from-indigo-400 via-indigo-100 to-amber-100";
  const stepTotal = preferenceQuestions.length + mbtiQuestions.length;
  const progress = Math.round((step + 1) / stepTotal * 100);

  // Preferencje
  if (step < preferenceQuestions.length) {
    const q = preferenceQuestions[step];
    const selected = prefAnswers[q.type] || (q.multi ? [] : "");
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center ${gradientBg} transition-all duration-700`}>
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-200">
          <div className="h-2 bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex-1 flex flex-col justify-center items-center w-full">
          <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-800 text-center drop-shadow mb-12 animate-fade-in">
            {step === 0 ? "Zacznijmy od kilku pytań!" : "Dalej! Poznajmy Twoje preferencje"}
          </h2>
          <div className="w-full max-w-2xl flex flex-col items-center gap-8 animate-slide-up">
            <div className="text-2xl md:text-3xl font-bold text-indigo-700 text-center">{q.question}</div>
            <div className="flex flex-wrap justify-center gap-4 w-full">
              {q.options.map((opt, i) => {
                const isSelected = q.multi ? selected.includes(opt) : selected === opt;
                const isDisabled = q.multi && !isSelected && selected.length >= (q.max || 99);
                return (
                  <button
                    key={i}
                    className={`
                      px-8 py-4 rounded-2xl shadow-lg text-lg font-semibold transition
                      border-2 border-indigo-200
                      ${isSelected
                        ? "bg-indigo-600 text-white scale-105"
                        : isDisabled
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : "bg-white hover:bg-indigo-100"
                      }
                    `}
                    onClick={() => !isDisabled && handlePrefSelect(q.type, opt, q.multi, q.max)}
                    disabled={isDisabled}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {q.multi && (
              <div className="text-sm text-gray-500 text-center">
                Możesz wybrać maksymalnie {q.max} opcji ({selected.length}/{q.max})
              </div>
            )}
            {error && <div className="text-red-600 text-lg text-center">{error}</div>}
            <div className="flex gap-6 mt-8">
              <button
                className="bg-indigo-700 hover:bg-indigo-800 text-white px-8 py-3 rounded-2xl text-xl font-bold shadow transition"
                onClick={nextPref}
                disabled={loading}
              >
                Dalej
              </button>
              <button
                className="bg-white border-2 border-indigo-300 text-indigo-700 px-8 py-3 rounded-2xl text-xl font-semibold shadow hover:bg-indigo-50 transition"
                onClick={handleSkip}
                disabled={loading}
              >
                Pomiń, zrobię później
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // MBTI
  const mbtiStep = step - preferenceQuestions.length;
  if (mbtiStep < mbtiQuestions.length) {
    const q = mbtiQuestions[mbtiStep];
    return (
      <div className={`min-h-screen w-full flex flex-col items-center justify-center ${gradientBg} transition-all duration-700`}>
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-200">
          <div className="h-2 bg-amber-400 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex-1 flex flex-col justify-center items-center w-full">
          <h2 className="text-4xl md:text-5xl font-extrabold text-indigo-800 text-center drop-shadow mb-12 animate-fade-in">
            Test osobowości
          </h2>
          <div className="w-full max-w-2xl flex flex-col items-center gap-8 animate-slide-up">
            <div className="text-2xl md:text-3xl font-bold text-indigo-700 text-center">{q.question}</div>
            <div className="flex flex-wrap justify-center gap-4 w-full">
              {[1,2,3,4,5].map(val => (
                <button
                  key={val}
                  className={`
                    px-8 py-4 rounded-2xl shadow-lg text-lg font-semibold transition
                    border-2 border-amber-200
                    ${mbtiAnswers[mbtiStep] === val
                      ? "bg-amber-400 text-indigo-900 scale-105"
                      : "bg-white hover:bg-amber-100"
                    }
                  `}
                  onClick={() => handleMbtiSelect(mbtiStep, val)}
                >
                  {val === 1 ? "Zdecydowanie NIE" : val === 5 ? "Zdecydowanie TAK" : val}
                </button>
              ))}
            </div>
            {error && <div className="text-red-600 text-lg text-center">{error}</div>}
            <div className="flex gap-6 mt-8">
              <button
                className="bg-amber-400 hover:bg-amber-500 text-indigo-900 px-8 py-3 rounded-2xl text-xl font-bold shadow transition"
                onClick={mbtiStep === mbtiQuestions.length - 1 ? submitAll : nextMbti}
                disabled={loading}
              >
                {mbtiStep === mbtiQuestions.length - 1 ? "Wyślij" : "Dalej"}
              </button>
              <button
                className="bg-white border-2 border-amber-300 text-indigo-700 px-8 py-3 rounded-2xl text-xl font-semibold shadow hover:bg-amber-50 transition"
                onClick={handleSkip}
                disabled={loading}
              >
                Pomiń, zrobię później
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EKRAN SUKCESU
  if (step === preferenceQuestions.length + mbtiQuestions.length && mbtiType) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-400 via-indigo-100 to-amber-100">
        <div className="bg-white rounded-3xl shadow-2xl p-10 flex flex-col items-center max-w-xl w-full">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">Gratulacje!</h1>
          <p className="text-lg text-gray-700 mb-6">Ukończyłeś quiz onboardingowy.</p>
          <div className="text-2xl font-extrabold text-amber-500 mb-2">
            Twój typ osobowości: <span className="text-indigo-700">{mbtiType}</span>
          </div>
          <div className="text-md text-gray-600 text-center mb-6">
            {mbtiDescriptions[mbtiType] || "Jesteś wyjątkowy! Odkryj wydarzenia dopasowane do Twojej osobowości."}
          </div>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl text-lg font-bold shadow transition"
            onClick={() => navigate("/")}
          >
            Przejdź do strony głównej
          </button>
          <div className="text-xs text-gray-400 mt-4">(Możesz wrócić do quizu z poziomu profilu)</div>
        </div>
      </div>
    );
  }

  return null;
}
