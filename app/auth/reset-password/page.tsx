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

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const isRecoveryMode = type === "recovery";
  
  const passwordStrength = validatePassword(newPassword);
  const passwordValid = isPasswordStrong(passwordStrength);
  const passwordsMatch = doPasswordsMatch(newPassword, confirmPassword);
  const canUpdatePassword = passwordValid && passwordsMatch && !loading && !success;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password?type=recovery`,
      });

      if (resetError) {
        setError(resetError.message);
        setLoading(false);
        return;
      }

      setSuccess("Password reset email sent! Check your inbox.");
      setLoading(false);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!canUpdatePassword) return;

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setSuccess("Password updated successfully! Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-surface px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl font-bold mb-2 bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
            {isRecoveryMode ? "Set New Password" : "Reset Password"}
          </h1>
          <p className="text-muted-foreground">
            {isRecoveryMode
              ? "Enter your new password below"
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        <div className="glass rounded-xl p-8 border border-border/50">
          {isRecoveryMode ? (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green text-sm">
                  {success}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading || !!success}
                />
                
                <PasswordStrengthIndicator 
                  strength={passwordStrength} 
                  showIndicator={newPassword.length > 0}
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
                  disabled={loading || !!success}
                />
                {newPassword && confirmPassword && !passwordsMatch && (
                  <p className="text-sm text-destructive mt-1">Passwords don't match</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-neon-green to-neon-cyan text-black font-bold"
                disabled={!canUpdatePassword}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green text-sm">
                  {success}
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
                  disabled={loading || !!success}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-neon-green to-neon-cyan text-black font-bold"
                disabled={loading || !!success}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/auth/signin"
                  className="text-neon-green hover:underline"
                >
                  Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
