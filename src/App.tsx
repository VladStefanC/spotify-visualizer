import { useEffect, useState } from "react";
import SpotifyLogin from "./components/SpotifyLogin";
import { getUserProfile } from "./spotifyApi";


interface SpotifyUser {
  display_name : string;
  country : string;
  images : {url :string} [];

}

export default function App() {
  const [code, setcode] = useState<string | null>(null);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  async function handleFetchProfile() {
    if (!token) return;
    const data = await getUserProfile(token);
    setUser(data);
  }

  useEffect(() => {
    //const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search);
    const storedCode = window.localStorage.getItem("code");

    if (!storedCode) {
      const codeParam = params.get("code");

      if (codeParam) {
        window.localStorage.setItem("code", codeParam);
        setcode(codeParam);

        window.history.replaceState({}, document.title, "/");
      }
    } else {
      setcode(storedCode);
    }
  }, []);

  const handleLogout = () => {
    setcode(null);
    window.localStorage.removeItem("code");
  };

  if (!code) {
    return <SpotifyLogin />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white">
      <h1 className="text-3xl font-bold mb-4"> 🎧 Logged in to Spotify! </h1>
      <button
        onClick={handleFetchProfile}
        className="bg-orange-500 px-6 py-2 rounded-md hover:bg-orange-600 transition"
      >
        Load Profile
      </button>
      {user && (
        <div>
          <h2>{user.display_name}</h2>
          <h3>{user.country}</h3>
          <img src={user.images?.[0]?.url} alt="Profile" width={100} />
        </div>
      )}
      <button
        onClick={handleLogout}
        className="bg-red-500 px-6 py-2 rounded-md hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
}
