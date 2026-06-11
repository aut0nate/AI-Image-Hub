import { ArrowLeft, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  if (await getAdminSession()) {
    redirect("/admin");
  }
  const params = await searchParams;
  const errorMessage = params.error ? "Sign in could not be completed. Check your Authentik access and try again." : null;

  return (
    <main className="login-page">
      <Link className="login-back" href="/">
        <ArrowLeft size={17} />
        Back to gallery
      </Link>
      <div className="login-shell">
        <section className="login-panel" aria-labelledby="login-heading">
          <div className="login-brand">
            <Image
              alt="AI Image Hub logo"
              className="login-logo"
              height={112}
              priority
              src="/brand/ai-art-hub-logo.png"
              width={112}
            />
            <div className="login-brand-copy">
              <p className="login-site-name">AI Image Hub</p>
              <h1 id="login-heading" className="login-tagline">
                Sign in to your gallery
              </h1>
            </div>
          </div>
          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
          <Link className="button primary login-submit" href="/auth/login">
            <ShieldCheck size={18} />
            Sign in with Authentik
          </Link>
        </section>
      </div>
    </main>
  );
}
