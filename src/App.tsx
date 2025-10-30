import { useEffect,useState } from "react";
import SpotifyLogin from "./components/SpotifyLogin";



export default function App() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const storedToken = window.localStorage.getItem("token");

    if(!storedToken && hash) {
      const _token = hash.substring(1).split("&").find((param) => param.startsWith("access_token"))?.split("=")[1];

      //window.location.hash="";

      if(_token) {
        window.localStorage.setItem("token", _token);
        setToken(_token);

      }
    } else if (storedToken) {
      setToken(storedToken);
    }

  }, []);

  const handleLogout = () => {
    setToken(null);
    window.localStorage.removeItem("token");

  };

  if(!token){
    return <SpotifyLogin />;

  }


  return(
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white">
      <h1 className="text-3xl font-bold mb-4"> 🎧 Logged in to Spotify! </h1>
      <button onClick={handleLogout}
      className="bg-red-500 px-6 py-2 rounded-md hover:bg-red-600 transition">
        Logout
      </button>
    </div>
  )
}
