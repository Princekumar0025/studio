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
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// To prevent re-creating the verifier on every render.
let recaptchaVerifier: RecaptchaVerifier | null = null;

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [phoneStage, setPhoneStage] = useState<'enterPhone' | 'enterCode'>('enterPhone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // This is the container where the reCAPTCHA widget will be rendered.
  // It is always present in the DOM but invisible.
  const setupRecaptcha = () => {
    if (!auth) return;
    // It's important to only have one instance of RecaptchaVerifier.
    // We clear the old one if it exists.
    if (recaptchaVerifier) {
       recaptchaVerifier.clear();
       recaptchaVerifier = null;
    }
    recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': () => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      },
      'expired-callback': () => {
        // Response expired. Ask user to solve reCAPTCHA again.
        toast({
          variant: "destructive",
          title: "reCAPTCHA Expired",
          description: "Please try sending the code again.",
        });
        setIsSigningIn(false);
      }
    });
  };

  const resetPhoneSignIn = () => {
    setIsSigningIn(false);
    setPhoneStage('enterPhone');
    setPhoneNumber('');
    setVerificationCode('');
    setConfirmationResult(null);
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
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
        case 'auth/captcha-check-failed':
            description = 'The reCAPTCHA verification failed. Please try again.';
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

    try {
      setupRecaptcha(); // Make sure verifier is set up
      if (!recaptchaVerifier) {
        // This should not happen if setupRecaptcha is correct
        throw new Error("RecaptchaVerifier not initialized");
      }
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      setConfirmationResult(result);
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
      if (!verificationCode || !confirmationResult) return;
      setIsSigningIn(true);
      try {
        await confirmationResult.confirm(verificationCode);
        handleSignInSuccess();
      } catch (error) {
        handleSignInError(error, 'Phone');
      }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier = null;
      }
    };
  }, []);

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
                maxLength={6}
              />
              <Button className="w-full" onClick={handleConfirmVerificationCode} disabled={isSigningIn || verificationCode.length < 6}>
                {isSigningIn ? 'Verifying...' : 'Confirm Code'}
              </Button>
               <Button variant="link" size="sm" className="w-full" onClick={resetPhoneSignIn}>
                Back to phone number entry
              </Button>
            </div>
          )}

        </CardContent>
      </Card>
      {/* This container is essential for the invisible reCAPTCHA. It MUST be in the DOM. */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
