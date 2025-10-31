export async function getUserProfile(token: string) {
  const res = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch user profile", res.status);
    return null;
  }

  const data = await res.json();
  return data;
}
