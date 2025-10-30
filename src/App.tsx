import { useEffect,useState } from "react";
import SpotifyLogin from "./components/SpotifyLogin";



export default function App() {
  const [code, setcode] = useState<string | null>(null);

  useEffect(() => {
    //const hash = window.location.hash;
    const params = new URLSearchParams(window.location.search)
    const storedCode = window.localStorage.getItem("code");

    if(!storedCode) {

      const codeParam = params.get("code");

      if(codeParam) {
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
