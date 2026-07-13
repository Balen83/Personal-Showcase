import { createContext, useContext, useEffect, useState } from "react";

type Language = "ku" | "en" | "ar";

type Translations = Record<string, string>;

const dictionary: Record<Language, Translations> = {
  ku: {
    "nav.marketplace": "بازاڕ",
    "nav.sell": "فرۆشتن",
    "hero.tag": "ڕۆژانە کاڵای نوێ",
    "hero.title": "خوازراو.<br/>ناوازە.",
    "hero.subtitle": "کڕین و فرۆشتنی پێڵاوی بەکارهاتوو لە کوردستان",
    "trending.title": "پڕفرۆشترینەکان",
    "trending.count": "پیشاندانی {count} جووت",
    "trending.empty": "هیچ پێڵاوێک دانەنراوە.",
    "seller.title": "فرۆشتن لە HB.store",
    "seller.subtitle": "پێڵاوە ناوازەکانت بخەرە ڕوو بۆ کڕیارانمان.",
    "seller.details": "وردەکارییەکانی بەرهەم",
    "seller.fillOut": "وردەکارییەکانی خوارەوە پڕبکەرەوە بۆ دروستکردنی لیستی بەرهەمەکەت.",
    "seller.nameLabel": "ناوی پێڵاو",
    "seller.namePlaceholder": "نموونە: Jordan 1 Retro High OG",
    "seller.priceLabel": "نرخ (دۆلار)",
    "seller.pricePlaceholder": "0.00",
    "seller.imageLabel": "بەستەری وێنە",
    "seller.imagePlaceholder": "https://example.com/image.jpg",
    "seller.descLabel": "وەسف",
    "seller.descPlaceholder": "باری پێڵاوەکە، بوونی قتیکەی، و تایبەتمەندییەکانی بنووسە...",
    "seller.publishing": "بڵاوکردنەوە...",
    "seller.publish": "بڵاوکردنەوەی بەرهەم",
    "seller.toastTitle": "بەرهەمەکە زیادکرا",
    "seller.toastDesc": "{name} ئێستا لە بازاڕە.",
    "error.name": "ناو دەبێت لانی کەم ٢ پیت بێت",
    "error.price": "نرخ دەبێت زیاتر بێت لە ٠",
    "error.url": "بەستەرێکی دروست بنووسە",
    "error.desc": "وەسف دەبێت لانی کەم ١٠ پیت بێت",
    "footer.tagline": "بازاڕی پێڵاوی بەکارهاتووی ناوازە. گەرەنتی ڕەسەنایەتی.",
    "404.title": "پەڕەکە نەدۆزرایەوە",
    "404.desc": "ئەو جووتەی بەدوایدا دەگەڕێیت لەوانەیە فرۆشرابێت یان بەستەرەکە شکاوە.",
    "404.back": "گەڕانەوە بۆ بازاڕ",
  },
  en: {
    "nav.marketplace": "Marketplace",
    "nav.sell": "Sell",
    "hero.tag": "New arrivals daily",
    "hero.title": "COVETED.<br/>CURATED.",
    "hero.subtitle": "The premier destination for premium used sneakers in Kurdistan.",
    "trending.title": "Trending Now",
    "trending.count": "Showing {count} pairs",
    "trending.empty": "No sneakers listed yet.",
    "seller.title": "Sell on HB.store",
    "seller.subtitle": "List your premium sneakers to our marketplace of collectors.",
    "seller.details": "Product Details",
    "seller.fillOut": "Fill out the details below to create your listing.",
    "seller.nameLabel": "Sneaker Name",
    "seller.namePlaceholder": "e.g. Jordan 1 Retro High OG",
    "seller.priceLabel": "Price (USD)",
    "seller.pricePlaceholder": "0.00",
    "seller.imageLabel": "Image URL",
    "seller.imagePlaceholder": "https://example.com/image.jpg",
    "seller.descLabel": "Description",
    "seller.descPlaceholder": "Describe the condition, box included, special features...",
    "seller.publishing": "Publishing...",
    "seller.publish": "Publish Listing",
    "seller.toastTitle": "Listing created",
    "seller.toastDesc": "{name} is now live on the marketplace.",
    "error.name": "Name must be at least 2 characters",
    "error.price": "Price must be greater than 0",
    "error.url": "Must be a valid URL",
    "error.desc": "Description must be at least 10 characters",
    "footer.tagline": "Premium Sneaker Resale. Authenticity Guaranteed.",
    "404.title": "Page not found",
    "404.desc": "The pair you're looking for seems to have sold out or the link is broken.",
    "404.back": "Back to Marketplace",
  },
  ar: {
    "nav.marketplace": "السوق",
    "nav.sell": "بيع",
    "hero.tag": "وصول جديد يومياً",
    "hero.title": "مرغوب.<br/>منتقى بعناية.",
    "hero.subtitle": "الوجهة الأولى لبيع وشراء الأحذية الرياضية المستعملة الفاخرة في كردستان.",
    "trending.title": "رائج الآن",
    "trending.count": "عرض {count} زوج",
    "trending.empty": "لم يتم إدراج أي أحذية رياضية بعد.",
    "seller.title": "البيع على HB.store",
    "seller.subtitle": "اعرض أحذيتك الرياضية الفاخرة في سوقنا للمشترين.",
    "seller.details": "تفاصيل المنتج",
    "seller.fillOut": "املأ التفاصيل أدناه لإنشاء إدراجك.",
    "seller.nameLabel": "اسم الحذاء الرياضي",
    "seller.namePlaceholder": "مثال: Jordan 1 Retro High OG",
    "seller.priceLabel": "السعر (دولار)",
    "seller.pricePlaceholder": "0.00",
    "seller.imageLabel": "رابط الصورة",
    "seller.imagePlaceholder": "https://example.com/image.jpg",
    "seller.descLabel": "الوصف",
    "seller.descPlaceholder": "صف حالة الحذاء، توفر العلبة، والميزات الخاصة...",
    "seller.publishing": "جاري النشر...",
    "seller.publish": "نشر الإدراج",
    "seller.toastTitle": "تم إنشاء الإدراج",
    "seller.toastDesc": "{name} متاح الآن في السوق.",
    "error.name": "يجب أن يتكون الاسم من حرفين على الأقل",
    "error.price": "يجب أن يكون السعر أكبر من 0",
    "error.url": "يجب أن يكون رابطاً صالحاً",
    "error.desc": "يجب أن يتكون الوصف من 10 أحرف على الأقل",
    "footer.tagline": "سوق الأحذية الرياضية الفاخرة المستعملة. أصالة مضمونة.",
    "404.title": "الصفحة غير موجودة",
    "404.desc": "الزوج الذي تبحث عنه ربما تم بيعه أو أن الرابط معطل.",
    "404.back": "العودة إلى السوق",
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("hb_store_lang");
    return (saved as Language) || "ku";
  });

  useEffect(() => {
    localStorage.setItem("hb_store_lang", language);
    const dir = language === "en" ? "ltr" : "rtl";
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    if (language === "en") {
      document.documentElement.classList.remove("font-arabic");
    } else {
      document.documentElement.classList.add("font-arabic");
    }
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>) => {
    let str = dictionary[language][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };

  const dir = language === "en" ? "ltr" : "rtl";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
