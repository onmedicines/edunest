import { SignupForm } from "./_components/SignupForm";

export default function SignupPage() {
  return (
    <>
      <h2 className="text-center text-lg font-semibold mb-4" style={{ color: "var(--zen-text)" }}>
        Create your account
      </h2>
      <SignupForm />
    </>
  );
}
