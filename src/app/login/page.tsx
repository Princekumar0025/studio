'use client';
import { useAuth } from '@/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  ConfirmationResult
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FcGoogle } from 'react-icons/fc';
import { Phone } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';
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
  const [phoneStage, setPhoneStage] = useState<'enterPhone' | 'enterCode'>('enterPhone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  // Effect for cleaning up reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

  const resetPhoneSignIn = () => {
    setIsSigningIn(false);
    setPhoneStage('enterPhone');
    setPhoneNumber('');
    setVerificationCode('');
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = undefined;
    }
    window.confirmationResult = undefined;
  };


  const handleSignInSuccess = () => {
    setIsSigningIn(false);
    router.push('/admin/dashboard');
  };

  const handleSignInError = (error: any, provider: string) => {
    setIsSigningIn(false);
    console.error(`Error signing in with ${provider}:`, error);
    
    let description = `An unknown error occurred. Please try again.`;
    switch(error.code) {
        case 'auth/popup-closed-by-user':
            description = 'The sign-in window was closed before completing. Please try again.';
            break;
        case 'auth/popup-blocked':
            description = 'Sign-in pop-up was blocked by the browser. Please allow pop-ups for this site and try again.';
            break;
        case 'auth/account-exists-with-different-credential':
            description = 'An account already exists with this email address. Please sign in using the method you originally used.';
            break;
        case 'auth/operation-not-allowed':
             description = `Sign-in with ${provider} is not enabled. Please go to your Firebase Console -> Authentication -> Sign-in method, and enable the ${provider} provider.`;
             break;
        case 'auth/invalid-phone-number':
            description = 'The phone number you entered is not valid. Please make sure to include the country code (e.g., +15551234567).';
            break;
        case 'auth/too-many-requests':
            description = 'We have blocked all requests from this device due to unusual activity. Please try again later.';
            break;
        case 'auth/invalid-verification-code':
            description = 'The verification code is incorrect. Please double-check the code and try again.';
            break;
        case 'auth/network-request-failed':
            description = 'A network error occurred. Please check your internet connection and try again.';
            break;
        default:
            description = `An unexpected error occurred. Please check the console for details. (Code: ${error.code || 'N/A'})`;
            break;
    }

    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description: description,
      duration: 9000,
    });
    if (provider === 'Phone') {
      resetPhoneSignIn();
    }
  };

  const signInWithProvider = async (providerInstance: GoogleAuthProvider) => {
    if (!auth || isSigningIn) return;
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, providerInstance);
      handleSignInSuccess();
    } catch (error) {
      const providerName = providerInstance.providerId.includes('google') ? 'Google' : 'Other';
      handleSignInError(error, providerName);
    }
  };

  const handleGoogleSignIn = () => signInWithProvider(new GoogleAuthProvider());
  
  const handleSendVerificationCode = async () => {
    if (!auth || isSigningIn || !phoneNumber) return;
    setIsSigningIn(true);
  
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }

    try {
      const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current!, {
        'size': 'invisible',
        'callback': () => {},
        'expired-callback': () => {
          toast({ variant: "destructive", title: "reCAPTCHA Expired", description: "Please try signing in again." });
          setIsSigningIn(false);
        }
      });
      window.recaptchaVerifier = verifier;
    
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      window.confirmationResult = confirmationResult;
      setPhoneStage('enterCode');
      setIsSigningIn(false);
      toast({
        title: "Verification Code Sent",
        description: "A 6-digit code has been sent to your phone.",
      });

    } catch (error: any) {
      handleSignInError(error, 'Phone');
    }
  };

  const handleConfirmVerificationCode = async () => {
      if (!verificationCode || !window.confirmationResult) return;
      setIsSigningIn(true);
      try {
        await window.confirmationResult.confirm(verificationCode);
        handleSignInSuccess();
      } catch (error) {
        handleSignInError(error, 'Phone');
      }
  }

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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          {phoneStage === 'enterPhone' && (
            <div className="space-y-2">
              <Input 
                type="tel"
                placeholder="Phone number (e.g. +1...)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isSigningIn}
              />
              <Button variant="outline" className="w-full" onClick={handleSendVerificationCode} disabled={isSigningIn || !phoneNumber}>
                <Phone className="mr-2 h-4 w-4" /> 
                {isSigningIn ? 'Sending Code...' : 'Sign in with Phone'}
              </Button>
            </div>
          )}

          {phoneStage === 'enterCode' && (
             <div className="space-y-2">
              <Input
                type="text"
                placeholder="6-digit verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={isSigningIn}
              />
              <Button className="w-full" onClick={handleConfirmVerificationCode} disabled={isSigningIn || !verificationCode}>
                {isSigningIn ? 'Verifying...' : 'Confirm Code'}
              </Button>
               <Button variant="link" size="sm" className="w-full" onClick={resetPhoneSignIn}>
                Back to phone number entry
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
      {/* This container is essential for the invisible reCAPTCHA */}
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
    </div>
  );
}
