import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/language-context";
import { fileToResizedBase64 } from "@/lib/image-utils";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

export function EditProductDialog({
  product,
  open,
  onOpenChange,
  onSave,
}: {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    name: string;
    price: number;
    currency: "usd" | "iqd";
    description: string;
    location: string;
    size: string;
    conditionRating?: number;
    imageUrl: string;
    images: string[];
  }) => Promise<void>;
}) {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"usd" | "iqd">("usd");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setPrice(String(product.price));
      setCurrency((product.currency as "usd" | "iqd") ?? "usd");
      setDescription(product.description);
      setLocation(product.location);
      setSize(product.size ?? "");
      setCondition(product.conditionRating != null ? String(product.conditionRating) : "");
      const all = [product.imageUrl, ...(product.images ?? [])].filter(Boolean);
      setImages(Array.from(new Set(all)));
    }
  }, [product]);

  const addImage = async (file: File) => {
    if (images.length >= 4) return;
    try {
      const base64 = await fileToResizedBase64(file);
      setImages((prev) => [...prev, base64]);
    } catch {
      toast.error(t("error.image"));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        name,
        price: Number(price),
        currency,
        description,
        location,
        size,
        conditionRating: condition ? Number(condition) : undefined,
        imageUrl: images[0] ?? "",
        images: images.slice(1),
      });
      onOpenChange(false);
      toast.success(t("product.updated"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("product.edit")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t("seller.nameLabel")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("seller.priceLabel")}</Label>
              <Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>{t("currency.label")}</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as "usd" | "iqd")} dir={dir}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">{t("currency.usd")}</SelectItem>
                  <SelectItem value="iqd">{t("currency.iqd")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("size.label")}</Label>
              <Input value={size} onChange={(e) => setSize(e.target.value)} placeholder={t("size.placeholder")} required />
            </div>
            <div className="space-y-2">
              <Label>{t("condition.label")}</Label>
              <Input type="number" min={1} max={10} value={condition} onChange={(e) => setCondition(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("location.label")}</Label>
            <Select value={location} onValueChange={setLocation} dir={dir}>
              <SelectTrigger>
                <SelectValue placeholder={t("location.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="erbil">{t("location.erbil")}</SelectItem>
                <SelectItem value="sulaymaniyah">{t("location.sulaymaniyah")}</SelectItem>
                <SelectItem value="duhok">{t("location.duhok")}</SelectItem>
                <SelectItem value="kirkuk">{t("location.kirkuk")}</SelectItem>
                <SelectItem value="online">{t("location.online")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("seller.descLabel")}</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[100px]" required />
          </div>

          <div className="space-y-2">
            <Label>{t("gallery.maxImages")}</Label>
            <div className="flex gap-2 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-16 h-16 rounded-md overflow-hidden border border-border/50">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                    className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center", isRTL ? "left-0.5" : "right-0.5")}
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {images.length < 4 && (
                <label className="w-16 h-16 rounded-md border border-dashed border-border flex items-center justify-center cursor-pointer text-muted-foreground">
                  <Plus className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) addImage(file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              {t("product.cancel")}
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {t("product.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
