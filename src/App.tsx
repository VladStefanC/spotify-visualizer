import { useEffect,useState } from "react";
import SpotifyLogin from "./components/SpotifyLogin";



export default function App() {
  const [code, setcode] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash;
    const storedcode = window.localStorage.getItem("code");

    if(!storedcode && hash) {
      const _code = hash.substring(1).split("&").find((param) => param.startsWith("access_code"))?.split("=")[1];

      window.location.hash= "";

      if(_code) {
        window.localStorage.setItem("code", _code);
        setcode(_code);

      }
    } else if (storedcode) {
      setcode(storedcode);
    }

  }, []);

  const handleLogout = () => {
    setcode(null);
    window.localStorage.removeItem("code");

  };

  if(!code){
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
