// src/components/UserProfile.jsx
export default function UserProfile({ user, onClose }) {
    // Domyślne zdjęcie profilowe (możesz podmienić na własne)
    const avatarUrl = user?.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.username || "U") + "&background=E0E7FF&color=3730A3&bold=true";
  
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col items-center relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          aria-label="Zamknij"
        >
          ×
        </button>
        <img src={avatarUrl} alt="Profil" className="w-20 h-20 rounded-full mb-4 border-4 border-indigo-100 object-cover" />
        <div className="font-bold text-xl text-indigo-800 mb-2">{user?.username || "Użytkownik"}</div>
        {/* Tu możesz dodać więcej danych np. email, bio, social itp. */}
        <div className="text-sm text-gray-500">ID: {user?._id}</div>
        <div className="mt-4 text-xs text-gray-400">Więcej informacji wkrótce...</div>
      </div>
    );
  }
  