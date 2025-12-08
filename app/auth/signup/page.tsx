"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrengthIndicator } from "@/components/ui/password-strength-indicator";
import { createClient } from "@/lib/supabase/client";
import { 
  validatePassword, 
  isPasswordStrong, 
  doPasswordsMatch 
} from "@/lib/utils/password-validation";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const passwordStrength = validatePassword(password);
  const passwordValid = isPasswordStrong(passwordStrength);
  const passwordsMatch = doPasswordsMatch(password, confirmPassword);
  const canSubmit = passwordValid && passwordsMatch && email.length > 0 && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!canSubmit) return;

    setLoading(true);

    try {
      const supabase = createClient();
      const action = searchParams.get("action");
      const token = searchParams.get("token");
      
      let redirectUrl = `${window.location.origin}/auth/callback`;
      if (action) {
        redirectUrl += `?next=/auth/complete-signup?action=${action}`;
        if (token) {
          redirectUrl += `%26token=${token}`;
        }
      }
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const redirect = searchParams.get("redirect");
        const action = searchParams.get("action");

        if (data.session) {
          if (action === "save") {
            const pendingBuildData = sessionStorage.getItem('pendingBuild');
            if (pendingBuildData) {
              try {
                const pendingBuild = JSON.parse(pendingBuildData);
                const response = await fetch("/api/builds", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    name: "My PC Build",
                    description: "Built with PC Builder",
                    experienceLevel: pendingBuild.experienceLevel,
                    components: pendingBuild.components,
                    totalPrice: pendingBuild.totalPrice,
                  }),
                });
                
                if (response.ok) {
                  sessionStorage.removeItem('pendingBuild');
                  router.push("/dashboard");
                  router.refresh();
                  return;
                }
              } catch (error) {
                console.error("Error saving pending build:", error);
              }
            }
          }
          
          if (action === "email-parts") {
            const token = searchParams.get("token");
            if (token) {
              try {
                await fetch(`/api/builds/share/${token}/email-parts`, {
                  method: "POST",
                });
              } catch (error) {
                console.error("Error sending email:", error);
              }
            }
          }
          
          router.push(redirect || "/builder");
          router.refresh();
        } else {
          setSuccess(true);
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-surface px-4">
        <div className="w-full max-w-md">
          <div className="glass rounded-xl p-8 border border-border/50 text-center">
            <div className="mb-4 text-4xl">✉️</div>
            <h2 className="text-2xl font-heading font-bold mb-4">Check Your Email</h2>
            <p className="text-muted-foreground mb-6">
              We've sent you a confirmation email. Please check your inbox and click the link to verify your account.
            </p>
            <Link href="/auth/signin">
              <Button variant="outline" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-surface px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2 bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-muted-foreground">
            Start building your dream PC
          </p>
        </div>

        <div className="glass rounded-xl p-8 border border-border/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              
              <PasswordStrengthIndicator 
                strength={passwordStrength} 
                showIndicator={password.length > 0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
              {password && confirmPassword && !passwordsMatch && (
                <p className="text-sm text-destructive mt-1">Passwords don't match</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-neon-green to-neon-cyan text-black font-bold"
              disabled={!canSubmit}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="text-neon-green hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignUpForm />
    </Suspense>
  );
}
