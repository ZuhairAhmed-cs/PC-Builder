import { PasswordStrength } from "@/lib/utils/password-validation";

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
  showIndicator?: boolean;
}

export function PasswordStrengthIndicator({ 
  strength, 
  showIndicator = true 
}: PasswordStrengthIndicatorProps) {
  if (!showIndicator) return null;

  return (
    <div className="mt-3 p-3 rounded-lg bg-surface/50 border border-border/30">
      <p className="text-sm font-medium mb-2">Password Requirements:</p>
      <ul className="space-y-1 text-sm">
        <li className={strength.minLength ? "text-neon-green" : "text-muted-foreground"}>
          {strength.minLength ? "✓" : "○"} At least 8 characters
        </li>
        <li className={strength.hasUppercase ? "text-neon-green" : "text-muted-foreground"}>
          {strength.hasUppercase ? "✓" : "○"} One uppercase letter
        </li>
        <li className={strength.hasLowercase ? "text-neon-green" : "text-muted-foreground"}>
          {strength.hasLowercase ? "✓" : "○"} One lowercase letter
        </li>
        <li className={strength.hasNumber ? "text-neon-green" : "text-muted-foreground"}>
          {strength.hasNumber ? "✓" : "○"} One number
        </li>
        <li className={strength.hasSpecial ? "text-neon-green" : "text-muted-foreground"}>
          {strength.hasSpecial ? "✓" : "○"} One special character (!@#$%^&*...)
        </li>
      </ul>
    </div>
  );
}

