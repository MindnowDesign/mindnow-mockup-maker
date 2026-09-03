"use client";

import {
  signInWithEmailAndPassword,
} from "firebase/auth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  AuthCard,
  AuthDivider,
} from "@/components/auth/auth-card";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { AuthField, AuthInput } from "@/components/auth/auth-field";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { authLinkClass } from "@/lib/auth-form-styles";
import { getAuthErrorMessage } from "@/lib/firebase/auth-errors";
import { getFirebaseAuth } from "@/lib/firebase/client";

export function LoginForm() {
  const { configured, authError, clearAuthError } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  useEffect(() => {
    const googleError = searchParams.get("googleError");
    if (googleError) {
      setError(decodeURIComponent(googleError));
    }
  }, [searchParams]);

  async function handleEmailLogin(event: React.FormEvent) {
    event.preventDefault();
    if (!configured) {
      setError("Firebase is not configured yet.");
      return;
    }

    setError(null);
    clearAuthError();
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password
      );
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
          className="w-full"
          disabled={submitting || !configured}
        >
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <AuthDivider />

      <GoogleSignInButton
        disabled={submitting || !configured}
        onError={(message) => {
          setError(message);
        }}
      />
    </AuthCard>
  );
}
