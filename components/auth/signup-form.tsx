"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  AuthCard,
  AuthDivider,
  GoogleSignInButton,
} from "@/components/auth/auth-card";
import { AuthField, AuthInput } from "@/components/auth/auth-field";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { authLinkClass } from "@/lib/auth-form-styles";
import { getAuthErrorMessage } from "@/lib/firebase/auth-errors";
import { getFirebaseAuth } from "@/lib/firebase/client";

export function SignupForm() {
  const router = useRouter();
  const { configured } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailSignup(event: React.FormEvent) {
    event.preventDefault();
    if (!configured) {
      setError("Firebase is not configured yet.");
      return;
    }

    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      const credential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const displayName = name.trim();
      if (displayName) {
        await updateProfile(credential.user, { displayName });
      }

      router.replace("/");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignup() {
    if (!configured) {
      setError("Firebase is not configured yet.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      router.replace("/");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start building mockups with Mindnow"
      footer={
        <p className="text-sm text-neutral-400">
          Already have an account?{" "}
          <Link href="/login" className={authLinkClass}>
            Sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleEmailSignup}>
        <AuthField id="signup-name" label="Name">
          <AuthInput
            id="signup-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Jane Doe"
          />
        </AuthField>

        <AuthField id="signup-email" label="Email">
          <AuthInput
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />
        </AuthField>

        <AuthField id="signup-password" label="Password">
          <AuthInput
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </AuthField>

        <AuthField id="signup-confirm-password" label="Confirm password">
          <AuthInput
            id="signup-confirm-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
          />
        </AuthField>

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-10 w-full"
          disabled={submitting || !configured}
        >
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <AuthDivider />

      <GoogleSignInButton
        onClick={handleGoogleSignup}
        disabled={submitting || !configured}
      />
    </AuthCard>
  );
}
