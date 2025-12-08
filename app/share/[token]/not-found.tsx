import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function ShareNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-surface/30 px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-20 h-20 rounded-full bg-surface/50 flex items-center justify-center">
          <Lock className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
          Build Not Available
        </h1>
        <p className="text-muted-foreground text-lg">
          This build is either private or doesn't exist.
        </p>
        <Link href="/builder">
          <Button size="lg" className="bg-gradient-to-r from-neon-green to-neon-cyan text-black font-bold">
            Create Your Own Build
          </Button>
        </Link>
      </div>
    </div>
  );
}

