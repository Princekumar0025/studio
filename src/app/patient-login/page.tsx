'use client';

import { useAuth } from '@/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        confirmationResult: ConfirmationResult;
    }
}

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.9c0-69.2 28.1-131.7 73.4-175.4C118.8 46.1 178.6 22 244 22c59.3 0 112.5 22.1 151.3 58.9l-49.1 49.1c-26.6-25.2-62.7-39.2-102.2-39.2-74.9 0-136.1 61.2-136.1 136.1s61.2 136.1 136.1 136.1c86.2 0 119.5-62.8 123.5-93.5H244v-64.8h244z"></path>
    </svg>
);

export default function PatientLoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [uiState, setUiState] = useState<'phone-entry' | 'code-entry'>('phone-entry');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    if (!auth) return;
    if (window.recaptchaVerifier) window.recaptchaVerifier.clear();
    
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': (response: any) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
      }
    });
    return () => {
        if(window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
        }
    };
  }, [auth]);

  const handleSignInSuccess = () => {
    setIsSigningIn(false);
    toast({ title: "Login Successful", description: "You are now logged in."})
    router.push('/account');
  };

  const handleSignInError = (error: any) => {
    setIsSigningIn(false);
    console.error(`Sign-in error:`, error);
    
    let description = `An unknown error occurred. Please try again.`;
    switch(error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            description = 'Invalid credentials. Please try again.';
            break;
        case 'auth/popup-closed-by-user':
            description = 'The sign-in window was closed. Please try again.';
            break;
        case 'auth/invalid-email':
            description = 'The email address you entered is not valid.';
            break;
        case 'auth/operation-not-allowed':
             description = `This sign-in method is not enabled. An administrator must enable this in the Firebase Console.`;
             break;
        case 'auth/too-many-requests':
            description = 'Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.';
            break;
        case 'auth/network-request-failed':
            description = 'A network error occurred. Please check your internet connection and try again.';
            break;
        case 'auth/invalid-phone-number':
            description = 'The phone number is not valid. Please enter it in E.164 format (e.g., +12223334444).';
            break;
        case 'auth/code-expired':
            description = 'The verification code has expired. Please request a new one.';
            break;
        case 'auth/invalid-verification-code':
            description = 'The verification code you entered is invalid.';
            break;
        default:
            description = `An unexpected error occurred. (Code: ${error.code || 'N/A'}). Check browser console for details.`;
            break;
    }

    toast({
      variant: 'destructive',
      title: 'Authentication Failed',
      description: description,
      duration: 9000,
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
      handleSignInError(error);
    }
  };

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || isSigningIn || !phoneNumber) return;
    setIsSigningIn(true);
    const appVerifier = window.recaptchaVerifier;
    try {
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        setUiState('code-entry');
        setIsSigningIn(false);
        toast({ title: 'Verification Code Sent', description: `A code has been sent to ${phoneNumber}.`});
    } catch (error) {
        handleSignInError(error);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirmationResult || isSigningIn || !verificationCode) return;
    setIsSigningIn(true);
    try {
        await window.confirmationResult.confirm(verificationCode);
        handleSignInSuccess();
    } catch (error) {
        handleSignInError(error);
    }
  }

  return (
    <div className="container flex items-center justify-center py-20">
       <div id="recaptcha-container"></div>
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Patient Portal</CardTitle>
          <CardDescription>Sign in to view your account and history.</CardDescription>
        </CardHeader>
        <CardContent>
          {uiState === 'phone-entry' && (
            <form onSubmit={handlePhoneSignIn} className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                      id="phone"
                      type="tel"
                      placeholder="+1 555-555-5555"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={isSigningIn}
                      required
                  />
              </div>
              <Button type="submit" className="w-full" disabled={isSigningIn || !phoneNumber}>
                  {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Verification Code
              </Button>
            </form>
          )}

          {uiState === 'code-entry' && (
             <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input 
                        id="code"
                        type="text"
                        placeholder="123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        disabled={isSigningIn}
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isSigningIn || !verificationCode}>
                    {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify and Sign In
                </Button>
                <Button variant="link" className="w-full" onClick={() => setUiState('phone-entry')} disabled={isSigningIn}>
                    Use a different phone number
                </Button>
            </form>
          )}

          <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                  </span>
              </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isSigningIn}>
              {isSigningIn ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
              Sign in with Google
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
