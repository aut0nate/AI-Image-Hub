import { ArrowLeft, LockKeyhole, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/lib/actions";
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

  return (
    <main className="login-page">
      <Link className="login-back" href="/">
        <ArrowLeft size={17} />
        Back to gallery
      </Link>
      <div className="login-shell">
        <form action={loginAction} className="login-panel">
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
              <p className="login-tagline">Sign in to your gallery</p>
            </div>
          </div>
          {params.error ? <p className="error-text">Those login details did not work.</p> : null}
          <div className="login-fields">
            <div className="field login-field">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrap">
                <UserRound aria-hidden="true" size={18} />
                <input autoComplete="username" id="username" name="username" required />
              </div>
            </div>
            <div className="field login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <LockKeyhole aria-hidden="true" size={18} />
                <input autoComplete="current-password" id="password" name="password" required type="password" />
              </div>
            </div>
          </div>
          <button className="button primary login-submit" type="submit">
            Log In
          </button>
        </form>
      </div>
    </main>
  );
}
