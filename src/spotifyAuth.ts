export const CLIENT_ID = "3ec1baa5d2e649d28f46d12f54b37cfc";
const REDIRECT_URI = "https://spotify-visualizer-eight.vercel.app/";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "code";

const SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state"
];


export const loginUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&response_type=${RESPONSE_TYPE}&scope=${SCOPES.join("%20")}&show_dialog=true`;