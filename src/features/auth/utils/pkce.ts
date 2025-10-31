const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

export function createCodeVerifier(lenght = 128) {
    let verifier = "";
    const view = new Uint8Array(lenght);
    crypto.getRandomValues(view);
    for ( let i = 0; i < lenght; i += 1){
        verifier += CHARS[view[i] % CHARS.length];
    }
    return verifier;
}

export async function createCodeChallenge(verifier:string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const bytes = new Uint8Array(digest);

    let base64 = "";
    bytes.forEach((b) => {
        base64 += String.fromCharCode(b);

    });

    return btoa(base64).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    
}