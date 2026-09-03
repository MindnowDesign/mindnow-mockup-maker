"use client";

import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
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

export function LoginForm() {
  const router = useRouter();
  const { configured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailLogin(event: React.FormEvent) {
    event.preventDefault();
    if (!configured) {
      setError("Firebase is not configured yet.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password
      );
      router.replace("/");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
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
      title="Welcome back"
      subtitle="Sign in to continue to Mindnow"
      footer={
        <p className="text-sm text-neutral-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={authLinkClass}>
            Sign up
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleEmailLogin}>
        <AuthField id="login-email" label="Email">
          <AuthInput
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />
        </AuthField>

        <AuthField id="login-password" label="Password">
          <AuthInput
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
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
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <AuthDivider />

      <GoogleSignInButton
        onClick={handleGoogleLogin}
        disabled={submitting || !configured}
      />
    </AuthCard>
  );
}
