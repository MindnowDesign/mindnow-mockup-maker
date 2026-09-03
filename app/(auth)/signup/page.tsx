import { SignupForm } from "@/components/auth/signup-form";
import { FirebaseConfigNotice } from "@/components/auth/firebase-config-notice";

export default function SignupPage() {
  return (
    <>
      <FirebaseConfigNotice />
      <SignupForm />
    </>
  );
}
