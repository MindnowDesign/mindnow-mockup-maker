import { GOOGLE_ID_TOKEN_STORAGE_KEY } from "@/lib/firebase/google-auth-cookie";

export const GOOGLE_SIGN_IN_LOADING_LABEL = "Signing you in with Google…";

export function createGoogleCallbackBridgeHtml(
  credential: string,
  completePath = "/auth/google/complete"
): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <title>${GOOGLE_SIGN_IN_LOADING_LABEL}</title>
    <style>
      html, body {
        margin: 0;
        min-height: 100dvh;
        background: #030303;
        color: #a3a3a3;
        font-family: "Manrope", ui-sans-serif, system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        line-height: 1.25rem;
      }
    </style>
  </head>
  <body aria-busy="true" aria-label="${GOOGLE_SIGN_IN_LOADING_LABEL}">
    ${GOOGLE_SIGN_IN_LOADING_LABEL}
    <script>
      sessionStorage.setItem(${JSON.stringify(GOOGLE_ID_TOKEN_STORAGE_KEY)}, ${JSON.stringify(credential)});
      window.location.replace(${JSON.stringify(completePath)});
    </script>
  </body>
</html>`;
}
