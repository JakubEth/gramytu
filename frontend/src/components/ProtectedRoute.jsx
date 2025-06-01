import { useEffect } from "react";

export default function ProtectedRoute({ user, onRequireLogin, children }) {
  useEffect(() => {
    if (!user && onRequireLogin) onRequireLogin();
  }, [user, onRequireLogin]);

  if (!user) return null; // Nie pokazuj nic jeśli nie zalogowany
  return children;
}
