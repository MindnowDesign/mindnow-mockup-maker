const GSI_SCRIPT_URL = "https://accounts.google.com/gsi/client";

let gsiScriptPromise: Promise<void> | null = null;

export function loadGsiScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!gsiScriptPromise) {
    gsiScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${GSI_SCRIPT_URL}"]`
      );

      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => reject(new Error("Failed to load Google Sign-In.")),
          { once: true }
        );
        return;
      }

      const script = document.createElement("script");
      script.src = GSI_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Google Sign-In."));
      document.head.appendChild(script);
    });
  }

  return gsiScriptPromise;
}

export function getGoogleLoginUri(): string {
  return `${window.location.origin}/auth/google/callback`;
}
