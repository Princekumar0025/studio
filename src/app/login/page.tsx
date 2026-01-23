'use client';
import { useAuth } from '@/firebase';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
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
        recaptchaVerifier?: RecaptchaVerifier;
        confirmationResult?: ConfirmationResult;
    }
}

const ADMIN_UID = 'nvZWlJOeBHdojcfXC9ODKMJwky12';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [uiState, setUiState] = useState<'phone-entry' | 'code-entry'>('phone-entry');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    if (!auth) return;

    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response: any) => {},
        });
    }
  }, [auth]);

  const handleSignInSuccess = (user: User) => {
    setIsSigningIn(false);
    if (user.uid === ADMIN_UID) {
      router.push('/admin/dashboard');
    } else {
      auth?.signOut();
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You are not an authorized administrator.',
        duration: 9000,
      });
    }
  };

  const handleSignInError = (error: any) => {
    setIsSigningIn(false);
    console.error(`Sign-in error:`, error);
    
    let description = `An unknown error occurred. Please try again.`;
    switch(error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
            description = 'Invalid credentials. Please try again.';
            break;
        case 'auth/operation-not-allowed':
             description = `This sign-in method is not enabled. An administrator must enable this in the Firebase Console.`;
             break;
        case 'auth/too-many-requests':
            description = 'Access to this account has been temporarily disabled due to many failed login attempts. You can try again later.';
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

  const handlePhoneSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || isSigningIn || !phoneNumber || !window.recaptchaVerifier) return;
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
        const userCredential = await window.confirmationResult.confirm(verificationCode);
        handleSignInSuccess(userCredential.user);
    } catch (error) {
        handleSignInError(error);
    }
  }


  return (
    <div className="container flex items-center justify-center py-20">
      <div id="recaptcha-container"></div>
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Admin Access</CardTitle>
          <CardDescription>Sign in with your administrator phone number.</CardDescription>
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
        </CardContent>
      </Card>
    </div>
  );
}
