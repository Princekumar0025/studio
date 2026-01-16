'use client';
import { useAuth } from '@/firebase';
import { 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  signInWithPopup, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { Phone } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Attaching verifier to window to ensure it's a singleton and survives re-renders.
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  const handleSignInSuccess = () => {
    setIsSigningIn(false);
    router.push('/admin/dashboard');
  };

  const handleSignInError = (error: any, provider: string) => {
    setIsSigningIn(false);
    // Log the full error for debugging
    console.error(`Error signing in with ${provider}:`, error);
    
    let description = `An unknown error occurred. Please try again. (Code: ${error.code})`;
    switch(error.code) {
        case 'auth/popup-closed-by-user':
            description = 'The sign-in window was closed. Please try again.';
            break;
        case 'auth/popup-blocked':
            description = 'Sign-in pop-up was blocked. Please allow pop-ups for this site.';
            break;
        case 'auth/account-exists-with-different-credential':
            description = 'An account already exists with this email using a different sign-in method.';
            break;
        case 'auth/operation-not-allowed':
             description = `Sign-in with ${provider} is not enabled in the project configuration.`;
             break;
        case 'auth/invalid-phone-number':
            description = 'The phone number you entered is not valid. Please include the country code (e.g., +1).';
            break;
        case 'auth/too-many-requests':
            description = 'We have blocked all requests from this device due to unusual activity. Try again later.';
            break;
        case 'auth/invalid-verification-code':
            description = 'The verification code is incorrect. Please try again.';
            break;
        case 'auth/network-request-failed':
            description = 'A network error occurred. Please check your internet connection and try again.';
            break;
        default:
            // The default description will now include the error code and message
            description = `An unexpected error occurred: ${error.message} (Code: ${error.code || 'N/A'})`;
            break;
    }

    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description: description,
    });
  };

  const signInWithProvider = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
    if (!auth || isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, provider);
      handleSignInSuccess();
    } catch (error) {
      const providerName = provider.providerId.includes('google') ? 'Google' : 'Facebook';
      handleSignInError(error, providerName);
    }
  };

  const handleGoogleSignIn = () => signInWithProvider(new GoogleAuthProvider());
  const handleFacebookSignIn = () => signInWithProvider(new FacebookAuthProvider());
  
  const handlePhoneSignIn = async () => {
    if (!auth || isSigningIn) return;
    setIsSigningIn(true);

    try {
      // Initialize reCAPTCHA only when the phone sign-in is attempted
      if (!window.recaptchaVerifier && recaptchaContainerRef.current) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          'size': 'invisible',
          'callback': () => { /* reCAPTCHA solved */ },
          'expired-callback': () => {
            toast({ variant: "destructive", title: "reCAPTCHA Expired", description: "Please try signing in again." });
            setIsSigningIn(false);
          }
        });
      }
      
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) {
        throw new Error("Could not create reCAPTCHA verifier.");
      }

      const phoneNumber = prompt("Please enter your phone number with country code (e.g., +15551234567):");
      if (!phoneNumber) {
          setIsSigningIn(false);
          return;
      }
    
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;

      const verificationCode = prompt("Please enter the 6-digit verification code sent to your phone:");
      if (verificationCode && window.confirmationResult) {
        await window.confirmationResult.confirm(verificationCode);
        handleSignInSuccess();
      } else {
        setIsSigningIn(false); // User cancelled or there was an issue
      }
    } catch (error: any) {
      // Cleanup the verifier if it exists.
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
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
      {/* This container is essential for the invisible reCAPTCHA */}
      <div ref={recaptchaContainerRef}></div>
    </div>
  );
}
