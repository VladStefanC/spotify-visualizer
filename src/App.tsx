import { useEffect, useState } from "react";
import SpotifyLogin from "./components/SpotifyLogin";
import { exchangeCodeForToken } from "./utils/spotifyToken";
import { getUserProfile } from "./spotifyApi";

interface SpotifyUser {
  display_name: string;
  country: string;
  email?: string;
  id: string;
  images: { url: string }[];
  product?: string;
}

export default function App() {

  const [code, setCode] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user,setUser] = useState<SpotifyUser | null>(null);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get("code");
    const storedToken = localStorage.getItem("code");

    if (storedToken) {
      setToken(storedToken);
    } else if (codeParam) {
      exchangeCodeForToken(codeParam).then((acces_token) => {
        if (acces_token) { 
          localStorage.setItem("token", acces_token);
          setToken(acces_token);

          window.history.replaceState({}, document.title, "/");

        }
      })
      .catch((err) => console.error("Token exchange failed: ", err));
    }
  }, []);

  useEffect(() => {
    if(!token) return;

    getUserProfile(token).then((profile) => {
      if(profile) {
        setUser(profile);
        console.log("User profile:", profile);
      }
    });
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("code");
    setCode(null);
  };

  if (!code) {
    return <SpotifyLogin />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white">
      <h1 className="text-3xl font-bold mb-4">🎧 Welcome to Spotify Vinyl Visualizer</h1>
      {user ? (
        <>
          <img 
              src = {user.images?.[0]?.url}
              alt = "Profile"
              className="w-32 h-32 rounded-full mb-4"
        />
        <h2 className="text-x1 font-semibold">{user.display_name}</h2>
        <p className="text-gray-400">{user.country}</p>
        </>      
      ) : (
        <p>Loading your profile ... </p>
      )}

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
