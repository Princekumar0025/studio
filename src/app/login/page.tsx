'use client';
import { useAuth } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, FacebookAuthProvider, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { Phone } from 'lucide-react';
import React, { useRef, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Robustly initialize and clean up the reCAPTCHA verifier
  useEffect(() => {
    if (auth && recaptchaContainerRef.current && !recaptchaVerifierRef.current) {
      const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
        'size': 'invisible',
        'callback': () => {},
        'expired-callback': () => {
           toast({
             variant: "destructive",
             title: "reCAPTCHA Expired",
             description: "Please try signing in with your phone again.",
           });
           recaptchaVerifierRef.current?.clear();
           setIsSigningIn(false);
        }
      });
      recaptchaVerifierRef.current = verifier;
    }
    // Cleanup on unmount
    return () => {
      recaptchaVerifierRef.current?.clear();
    };
  }, [auth, toast]);

  const handleSignInSuccess = () => {
    setIsSigningIn(false);
    router.push('/admin/dashboard');
  };

  const handleSignInError = (error: any, provider: string) => {
    setIsSigningIn(false);
    console.error(`Error signing in with ${provider}:`, { code: error.code, message: error.message });
    
    let description = "An unknown error occurred. Please try again.";
    switch(error.code) {
        case 'auth/popup-closed-by-user':
            description = 'The sign-in window was closed. Please try again.';
            break;
        case 'auth/popup-blocked':
            description = 'Sign-in pop-up was blocked. Please allow pop-ups for this site.';
            break;
        case 'auth/account-exists-with-different-credential':
            description = 'An account already exists with this email but different sign-in credentials.';
            break;
        case 'auth/invalid-phone-number':
            description = 'The phone number you entered is not valid. Please include the country code.';
            break;
        case 'auth/too-many-requests':
            description = 'Too many requests. Please try again later.';
            break;
        case 'auth/invalid-verification-code':
            description = 'The verification code is incorrect. Please try again.';
            break;
        case 'auth/cancelled-popup-request':
            description = 'Only one sign-in pop-up can be open at a time.';
            break;
    }

    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description: description,
    });
  };

  const handleGoogleSignIn = async () => {
    if (!auth || isSigningIn) return;
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      handleSignInSuccess();
    } catch (error) {
      handleSignInError(error, 'Google');
    }
  };

  const handleFacebookSignIn = async () => {
    if (!auth || isSigningIn) return;
    setIsSigningIn(true);
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      handleSignInSuccess();
    } catch (error) {
      handleSignInError(error, 'Facebook');
    }
  };
  
  const handlePhoneSignIn = async () => {
    if (!auth || isSigningIn || !recaptchaVerifierRef.current) {
        if (!recaptchaVerifierRef.current) {
             toast({ variant: 'destructive', title: 'reCAPTCHA Error', description: 'reCAPTCHA is not ready. Please wait a moment and try again.'});
        }
        return;
    };
    
    setIsSigningIn(true);
    const appVerifier = recaptchaVerifierRef.current;
    
    const phoneNumber = prompt("Please enter your phone number with country code (e.g., +15551234567):");
    if (!phoneNumber) {
        setIsSigningIn(false);
        return;
    }
    
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      const verificationCode = prompt("Please enter the 6-digit verification code sent to your phone:");
      if (verificationCode) {
        await confirmationResult.confirm(verificationCode);
        handleSignInSuccess();
      } else {
        setIsSigningIn(false); // User cancelled code prompt
      }
    } catch (error) {
      handleSignInError(error, 'Phone');
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
          <Button className="w-full" onClick={handleGoogleSignIn} disabled={isSigningIn}>
            <FcGoogle className="mr-2 h-5 w-5" /> 
            {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          <Button className="w-full bg-[#1877F2] hover:bg-[#1877F2]/90" onClick={handleFacebookSignIn} disabled={isSigningIn}>
            <FaFacebook className="mr-2 h-5 w-5" /> 
            {isSigningIn ? 'Signing in...' : 'Sign in with Facebook'}
          </Button>
          <Button variant="outline" className="w-full" onClick={handlePhoneSignIn} disabled={isSigningIn}>
            <Phone className="mr-2 h-4 w-4" /> 
            {isSigningIn ? 'Signing in...' : 'Sign in with Phone'}
          </Button>
        </CardContent>
      </Card>
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
    </div>
  );
}
