import { buildLoginUrl } from "../api";
import { FaSpotify } from "react-icons/fa";
import { createCodeChallenge, createCodeVerifier } from "../utils/pkce";

export default function SpotifyLogin() {

  const handleLogin = async() => {
    const verifier = createCodeVerifier();
    window.localStorage.setItem("spotify_code_verifier", verifier)

    const challenge = await createCodeChallenge(verifier);
    window.location.href = buildLoginUrl(challenge);
  }

  return (
    <div className="flex items-center justify-center h-screen bg-neutral-900 text-white">
      <button
        onClick={handleLogin}
        className="inline-flex items-center justify-center gap-3 bg-green-500 text-lg font-semibold px-6 py-3 rounded-full hover:bg-green-600 transition"
      >
        <FaSpotify className="text-2xl" />
        Log in with Spotify
      </button>
    </div>
  );
}
