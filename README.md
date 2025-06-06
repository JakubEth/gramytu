Architektura rozwiązania – GramyTu

Frontend
Hosting: Netlify
- React (SPA)
- Tailwind CSS (stylowanie)
- react-router-dom (routing)
- Komunikacja z backendem przez REST API (fetch)
- Autoryzacja: JWT (localStorage)
- Struktura:
  - src/components/ – wszystkie komponenty React
  - src/App.jsx – główny komponent z routingiem
  - src/assets/ – pliki statyczne

Backend
Hosting: Render Web Service
- Node.js + Express
- Mongoose (ODM)
- MongoDB Atlas (baza danych)
- JWT (autoryzacja)
- CORS, helmet (middleware bezpieczeństwa)
- Multer (upload avatarów)
- faker.js (seedowanie danych)
- Cloudinary API (upload i optymalizacja obrazów)
- Giphy API (wyszukiwanie i wyświetlanie gifów)
- Struktura:
  - models.js – schematy Mongoose
  - index.js – główny plik serwera i API
  - seed.js – skrypt do generowania danych

Baza danych
- Kolekcje: users, events, userreviews, useractivities, chatmessages, notifications

Przepływ danych
- Frontend (React) ←→ Backend (Express API) ←→ MongoDB Atlas
- Backend ←→ Cloudinary API (obrazy)
- Backend ←→ Giphy API (gify)

Zewnętrzne API
- Cloudinary API – upload, przechowywanie i optymalizacja plików graficznych
- Giphy API – wyszukiwanie i wyświetlanie gifów

DevOps / CI/CD / Integracja
- Cały kod znajduje się w repozytorium GitHub
- Testy uruchamiane są lokalnie przed pushem
- Po pushu do GitHub:
  - Automatyczny deployment backendu na Render
  - Automatyczny deployment frontend na Netlify
- Zmiany w repozytorium automatycznie aktualizują aplikację produkcyjną
