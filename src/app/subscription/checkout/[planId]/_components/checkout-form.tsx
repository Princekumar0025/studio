'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  useFirestore,
  FirestorePermissionError,
  errorEmitter
} from '@/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { type User } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock } from 'lucide-react';
import Image from 'next/image';

type Plan = {
  id: string;
  name: string;
  price: number;
  durationInDays: number;
};

const creditCardSchema = z.object({
  cardNumber: z.string().min(16, "Invalid card number").max(16, "Invalid card number"),
  cardName: z.string().min(2, "Name is required"),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid format (MM/YY)"),
  cvc: z.string().min(3, "Invalid CVC").max(4, "Invalid CVC"),
});

type CheckoutFormProps = {
  plan: Plan;
  user: User;
}

export function CheckoutForm({ plan, user }: CheckoutFormProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [activeTab, setActiveTab] = useState('credit-card');

  const form = useForm<z.infer<typeof creditCardSchema>>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvc: '',
    },
  });

  const createSubscription = async () => {
    if (!firestore) return;

    setIsSubscribing(true);

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + plan.durationInDays);

    const subscriptionData = {
        userId: user.uid,
        userEmail: user.email,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        status: 'active' as const,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
    };

    const newSubscriptionRef = collection(firestore, 'users', user.uid, 'subscriptions');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      await addDoc(newSubscriptionRef, subscriptionData);
      toast({
          title: "Payment Successful!",
          description: `You are now subscribed to the "${plan.name}" plan.`,
      });
      router.push('/account');
    } catch(error) {
      const permissionError = new FirestorePermissionError({
          path: newSubscriptionRef.path,
          operation: 'create',
          requestResourceData: {
              ...subscriptionData,
              startDate: 'SERVER_TIMESTAMP',
              endDate: 'CALCULATED_TIMESTAMP'
          }
      });
      errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSubscribing(false);
    }
  }

  const handlePayment = (values?: z.infer<typeof creditCardSchema>) => {
    // In a real app, you would process the payment here with Stripe, PayPal, etc.
    // For this simulation, we'll just create the subscription directly.
    console.log('Simulating payment for tab:', activeTab, 'with values:', values);
    createSubscription();
  }

  return (
    <Card className="shadow-lg border-2">
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>All transactions are secure and encrypted.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="credit-card">Card</TabsTrigger>
                <TabsTrigger value="paypal">PayPal</TabsTrigger>
                <TabsTrigger value="qr-code">QR Code</TabsTrigger>
            </TabsList>
            <TabsContent value="credit-card" className="mt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-4">
                        <FormField control={form.control} name="cardNumber" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Card Number</FormLabel>
                                <FormControl><Input placeholder="0000 0000 0000 0000" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                         <FormField control={form.control} name="cardName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name on Card</FormLabel>
                                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <div className="grid grid-cols-2 gap-4">
                             <FormField control={form.control} name="expiryDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expiry (MM/YY)</FormLabel>
                                    <FormControl><Input placeholder="MM/YY" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="cvc" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CVC</FormLabel>
                                    <FormControl><Input placeholder="123" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                        <Button type="submit" className="w-full" disabled={isSubscribing}>
                            {isSubscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Lock className="mr-2 h-4 w-4" />}
                            Pay ${plan.price}
                        </Button>
                    </form>
                </Form>
            </TabsContent>
            <TabsContent value="paypal" className="mt-6 text-center space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">You will be redirected to PayPal to complete your secure payment.</p>
                 <Button onClick={() => handlePayment()} className="w-full" disabled={isSubscribing}>
                    {isSubscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Continue with PayPal
                </Button>
            </TabsContent>
             <TabsContent value="qr-code" className="mt-6 text-center space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">Scan the QR code with your UPI or other payment app.</p>
                <div className="flex justify-center p-4 bg-white rounded-md border">
                   <Image src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=example@upi" alt="QR Code" width={150} height={150} />
                </div>
                 <Button onClick={() => handlePayment()} className="w-full" variant="outline" disabled={isSubscribing}>
                    {isSubscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                    Simulate Successful Scan
                </Button>
            </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
