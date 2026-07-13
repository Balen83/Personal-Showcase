import { RootLayout } from "@/components/layout/RootLayout";
import { useProducts } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { motion } from "framer-motion";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  imageUrl: z.string().url("Must be a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Seller() {
  const { addProduct } = useProducts();
  const [, setLocation] = useLocation();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: undefined,
      imageUrl: "",
      description: ""
    }
  });

  const onSubmit = (data: FormValues) => {
    return new Promise(resolve => setTimeout(resolve, 600)).then(() => {
      addProduct(data);
      toast.success("Listing created", {
        description: `${data.name} is now live on the marketplace.`
      });
      setLocation("/");
    });
  };

  return (
    <RootLayout>
      <div className="container mx-auto px-6 py-24 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="font-serif text-4xl font-bold tracking-tight mb-2">Sell on Kicks</h1>
            <p className="text-muted-foreground">List your premium sneakers to our global marketplace of collectors.</p>
          </div>

          <Card className="border-border/50 bg-secondary/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>Fill out the details below to create your listing.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Sneaker Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Jordan 1 Retro High OG" 
                    {...register("name")}
                    data-testid="input-name"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input 
                        id="price" 
                        type="number" 
                        step="0.01" 
                        className="pl-7" 
                        placeholder="0.00"
                        {...register("price")}
                        data-testid="input-price"
                      />
                    </div>
                    {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input 
                      id="imageUrl" 
                      placeholder="https://example.com/image.jpg"
                      {...register("imageUrl")}
                      data-testid="input-imageurl"
                    />
                    {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Describe the condition, box included, special features..."
                    {...register("description")}
                    data-testid="input-description"
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-medium" 
                  disabled={isSubmitting}
                  data-testid="button-submit-listing"
                >
                  {isSubmitting ? "Publishing..." : "Publish Listing"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </RootLayout>
  );
}