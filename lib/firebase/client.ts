import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** Same-origin auth via the /__/auth reverse proxy in next.config.ts. */
function resolveAuthDomain(): string {
  const fromEnv = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const firebaseHostedDomain = projectId
    ? `${projectId}.firebaseapp.com`
    : "";

  if (typeof window !== "undefined") {
    const { hostname, protocol, host } = window.location;

    // Local HTTP dev cannot serve https://localhost — Firebase always uses HTTPS
    // for custom authDomain hosts, which triggers ERR_SSL_PROTOCOL_ERROR.
    if (
      (hostname === "localhost" || hostname === "127.0.0.1") &&
      protocol === "http:"
    ) {
      const envLooksLocal =
        fromEnv?.startsWith("localhost") || fromEnv?.startsWith("127.0.0.1");
      if (fromEnv && !envLooksLocal) return fromEnv;
      return firebaseHostedDomain;
    }

    return fromEnv || host;
  }

  return fromEnv || firebaseHostedDomain;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* variables to .env.local."
    );
  }

  return getApps()[0] ?? initializeApp({
    ...firebaseConfig,
    authDomain: resolveAuthDomain(),
  });
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}
