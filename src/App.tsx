import { useEffect, useState } from "react";
import SpotifyLogin from "./features/auth/SpotifyLogin";


export default function App() {
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    const storedCode = localStorage.getItem("code");

    if (storedCode) {
      setCode(storedCode);
    } else if (codeParam) {
      localStorage.setItem("code", codeParam);
      setCode(codeParam);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("code");
    setCode(null);
  };

  if (!code) {
    return <SpotifyLogin />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white">
      <h1 className="text-3xl font-bold mb-4">🎧 Logged in (authorization code detected)</h1>
      <p className="max-w-xl text-sm text-gray-400 mb-6 text-center">
        <span className="font-semibold">Auth code</span> (temporary, for token exchange only):
      </p>
      <pre className="max-w-xl break-all whitespace-pre-wrap bg-neutral-800 p-3 rounded-md mb-8 text-xs">
        {code}
      </pre>
      <button
        onClick={handleLogout}
        className="bg-red-500 px-6 py-2 rounded-md hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
