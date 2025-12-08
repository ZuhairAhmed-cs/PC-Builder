'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useBuildStore } from '@/store/build-store';

function CompleteSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Please wait a moment while we set up your account...');
  const { resetStore } = useBuildStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      checkSessionAndProceed();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const checkSessionAndProceed = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setStatus('error');
        setMessage('Failed to retrieve user session. Redirecting to sign in...');
        setTimeout(() => router.push('/auth/signin'), 2000);
        return;
      }
      
      await handlePostSignup();
    } catch {
      setStatus('error');
      setMessage('An error occurred. Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 2000);
    }
  };

  const handlePostSignup = async () => {
    const action = searchParams.get('action');
    
    if (action === 'save') {
      setMessage('Saving your build...');
      const pendingBuildData = localStorage.getItem('pendingBuild');
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
            localStorage.removeItem('pendingBuild');
            resetStore();
            setStatus('success');
            setMessage('Success! Your build has been saved. Redirecting to your dashboard...');
            setTimeout(() => router.push("/dashboard"), 2000);
            return;
          } else {
            const errorData = await response.json();
            setStatus('error');
            setMessage(`Failed to save build: ${errorData.error || 'Unknown error'}.`);
            setTimeout(() => router.push("/dashboard"), 3000);
            return;
          }
        } catch {
          setStatus('error');
          setMessage('An unexpected error occurred while saving your build.');
          setTimeout(() => router.push("/dashboard"), 3000);
          return;
        }
      } else {
        setStatus('error');
        setMessage('No pending build found.');
        setTimeout(() => router.push("/dashboard"), 3000);
        return;
      }
    } else if (action === 'email-parts') {
      setMessage('Sending your parts list email...');
      const token = searchParams.get('token');
      if (token) {
        try {
          const response = await fetch(`/api/builds/share/${token}/email-parts`, {
            method: "POST",
          });
          if (response.ok) {
            setStatus('success');
            setMessage('Success! Your parts list email has been sent. Redirecting to your dashboard...');
            setTimeout(() => router.push("/dashboard"), 2000);
            return;
          } else {
            const errorData = await response.json();
            setStatus('error');
            setMessage(`Failed to send email: ${errorData.error || 'Unknown error'}.`);
          }
        } catch {
          setStatus('error');
          setMessage('An unexpected error occurred while sending the email.');
        }
      } else {
        setStatus('error');
        setMessage('Missing build token for email.');
      }
      setTimeout(() => router.push("/dashboard"), 3000);
    } else {
      setMessage('Account setup complete. Redirecting to your dashboard...');
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-surface px-4">
      <div className="text-center space-y-6 max-w-md">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-green mx-auto"></div>
            <h1 className="text-2xl font-heading font-bold">Processing...</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-6xl">✓</div>
            <h1 className="text-2xl font-heading font-bold text-neon-green">Success!</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-6xl">⚠️</div>
            <h1 className="text-2xl font-heading font-bold text-destructive">Something went wrong</h1>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function CompleteSignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-green"></div>
      </div>
    }>
      <CompleteSignupContent />
    </Suspense>
  );
}

