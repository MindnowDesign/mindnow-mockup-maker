import type { FirebaseError } from "firebase/app";

export function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as FirebaseError).code === "string"
      ? (error as FirebaseError).code
      : null;

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/invalid-action":
    case "auth/operation-not-allowed":
      return "Google Sign-In is not available yet. Try email/password or contact support.";
    case "auth/unauthorized-domain": {
      const hostname =
        typeof window !== "undefined" ? window.location.hostname : null;
      return hostname
        ? `${hostname} is not authorized for sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.`
        : "This domain is not authorized for sign-in.";
    }
    case "auth/popup-blocked":
      return "Pop-up was blocked. Allow pop-ups for this site and try again.";
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    default:
      if (error instanceof Error && error.message) {
        return error.message;
      }
      return "Something went wrong. Please try again.";
  }
}
