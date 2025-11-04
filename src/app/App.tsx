import { useEffect, useState, useRef, type CSSProperties } from "react";
import SpotifyLogin from "../features/auth/SpotifyLogin";
import { exchangeCodeForToken } from "../features/auth/api";
import { getUserProfile } from "../features/profile/api";
import {
  getCurrentlyPlaying,
  type CurrentPlayback,
} from "../features/auth/api/spotifyPlayer";
import { extractPallete } from "../features/auth/utils/pallete";
import AnimatedBackground from "../features/player/components/AnimatedBackground";

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

  const [pallete, setPallete] = useState<string[] | null>(null);
  const palleteCache = useRef(new Map<string, string[]>());

  useEffect(() => {
    if (!nowPlaying?.trackId || !nowPlaying.albumImage) {
      setPallete(null);
      return;
    }

    const cacheKey = nowPlaying.trackId;
    const cached = palleteCache.current.get(cacheKey);
    if (cached) {
      setPallete(cached);
      return;
    }

    let isCancelled = false;

    extractPallete(nowPlaying.albumImage)
      .then((colors) => {
        if (isCancelled) return;
        setPallete(colors);
        palleteCache.current.set(cacheKey, colors);
      })
      .catch((err) => {
        console.error("Failed to extract palette", err);
        if (!isCancelled) setPallete(null);
      });

    return () => {
      isCancelled = true;
    };
  }, [nowPlaying?.trackId, nowPlaying?.albumImage]);

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
    const timer = window.setInterval(fetchPlayback, 1500); // Refresh every 1.5 seconds

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

  const baseBackground =
    "bg-gradient-to-br from-black via-zinc-950 to-neutral-900";
  const paletteVars = pallete
    ? {
        "--wave-a": pallete[0],
        "--wave-b": pallete[1] ?? pallete[0],
        "--wave-c": pallete[2] ?? pallete[1] ?? pallete[0],
      }
    : undefined;

  if (!accessToken) {
    return <SpotifyLogin />;
  }


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
    <div
      className={`relative min-h-screen text-white ${baseBackground}`}
      style={paletteVars as CSSProperties}
    >
      {pallete ? <AnimatedBackground /> : null}
      <div className="group absolute top-8 right-8 flex items-center gap-4">
        {profile?.images?.[0]?.url && (
          <img
            src={profile.images[0].url}
            alt={profile.display_name}
            className="h-14 w-14 rounded-full border border-green-500 object-cover transition duration-300 group-hover:ring-2 group-hover:ring-green-400"
          />
        )}

        <div
          className="flex flex-col items-end gap-1 rounded-xl border border-white/10 bg-neutral-800/80 px-6 py-4 shadow-lg backdrop-blur
          opacity-0 translate-y-3 pointer-events-none transition-all duration-500 ease-out
          group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto"
        >
          <h1 className="text-lg font-semibold">
            {profile?.display_name ?? "Unknown listener"}
          </h1>
          <button
            onClick={handleLogout}
            className="mt-2 bg-red-500 px-4 py-1 rounded-md text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Player visualizer */}
      <div className="group absolute bottom-10 left-1/2 w-[min(90vw,960px)] -translate-x-1/2">
        <div className="mx-auto mb-6 h-1.5 w-24 rounded-full bg-white/5 transition-all group-hover:bg-white" />

        {/* relative -> anchors absolutely positioned highlights; overflow-hidden -> keeps the glow inside rounded edges; rounded-3xl/border/bg/... -> glass look; px-10/py-8 -> inner padding */}
        <div
          className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 px-6 py-1 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45)] backdrop-blur-xl
        opacity-0 scale translate-y-6 pointer-events-none transition-all duration-1000 ease-out group-hover:opacity-100 group-hover:translate-y-0 scale-100 group-hover:pointer-events-auto"
        >
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
              <p className="mt-4 text-sm text-gray-300">No track is playing</p>
            )}
          </div>
        </div>
      </div>
      <img 
        className="absoulte inset-0 m-auto rounded-full object-cover w-[calc(100bh/3)] max-w-[calc(100vw/3)] aspect-square animate-spin"
        src={nowPlaying?.albumImage ?? ""}
        alt="vynil" />

      {/* Album art centered 
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <img
          src={nowPlaying?.albumImage ?? ""}
          alt={nowPlaying?.trackName ?? ""}
          className="w-100 h-100 shadow-2xl object-cover"
        />
      </div>
      */}
    </div>
  );
}
