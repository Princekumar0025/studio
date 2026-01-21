'use client';

import { useState } from 'react';
import { useUser } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateEmail, updatePassword, GoogleAuthProvider, linkWithPopup, unlink } from 'firebase/auth';
import { Loader2, KeyRound } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const emailSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState({ email: false, password: false, google: false });

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    values: { email: user?.email || '' }, // use `values` to keep it updated
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const handleFirebaseError = (error: any) => {
    if (error.code === 'auth/requires-recent-login') {
        toast({
            variant: 'destructive',
            title: 'Action Required',
            description: 'This is a sensitive action. Please log out and log back in to continue.',
            duration: 7000,
        });
    } else {
        toast({ variant: 'destructive', title: 'An error occurred', description: error.message });
    }
  };

  const onEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    if (!user) return;
    setIsLoading(prev => ({ ...prev, email: true }));
    try {
        await updateEmail(user, data.email);
        toast({ title: 'Email Updated', description: 'Your email address has been successfully updated.' });
    } catch (error: any) {
        handleFirebaseError(error);
    } finally {
        setIsLoading(prev => ({ ...prev, email: false }));
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    if (!user) return;
    setIsLoading(prev => ({ ...prev, password: true }));
    try {
        await updatePassword(user, data.newPassword);
        toast({ title: 'Password Updated', description: 'Your password has been successfully updated.' });
        passwordForm.reset();
    } catch (error: any) {
        handleFirebaseError(error);
    } finally {
        setIsLoading(prev => ({ ...prev, password: false }));
    }
  };

  const handleLinkGoogle = async () => {
      if (!user) return;
      setIsLoading(prev => ({...prev, google: true}));
      const provider = new GoogleAuthProvider();
      try {
          await linkWithPopup(user, provider);
          toast({ title: "Google Account Linked", description: "You can now sign in using Google." });
      } catch (error: any) {
          handleFirebaseError(error);
      } finally {
          setIsLoading(prev => ({...prev, google: false}));
      }
  };

  const handleUnlinkGoogle = async () => {
      if (!user) return;
      if (user.providerData.length <= 1) {
          toast({ variant: 'destructive', title: "Cannot Unlink", description: "You cannot unlink your only sign-in method."});
          return;
      }
      setIsLoading(prev => ({...prev, google: true}));
      try {
          await unlink(user, 'google.com');
          toast({ title: "Google Account Unlinked" });
      } catch (error: any) {
          handleFirebaseError(error);
      } finally {
          setIsLoading(prev => ({...prev, google: false}));
      }
  };
  
  if (isUserLoading) {
      return (
          <div>
              <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
              <div className="grid gap-6 max-w-2xl mx-auto">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
          </div>
      )
  }

  if (!user) {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
            <p>Please log in to manage your settings.</p>
        </div>
    )
  }

  const isGoogleLinked = user.providerData.some(p => p.providerId === 'google.com');
  const hasPasswordProvider = user.providerData.some(p => p.providerId === 'password');

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Settings</h1>
      
      <div className="grid gap-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Email Address</CardTitle>
            <CardDescription>Manage the email address associated with your admin account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading.email}>
                  {isLoading.email && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Email
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {hasPasswordProvider && (
            <Card>
            <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your account password. This requires a recent login.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" disabled={isLoading.password}>
                    {isLoading.password && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Password
                    </Button>
                </form>
                </Form>
            </CardContent>
            </Card>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Manage your third-party sign-in methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                    <div>
                        <p className="font-medium">Google</p>
                        <p className="text-sm text-muted-foreground">
                            {isGoogleLinked ? 'Connected' : 'Not Connected'}
                        </p>
                    </div>
                    {isGoogleLinked ? (
                        <Button variant="destructive" onClick={handleUnlinkGoogle} disabled={isLoading.google}>
                             {isLoading.google && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Unlink
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={handleLinkGoogle} disabled={isLoading.google}>
                            {isLoading.google && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Link Google Account
                        </Button>
                    )}
                </div>
                 {!hasPasswordProvider && (
                    <div className="text-sm text-yellow-700 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-start gap-2">
                        <KeyRound className="h-4 w-4 mt-0.5 shrink-0" />
                        <span>
                            You do not have a password set for this account. To add one, please use the "Forgot Password" feature on the login page.
                        </span>
                    </div>
                 )}
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
