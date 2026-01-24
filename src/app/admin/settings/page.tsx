'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, FirestorePermissionError, errorEmitter } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { updateEmail, updatePassword, GoogleAuthProvider, linkWithPopup, unlink, RecaptchaVerifier, updatePhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { Loader2, KeyRound, Twitter, Facebook, Instagram, Trash2, PlusCircle, Save, Phone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/firebase';
import { Label } from '@/components/ui/label';

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

// Social Links Component
type SocialLink = {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram';
  url: string;
};

const socialIcons: { [key in SocialLink['platform']]: React.ReactNode } = {
  twitter: <Twitter className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
};

function SocialLinksManager() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const socialLinksCollection = useMemoFirebase(() => firestore ? collection(firestore, 'socialLinks') : null, [firestore]);
  const { data: socialLinks, isLoading } = useCollection<SocialLink>(socialLinksCollection);
  
  const [newPlatform, setNewPlatform] = useState<'twitter' | 'facebook' | 'instagram' | ''>('');
  const [newUrl, setNewUrl] = useState('');
  const [editingUrl, setEditingUrl] = useState<{[key: string]: string}>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdate = async (link: SocialLink) => {
    if (!firestore || !editingUrl[link.id]) return;
    setIsUpdating(link.id);
    const docRef = doc(firestore, 'socialLinks', link.id);
    try {
      await setDoc(docRef, { url: editingUrl[link.id] }, { merge: true });
      toast({ title: 'Success', description: `${link.platform} link updated.` });
      setEditingUrl(prev => ({...prev, [link.id]: ''}));
    } catch (error) {
       errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: { url: editingUrl[link.id] } }));
    } finally {
        setIsUpdating(null);
    }
  }

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'socialLinks', id);
    try {
        await deleteDoc(docRef);
        toast({ title: 'Success', description: 'Social link deleted.' });
    } catch(error) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'delete' }));
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !newPlatform || !newUrl || !socialLinksCollection) return;

    if (socialLinks?.some(link => link.platform === newPlatform)) {
      toast({ variant: 'destructive', title: 'Error', description: `A link for ${newPlatform} already exists.` });
      return;
    }
    
    setIsAdding(true);
    const newLink = { platform: newPlatform, url: newUrl };

    try {
        await addDoc(socialLinksCollection, newLink);
        toast({ title: 'Success', description: 'New social link added.'});
        setNewPlatform('');
        setNewUrl('');
    } catch (error) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({ path: socialLinksCollection.path, operation: 'create', requestResourceData: newLink }));
    } finally {
        setIsAdding(false);
    }
  }
  
  return (
    <Card>
        <CardHeader>
            <CardTitle>Social Media Links</CardTitle>
            <CardDescription>Manage the social media links displayed in the website footer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {isLoading && <Skeleton className="h-10 w-full" />}
            {socialLinks && socialLinks.map(link => (
                <div key={link.id} className="flex items-center gap-2">
                    <div className="p-2 bg-muted rounded-md">{socialIcons[link.platform]}</div>
                    <Input 
                        defaultValue={link.url}
                        onChange={e => setEditingUrl(prev => ({...prev, [link.id]: e.target.value}))}
                        placeholder="https://..."
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleUpdate(link)} disabled={isUpdating === link.id || !editingUrl[link.id] || editingUrl[link.id] === link.url}>
                        {isUpdating === link.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(link.id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
             {!isLoading && (!socialLinks || socialLinks.length === 0) && (
                <p className="text-sm text-muted-foreground text-center py-4">No social links added yet.</p>
             )}
        </CardContent>
        <CardHeader className="pt-0">
             <CardTitle className="text-lg">Add New Link</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
                 <Select value={newPlatform} onValueChange={(value) => setNewPlatform(value as any)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                    </SelectContent>
                </Select>
                <Input 
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    placeholder="https://twitter.com/your-profile"
                    className="flex-1"
                />
                <Button type="submit" disabled={isAdding || !newPlatform || !newUrl}>
                    {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    <span className="hidden sm:inline">Add Link</span>
                </Button>
            </form>
        </CardContent>
    </Card>
  )
}

const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  address: z.string().min(1, 'Address is required.'),
});

function ContactInfoManager() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const docRef = useMemoFirebase(() => firestore ? doc(firestore, 'contactInformation', 'main') : null, [firestore]);
  const { data: contactInfo, isLoading: isLoadingInfo } = useDoc<z.infer<typeof contactInfoSchema>>(docRef);

  const form = useForm<z.infer<typeof contactInfoSchema>>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: { email: '', phone: '', address: '' },
  });

  useEffect(() => {
    if (contactInfo) {
      form.reset(contactInfo);
    }
  }, [contactInfo, form]);
  
  const onSubmit = async (data: z.infer<typeof contactInfoSchema>) => {
    if (!docRef) return;
    setIsSubmitting(true);
    try {
      await setDoc(docRef, data, { merge: true });
      toast({ title: 'Success', description: 'Contact information updated.' });
    } catch (error) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: docRef.path, operation: 'update', requestResourceData: data }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
     <Card>
        <CardHeader>
            <CardTitle>Business Contact Information</CardTitle>
            <CardDescription>Update the contact details displayed on the contact page.</CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingInfo ? <Skeleton className="h-48 w-full" /> : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Contact Info
                </Button>
              </form>
            </Form>
            )}
        </CardContent>
    </Card>
  )
}

declare global {
    interface Window {
        recaptchaVerifier?: RecaptchaVerifier;
        confirmationResult?: ConfirmationResult;
    }
}

// Main Page Component
export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState({ email: false, password: false, google: false, phone: false });
  const [phoneUiState, setPhoneUiState] = useState<'phone-entry' | 'code-entry'>('phone-entry');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [phoneVerificationCode, setPhoneVerificationCode] = useState('');

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    values: { email: user?.email || '' }, // use `values` to keep it updated
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (!auth) return;
    
    if (!window.recaptchaVerifier) {
        const recaptchaContainer = document.getElementById('recaptcha-container');
        if (recaptchaContainer) {
            recaptchaContainer.innerHTML = '';
            window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
                'size': 'invisible',
                'callback': (response: any) => {},
            });
        }
    }
  }, [auth]);

  const handleFirebaseError = (error: any) => {
    let title = 'An error occurred';
    let description = error.message;

    switch (error.code) {
      case 'auth/requires-recent-login':
        title = 'Action Required';
        description = 'This is a sensitive action. Please log out and log back in to continue.';
        break;
      case 'auth/invalid-phone-number':
        title = 'Invalid Phone Number';
        description = 'The format is invalid. Please use E.164 format (e.g., +12223334444).';
        break;
      case 'auth/code-expired':
        title = 'Code Expired';
        description = 'The verification code has expired. Please request a new one.';
        break;
      case 'auth/invalid-verification-code':
        title = 'Invalid Code';
        description = 'The verification code you entered is incorrect.';
        break;
      case 'auth/too-many-requests':
        title = 'Too Many Requests';
        description = 'We have blocked all requests from this device due to unusual activity. Try again later.';
        break;
    }

    toast({
      variant: 'destructive',
      title: title,
      description: description,
      duration: 7000,
    });
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

  const handleUpdatePhoneNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPhoneNumber || !window.recaptchaVerifier) return;
    setIsLoading(prev => ({ ...prev, phone: true }));

    try {
      const confirmationResult = await updatePhoneNumber(user, newPhoneNumber, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setPhoneUiState('code-entry');
      toast({ title: 'Verification Code Sent', description: `A code has been sent via SMS to ${newPhoneNumber}.` });
    } catch (error: any) {
      handleFirebaseError(error);
    } finally {
      setIsLoading(prev => ({ ...prev, phone: false }));
    }
  };

  const handleConfirmPhoneUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirmationResult || !phoneVerificationCode) return;
    setIsLoading(prev => ({ ...prev, phone: true }));

    try {
      await window.confirmationResult.confirm(phoneVerificationCode);
      toast({ title: 'Phone Number Updated', description: 'Your phone number has been successfully updated.' });
      setPhoneUiState('phone-entry');
      setNewPhoneNumber('');
      setPhoneVerificationCode('');
    } catch (error: any) {
      handleFirebaseError(error);
    } finally {
      setIsLoading(prev => ({ ...prev, phone: false }));
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
      <div id="recaptcha-container"></div>
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
            <CardTitle>Phone Number</CardTitle>
            <CardDescription>Update the phone number used for sign-in and notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            {phoneUiState === 'phone-entry' ? (
              <form onSubmit={handleUpdatePhoneNumber} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Current Number: {user.phoneNumber || 'Not provided'}
                </p>
                <div className="space-y-2">
                  <Label htmlFor="phone">New Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 555-555-5555"
                    value={newPhoneNumber}
                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                    disabled={isLoading.phone}
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Use E.164 format (e.g., +12223334444). An SMS verification code will be sent. If you don't receive it, check if Phone Number sign-in is enabled in your Firebase project.
                  </p>
                </div>
                <Button type="submit" disabled={isLoading.phone || !newPhoneNumber}>
                  {isLoading.phone && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Code
                </Button>
              </form>
            ) : (
              <form onSubmit={handleConfirmPhoneUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="123456"
                    value={phoneVerificationCode}
                    onChange={(e) => setPhoneVerificationCode(e.target.value)}
                    disabled={isLoading.phone}
                    required
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" disabled={isLoading.phone || !phoneVerificationCode} className="w-full sm:w-auto">
                    {isLoading.phone && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify and Update
                  </Button>
                  <Button variant="link" onClick={() => setPhoneUiState('phone-entry')} disabled={isLoading.phone}>
                    Use a different number
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
        
        <ContactInfoManager />

        <SocialLinksManager />

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
