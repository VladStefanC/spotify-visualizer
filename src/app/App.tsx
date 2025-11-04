import { useEffect, useState } from "react";
import SpotifyLogin from "../features/auth/SpotifyLogin";
import { exchangeCodeForToken } from "../features/auth/api";
import { getUserProfile } from "../features/profile/api";
import {
  getCurrentlyPlaying, type CurrentPlayback,
} from "../features/auth/api/spotifyPlayer";

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
  const [nowPlaying, setNowPlaying] = useState<CurrentPlayback | null>(null);
  const isPaused = nowPlaying ? !nowPlaying.isPlaying : true;

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

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;

    const fetchPlayback = async () => {
      try {
        const playback = await getCurrentlyPlaying(accessToken);
        if (isMounted) {
          setNowPlaying(playback);
        }
      } catch (err) {
        console.error("Failed to fetch playback", err);
      }
    };

    fetchPlayback();
    const timer = window.setInterval(fetchPlayback, 5000); // Refresh every 5 seconds

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
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
          <h1 className="text-xl font-semibold">
            {profile?.display_name ?? "Unknown listener"}
          </h1>
          <p className="text-sm text-gray-300">{profile?.email}</p>
          <p className="text-xs uppercase tracking-wide text-gray-400">
            {profile?.product?.toLowerCase() === "premium"
              ? "Spotify Premium"
              : "Spotify"}
          </p>
          <button
            onClick={handleLogout}
            className="mt-3 bg-red-500 px-4 py-1.5 rounded-md text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Player visualizer */}
      <div className="absolute bottom-10 left-1/2 w-[min(90vw,960px)] -translate-x-1/2">
        {/* relative -> anchors absolutely positioned highlights; overflow-hidden -> keeps the glow inside rounded edges; rounded-3xl/border/bg/... -> glass look; px-10/py-8 -> inner padding */}
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 px-6 py-1 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {/* pointer-events-none so glow never blocks clicks; absolute inset-0 stretches the layer; opacity-60 softens intensity */}
          <div className="pointer-events-none absolute inset-0 opacity-60">
            {/* left emerald blob adds warm highlight */}
            <div className="absolute -left-24 top-0 h-44 w-44 rounded-full bg-emerald-400/40 blur-3xl" />
            {/* right purple blob balances the palette */}
            <div className="absolute right-0 top-12 h-36 w-36 rounded-full bg-purple-500/30 blur-2xl" />
            {/* bottom ellipse imitates refracted light */}
            <div className="absolute -bottom-40 left-1/2 h-80 w-[120%] -translate-x-1/2 rounded-[50%] bg-white/10 blur-3xl" />
          </div>

          {/* z-10 keeps text above highlights; spacing handled below */}
          <div className="relative z-10">
            {/* label text for playback state */}
            <p className="text-xs uppercase tracking-wide text-gray-300">
              {isPaused ? "Playback Paused" : "Now Playing"}
            </p>

            {nowPlaying ? (
              <>
                {/* song title */}
                <h2 className="mt-4 text-2xl font-semibold">
                  {nowPlaying.trackName}
                </h2>
                {/* artist list */}
                <p className="mt-1 text-sm text-gray-200">
                  {nowPlaying.artistNames}
                </p>
                {/* album name */}
                <p className="mt-1 text-sm text-gray-400">
                  {nowPlaying.albumName}
                </p>
              </>
            ) : (
              /* fallback when nothing plays */
              <p className="mt-4 text-sm text-gray-300">
                No track is playing
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 left-[35%] -translate-x-1/2 -translate-y-1/2">
        <img
          src={nowPlaying?.albumImage ?? ""}
          alt={nowPlaying?.trackName ?? ""}
          className="w-100 h-100 shadow-2xl object-cover"
        />
      </div>
      {/* add the rest of your visualizer layout here */}
    </div>
  );
}
