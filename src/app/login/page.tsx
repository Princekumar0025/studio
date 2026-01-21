'use client';
import { useAuth } from '@/firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 110.3 512 0 401.7 0 265.9c0-69.2 28.1-131.7 73.4-175.4C118.8 46.1 178.6 22 244 22c59.3 0 112.5 22.1 151.3 58.9l-49.1 49.1c-26.6-25.2-62.7-39.2-102.2-39.2-74.9 0-136.1 61.2-136.1 136.1s61.2 136.1 136.1 136.1c86.2 0 119.5-62.8 123.5-93.5H244v-64.8h244z"></path>
    </svg>
);

const ADMIN_UID = 'nvZWlJOeBHdojcfXC9ODKMJwky12';

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignInSuccess = (user: User) => {
    setIsSigningIn(false);
    if (user.uid === ADMIN_UID) {
      router.push('/admin/dashboard');
    } else {
      auth?.signOut();
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You are not an authorized administrator. Please use the patient login if you are a patient.',
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

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || isSigningIn || !email || !password) return;
    setIsSigningIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      handleSignInSuccess(userCredential.user);
    } catch (error) {
      handleSignInError(error);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!auth || isSigningIn) return;
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      handleSignInSuccess(userCredential.user);
    } catch (error) {
      handleSignInError(error);
    }
  };

  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl">Admin Access</CardTitle>
          <CardDescription>Sign in with your administrator credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSigningIn}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSigningIn}
                    required
                />
            </div>
            <Button type="submit" className="w-full" disabled={isSigningIn || !email || !password}>
                {isSigningIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
            </Button>
          </form>

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
