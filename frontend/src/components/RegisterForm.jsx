import { useState } from "react";

export default function RegisterForm({ onSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("https://gramytu.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      onSuccess && onSuccess(data.user);
    } else {
      setError(data.error || "Błąd rejestracji");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xs mx-auto bg-white rounded-xl shadow p-6 flex flex-col gap-4">
      <h2 className="text-xl font-bold text-indigo-700 text-center">Rejestracja</h2>
      <input
        name="username"
        placeholder="Nick"
        value={form.username}
        onChange={handleChange}
        required
        className="px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none"
      />
      <input
        name="password"
        type="password"
        placeholder="Hasło"
        value={form.password}
        onChange={handleChange}
        required
        className="px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none"
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition"
      >
        {loading ? "Rejestruję..." : "Zarejestruj się"}
      </button>
    </form>
  );
}
