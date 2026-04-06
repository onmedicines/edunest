import { LoginForm } from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <>
      <h2 className="text-center text-lg font-semibold mb-4" style={{ color: "var(--zen-text)" }}>
        Welcome back
      </h2>
      <LoginForm />
    </>
  );
}
