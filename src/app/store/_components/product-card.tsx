"use client"

import Image from "next/image";
import { type Product } from "@/lib/data";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const image = PlaceHolderImages.find((p) => p.id === product.imageId);
  const { toast } = useToast();

  const handleAddToCart = () => {
    toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <div className="relative h-60 w-full overflow-hidden">
        {image && (
          <Image
            src={image.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={image.imageHint}
          />
        )}
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-xl min-h-[3rem]">{product.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground text-sm">{product.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <p className="font-bold text-lg text-primary">${product.price.toFixed(2)}</p>
        <Button onClick={handleAddToCart}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
