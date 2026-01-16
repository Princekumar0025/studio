// This type is still used by ProductCard and the store page.
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageId: string;
};

// The static data arrays have been removed and are now fetched from Firestore.
