'use client';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';

// Static data as a placeholder for a real API call
const staticReviews = [
    {
        author_name: "Sarah L.",
        rating: 5,
        relative_time_description: "a month ago",
        text: "I can't recommend PhysioGuide enough! After months of shoulder pain, their personalized plan got me back to pain-free workouts. The therapists are knowledgeable and truly care.",
        profile_photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&fit=crop&crop=faces"
    },
    {
        author_name: "Mark T.",
        rating: 5,
        relative_time_description: "3 weeks ago",
        text: "The team here is fantastic. They didn't just treat my back pain, they educated me on how to prevent it from coming back. The facility is modern and clean. A+ service.",
        profile_photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop&crop=faces"
    },
    {
        author_name: "Emily C.",
        rating: 4,
        relative_time_description: "2 months ago",
        text: "A very positive experience. My recovery from knee surgery was much faster than I expected, thanks to their expert guidance. The only minor issue was occasional difficulty booking peak hour slots.",
        profile_photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=256&h=256&fit=crop&crop=faces"
    },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-4 w-4 ${
                        i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                />
            ))}
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C39.302,36.55,44,30.7,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            <path fill="#34A853" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
            <path fill="#EA4335" d="M43.611,20.083l-0.011-0.083H24v8h11.303c-1.649,4.657-6.08,8-11.303,8l-0.003-0.002C18.798,36,14.79,32.683,12.717,28.054l-6.522,5.025C9.505,39.556,16.227,44,24,44l-0.001,0c5.166,0,9.86-1.977,13.409-5.192l0.002-0.002L43.611,20.083z"/>
        </svg>
    );
}

export function GoogleReviews() {
    return (
        <div className="space-y-6">
            {staticReviews.map((review, index) => (
                <Card key={index} className="border-2 shadow-sm">
                     <CardHeader className="flex flex-row items-start justify-between">
                        <div className="flex items-center gap-3">
                             <Image
                                src={review.profile_photo_url}
                                alt={review.author_name}
                                width={40}
                                height={40}
                                className="rounded-full"
                            />
                            <div>
                                <CardTitle className="text-base font-semibold">{review.author_name}</CardTitle>
                                <CardDescription className="text-xs">{review.relative_time_description}</CardDescription>
                            </div>
                        </div>
                         <GoogleIcon />
                    </CardHeader>
                    <CardContent>
                        <StarRating rating={review.rating} />
                        <p className="mt-3 text-muted-foreground text-sm italic">"{review.text}"</p>
                    </CardContent>
                </Card>
            ))}
            <Button asChild variant="outline" className="w-full">
                {/* Replace with your actual Google Business page URL */}
                <Link href="#" target="_blank" rel="noopener noreferrer">
                    See More on Google
                </Link>
            </Button>
        </div>
    );
}
