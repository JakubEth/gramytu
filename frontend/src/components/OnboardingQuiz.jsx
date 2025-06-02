import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const preferenceQuestions = [
  {
    question: "Czy jesteś pełnoletni?",
    type: "isAdult",
    options: ["Tak", "Nie"],
    required: true
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
    ]
  },
  {
    question: "Wolisz wydarzenia:",
    type: "preferredEventSize",
    options: ["Kameralne (do 10 osób)", "Średnie (10-30 osób)", "Duże (30+ osób)"]
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
    multi: true
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
    multi: true
  },
  {
    question: "Wydarzenia online czy offline?",
    type: "preferredMode",
    options: ["Online", "Offline", "Bez znaczenia"]
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

export default function OnboardingQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const token = location.state?.token;

  const [step, setStep] = useState(0);
  const [prefAnswers, setPrefAnswers] = useState({});
  const [mbtiAnswers, setMbtiAnswers] = useState(Array(mbtiQuestions.length).fill(null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Obsługa odpowiedzi preferencyjnych
  function handlePrefSelect(type, value, multi) {
    setPrefAnswers(a => {
      if (multi) {
        const prev = a[type] || [];
        return { ...a, [type]: prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value] };
      } else {
        return { ...a, [type]: value };
      }
    });
    setError("");
  }

  function nextPref() {
    if (preferenceQuestions[step].required && !prefAnswers[preferenceQuestions[step].type]) {
      setError("To pytanie jest obowiązkowe!");
      return;
    }
    setStep(s => s + 1);
  }

  // Obsługa odpowiedzi MBTI
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

  // Algorytm MBTI (prosty, do rozbudowy)
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
    const mbtiType = calculateMBTI();
    try {
      const res = await fetch(`https://gramytu.onrender.com/users/${user._id}/preferences`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...prefAnswers, mbtiType, isAdult: prefAnswers.isAdult === "Tak" })
      });
      // Niezależnie od wyniku, przekieruj do home
      navigate("/");
    } catch {
      setError("Błąd połączenia z serwerem.");
      setLoading(false);
    }
  }

  function handleSkip() {
    navigate("/");
  }

  // Render preferencji
  if (step < preferenceQuestions.length) {
    const q = preferenceQuestions[step];
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-indigo-700 text-center">Twój profil wydarzeń</h2>
          <div>
            <div className="font-semibold mb-2">{q.question}</div>
            <div className="flex flex-col gap-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className={`px-4 py-2 rounded-lg border transition ${
                    q.multi
                      ? (prefAnswers[q.type] || []).includes(opt)
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-50"
                      : prefAnswers[q.type] === opt
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-50"
                  }`}
                  onClick={() => handlePrefSelect(q.type, opt, q.multi)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-4 mt-4">
            <button
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
              onClick={nextPref}
              disabled={loading}
            >
              Dalej
            </button>
            <button className="text-gray-500 hover:text-indigo-700" onClick={handleSkip} disabled={loading}>
              Pomiń, zrobię później
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render MBTI
  const mbtiStep = step - preferenceQuestions.length;
  if (mbtiStep < mbtiQuestions.length) {
    const q = mbtiQuestions[mbtiStep];
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-indigo-700 text-center">Test osobowości</h2>
          <div>
            <div className="font-semibold mb-2">{q.question}</div>
            <div className="flex flex-col gap-2">
              {[1,2,3,4,5].map(val => (
                <button
                  key={val}
                  className={`px-4 py-2 rounded-lg border transition ${
                    mbtiAnswers[mbtiStep] === val
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-50"
                  }`}
                  onClick={() => handleMbtiSelect(mbtiStep, val)}
                >
                  {val === 1 ? "Zdecydowanie NIE" : val === 5 ? "Zdecydowanie TAK" : val}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <div className="flex gap-4 mt-4">
            <button
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
              onClick={mbtiStep === mbtiQuestions.length - 1 ? submitAll : nextMbti}
              disabled={loading}
            >
              {mbtiStep === mbtiQuestions.length - 1 ? "Wyślij" : "Dalej"}
            </button>
            <button className="text-gray-500 hover:text-indigo-700" onClick={handleSkip} disabled={loading}>
              Pomiń, zrobię później
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Po quizie (możesz dodać spinner lub przekierować do home)
  return null;
}
