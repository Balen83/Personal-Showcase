import { useState, useEffect } from 'react';
import sneaker1 from "@assets/generated_images/sneaker_1.png";
import sneaker2 from "@assets/generated_images/sneaker_2.png";
import sneaker3 from "@assets/generated_images/sneaker_3.png";
import sneaker4 from "@assets/generated_images/sneaker_4.png";

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  description: string;
}

const SEED_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Retro High 'Bred' 2016",
    price: 850,
    imageUrl: sneaker1,
    description: "The classic black and red colorway that started it all. Premium leather construction with dramatic shadowing."
  },
  {
    id: "2",
    name: "Zebra Knit V2",
    price: 420,
    imageUrl: sneaker2,
    description: "Iconic black and white zebra-striped woven upper, levitating silhouette."
  },
  {
    id: "3",
    name: "Patchwork Skate Low",
    price: 1850,
    imageUrl: sneaker3,
    description: "Highly sought-after collaboration featuring distressed paisley canvas and plaid panels."
  },
  {
    id: "4",
    name: "Deconstructed Runner",
    price: 1100,
    imageUrl: sneaker4,
    description: "Deconstructed design with exposed mesh, signature red zip-tie, and industrial aesthetic."
  }
];

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("kicks_products");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.length > 0) {
          setProducts(parsed);
          setIsLoaded(true);
          return;
        }
      } catch (e) {
        console.error("Failed to parse products from local storage");
      }
    }
    
    // Seed if empty
    localStorage.setItem("kicks_products", JSON.stringify(SEED_PRODUCTS));
    setProducts(SEED_PRODUCTS);
    setIsLoaded(true);
  }, []);

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: Math.random().toString(36).substring(2, 9)
    };
    
    setProducts(prev => {
      const updated = [newProduct, ...prev];
      localStorage.setItem("kicks_products", JSON.stringify(updated));
      return updated;
    });
  };

  return { products, addProduct, isLoaded };
}