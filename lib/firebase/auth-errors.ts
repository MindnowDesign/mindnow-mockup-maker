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
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    default:
      if (error instanceof Error && error.message) {
        return error.message;
      }
      return "Something went wrong. Please try again.";
  }
}
