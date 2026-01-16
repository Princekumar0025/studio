'use client';
import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, FacebookAuthProvider, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { Phone } from 'lucide-react';
import React, { useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  // Clean up verifier on unmount
  useEffect(() => {
    const verifier = recaptchaVerifierRef.current;
    return () => {
      verifier?.clear();
    };
  }, []);

  const handleSignInSuccess = () => {
    router.push('/admin/dashboard');
  };

  const handleSignInError = (error: any, provider: string) => {
    console.error(`Error signing in with ${provider}`, error);
    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description: `Could not sign in with ${provider}. Please try again.`,
    });
  };

  const handleGoogleSignIn = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      handleSignInSuccess();
    } catch (error) {
      handleSignInError(error, 'Google');
    }
  };

  const handleFacebookSignIn = async () => {
    if (!auth) return;
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      handleSignInSuccess();
    } catch (error) {
      handleSignInError(error, 'Facebook');
    }
  };
  
  const handlePhoneSignIn = async () => {
    if (!auth) return;

    // Initialize reCAPTCHA verifier if it doesn't exist.
    if (!recaptchaVerifierRef.current && recaptchaContainerRef.current) {
      try {
        const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          'size': 'invisible',
          'callback': () => {},
        });
        recaptchaVerifierRef.current = verifier;
        await verifier.render();
      } catch (error) {
        handleSignInError(error, "reCAPTCHA");
        return;
      }
    }
    
    const appVerifier = recaptchaVerifierRef.current;
    if (!appVerifier) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'reCAPTCHA not ready. Please try again.',
      });
      return;
    }

    const phoneNumber = prompt("Please enter your phone number with country code (e.g., +15551234567):");
    if (phoneNumber) {
      try {
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        const verificationCode = prompt("Please enter the 6-digit verification code sent to your phone:");
        if (verificationCode) {
          await confirmationResult.confirm(verificationCode);
          handleSignInSuccess();
        }
      } catch (error) {
        handleSignInError(error, 'phone');
        // Reset verifier for the next attempt
        recaptchaVerifierRef.current?.clear();
        recaptchaVerifierRef.current = null;
      }
    }
  };

  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Admin Access</CardTitle>
          <CardDescription>Sign in to manage PhysioGuide</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Button className="w-full" onClick={handleGoogleSignIn}>
            <FcGoogle className="mr-2 h-5 w-5" /> Sign in with Google
          </Button>
          <Button className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90" onClick={handleFacebookSignIn}>
            <FaFacebook className="mr-2 h-5 w-5" /> Sign in with Facebook
          </Button>
          <Button variant="outline" className="w-full" onClick={handlePhoneSignIn}>
            <Phone className="mr-2 h-4 w-4" /> Sign in with Phone
          </Button>
        </CardContent>
      </Card>
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
    </div>
  );
}
