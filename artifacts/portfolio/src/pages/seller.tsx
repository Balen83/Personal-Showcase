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
import { useLanguage } from "@/lib/language-context";
import { cn } from "@/lib/utils";

export default function Seller() {
  const { addProduct } = useProducts();
  const [, setLocation] = useLocation();
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";

  const formSchema = z.object({
    name: z.string().min(2, t("error.name")),
    price: z.coerce.number().positive(t("error.price")),
    imageUrl: z.string().url(t("error.url")),
    description: z.string().min(10, t("error.desc")),
  });

  type FormValues = z.infer<typeof formSchema>;

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
      toast.success(t("seller.toastTitle"), {
        description: t("seller.toastDesc", { name: data.name })
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
            <h1 className="font-serif text-4xl font-bold tracking-tight mb-2">{t("seller.title")}</h1>
            <p className="text-muted-foreground">{t("seller.subtitle")}</p>
          </div>

          <Card className="border-border/50 bg-secondary/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>{t("seller.details")}</CardTitle>
              <CardDescription>{t("seller.fillOut")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("seller.nameLabel")}</Label>
                  <Input 
                    id="name" 
                    placeholder={t("seller.namePlaceholder")} 
                    {...register("name")}
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="price">{t("seller.priceLabel")}</Label>
                    <div className="relative">
                      <span className={cn(
                        "absolute top-1/2 -translate-y-1/2 text-muted-foreground",
                        isRTL ? "right-3" : "left-3"
                      )}>$</span>
                      <Input 
                        id="price" 
                        type="number" 
                        step="0.01" 
                        className={isRTL ? "pr-7 text-left font-sans" : "pl-7"} 
                        placeholder="0.00"
                        {...register("price")}
                      />
                    </div>
                    {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">{t("seller.imageLabel")}</Label>
                    <Input 
                      id="imageUrl" 
                      placeholder={t("seller.imagePlaceholder")}
                      className="text-left font-sans"
                      {...register("imageUrl")}
                    />
                    {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("seller.descLabel")}</Label>
                  <Textarea 
                    id="description" 
                    placeholder={t("seller.descPlaceholder")}
                    {...register("description")}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-medium" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t("seller.publishing") : t("seller.publish")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </RootLayout>
  );
}