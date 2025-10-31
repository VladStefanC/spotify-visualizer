import { useEffect, useState } from "react";
import SpotifyLogin from "../features/auth/SpotifyLogin";
import { exchangeCodeForToken } from "../features/auth/api";
import { getUserProfile } from "../features/profile/api";

type SpotifyProfile = {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: { spotify: string };
  followers: { href: string; total: number };
  href: string;
  id: string;
  images?: { url: string }[];
  product: string;
  type: string;
  uri: string;
};

export default function App() {
  const [authCode, setAuthCode] = useState<string | null>(null);
  const [accessToken, setaccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeFromUrl = params.get("code");
    const storedToken = window.localStorage.getItem("spotify_access_token");

    if (storedToken) {
      setaccessToken(storedToken);
      return;
    }

    if (codeFromUrl) {
      setAuthCode(codeFromUrl);
    }
  }, []);

  useEffect(() => {
    if (!authCode || accessToken) return;

    const fetchToken = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await exchangeCodeForToken(authCode);
        setaccessToken(token);
        window.localStorage.setItem("spotify_access_token", token);
        setAuthCode(null);
        window.history.replaceState({}, document.title, "/");
      } catch (err) {
        console.error("Failed to exchange code", err);
        setError("Could not complete Spotify Login. Try again.");
        window.localStorage.removeItem("spotify_code_verifier");
        setAuthCode(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchToken();
  }, [authCode, accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    const fetchProfile = async () => {
      setIsLoading(false);
      setError(null);
      try {
        const data = await getUserProfile(accessToken);
        if (!data) throw new Error("Profile API returned empty reuslt");
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Could not load profile. Please log in again.");
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [accessToken]);

  const handleLogout = () => {
    window.localStorage.removeItem("spotify_access_token");
    window.localStorage.removeItem("spotify_code_verifier");
    setaccessToken(null);
    setProfile(null);
    setAuthCode(null);
  };


  if (!accessToken) {
    return <SpotifyLogin />;
  }

  if (isLoading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-900 text-white">
        <p className="mb-4 text-red-400">{error}</p>
        <button
          onClick={handleLogout}
          className="bg-green-500 px-6 py-2 rounded-md hover:bg-green-600 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

return (
  <div className="relative min-h-screen bg-neutral-900 text-white">
    <div className="absolute top-8 right-8 flex items-center gap-6 bg-neutral-800/70 px-6 py-4 rounded-xl shadow-lg backdrop-blur">
      {profile?.images?.[0]?.url && (
        <img
          src={profile.images[0].url}
          alt={profile.display_name}
          className="w-20 h-20 rounded-full border-2 border-green-500 object-cover"
        />
      )}

      <div className="text-right space-y-1">
        <h1 className="text-xl font-semibold">{profile?.display_name ?? "Unknown listener"}</h1>
        <p className="text-sm text-gray-300">{profile?.email}</p>
        <p className="text-xs uppercase tracking-wide text-gray-400">
          {profile?.product?.toLowerCase() === "premium" ? "Spotify Premium" : "Spotify"}
        </p>
        <button
          onClick={handleLogout}
          className="mt-3 bg-red-500 px-4 py-1.5 rounded-md text-sm hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>

    {/* add the rest of your visualizer layout here */}
  </div>
);

}
