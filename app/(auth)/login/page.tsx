import { LoginForm } from "@/components/auth/login-form";
import { FirebaseConfigNotice } from "@/components/auth/firebase-config-notice";

export default function LoginPage() {
  return (
    <>
      <FirebaseConfigNotice />
      <LoginForm />
    </>
  );
}
