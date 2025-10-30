import { loginUrl } from "../spotifyAuth";
import { FaSpotify } from "react-icons/fa";

export default function SpotifyLogin() {
    console.log("Spotify login URL:", loginUrl)
  return (
    <div className="flex items-center justify-center h-screen bg-neutral-900 text-white">
      <a
        href={loginUrl}
        className="inline-flex items-center justify-center  gap-3 bg-green-500 text-lg font-semibold px-6 py-3 rounded-full hover:bg-green-600 transition"
      >
        <FaSpotify className="text-2xl" />
        Log in with Spotify
        
      </a>
    </div>
  
  );
}
