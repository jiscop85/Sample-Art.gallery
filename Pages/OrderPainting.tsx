import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const steps = [
  { id: 1, title: "انتخاب سبک", description: "سبک نقاشی مورد نظر خود را انتخاب کنید" },
  { id: 2, title: "جزئیات سفارش", description: "عکس مرجع و توضیحات" },
  { id: 3, title: "مشخصات", description: "سایز و متریال" },
  { id: 4, title: "پیش‌نمایش AI", description: "مشاهده پیش‌نمایش نقاشی" },
  { id: 5, title: "تایید و پرداخت", description: "بررسی نهایی و پرداخت" },
];

const OrderPainting = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [styles, setStyles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    styleId: "",
    canvasSize: "50x70",
    material: "oil",
    isRush: false,
    customerNotes: "",
    aiPrompt: "",
    referenceImage: null as File | null,
  });
  const [aiPreview, setAiPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      toast.error("لطفاً ابتدا وارد شوید");
      navigate("/auth");
    }
  }, [user, navigate]);

  useEffect(() => {
    loadStyles();
  }, []);

 const loadStyles = async () => {
    const { data, error } = await supabase
      .from("painting_styles")
      .select("*")
      .eq("is_active", true);

    if (error) {
      toast.error("خطا در بارگذاری سبک‌ها");
    } else {
      setStyles(data || []);
    }
  };

  const generateAIPreview = async () => {
    if (!formData.aiPrompt && !formData.customerNotes) {
      toast.error("لطفاً توضیحاتی برای نقاشی وارد کنید");
      return;
    }

    setIsLoading(true);
    try {
      const selectedStyle = styles.find((s) => s.id === formData.styleId);
      const prompt = `${formData.aiPrompt || formData.customerNotes}. Style: ${selectedStyle?.name_en}. High quality painting, professional artwork`;

      const { data, error } = await supabase.functions.invoke("generate-ai-preview", {
        body: { prompt },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setAiPreview(data.imageUrl);
        toast.success("پیش‌نمایش ساخته شد! ✨");
        setCurrentStep(4);
      }
    } catch (error: any) {
      console.error("AI Preview Error:", error);
      toast.error("خطا در ساخت پیش‌نمایش");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    setIsLoading(true);
    try {
      const basePrice = formData.canvasSize === "30x40" ? 500000 :
                        formData.canvasSize === "50x70" ? 800000 :
                        formData.canvasSize === "70x100" ? 1200000 : 1500000;
      const rushFee = formData.isRush ? 300000 : 0;

  const { error } = await supabase.from("orders").insert({
        user_id: user?.id,
        style_id: formData.styleId,
        canvas_size: formData.canvasSize,
        material: formData.material,
        ai_prompt: formData.aiPrompt,
        customer_notes: formData.customerNotes,
        ai_preview_url: aiPreview,
        base_price: basePrice,
        rush_fee: rushFee,
        total_price: basePrice + rushFee,
        is_rush: formData.isRush,
        status: "ai_preview",
      } as any);

      if (error) throw error;

      toast.success("سفارش شما ثبت شد! 🎨");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("خطا در ثبت سفارش");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

 return (
    <div className="min-h-screen bg-canvas-texture py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">
            سفارش نقاشی با AI
          </h1>
          <p className="text-muted-foreground">
            نقاشی رویایی خود را با کمک هوش مصنوعی بسازید
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex flex-col items-center ${index < steps.length - 1 ? "flex-1" : ""}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep >= step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.id}
                  </div>
                  <span className="text-xs mt-2 hidden md:block">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 rounded ${currentStep > step.id ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {styles.map((style) => (
                    <Card
                      key={style.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.styleId === style.id ? "border-2 border-primary" : ""
                      }`}
                      onClick={() => setFormData({ ...formData, styleId: style.id })}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-1">{style.name_fa}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{style.name_en}</p>
                        <p className="text-sm">{style.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <Label>آپلود عکس مرجع (اختیاری)</Label>
                    <div className="mt-2 border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        برای آپلود کلیک کنید یا فایل را بکشید
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="aiPrompt">پرامپت برای AI (پیشنهادی)</Label>
                    <Textarea
                      id="aiPrompt"
                      placeholder="مثال: پرتره دختر با لباس سنتی ایرانی در سبک ون‌گوگ"
                      value={formData.aiPrompt}
                      onChange={(e) => setFormData({ ...formData, aiPrompt: e.target.value })}
                      rows={3}
                    />
                  </div>

 <div>
                    <Label htmlFor="notes">توضیحات تکمیلی</Label>
                    <Textarea
                      id="notes"
                      placeholder="توضیحات خود را بنویسید..."
                      value={formData.customerNotes}
                      onChange={(e) => setFormData({ ...formData, customerNotes: e.target.value })}
                      rows={4}
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <Label>سایز بوم</Label>
                    <RadioGroup
                      value={formData.canvasSize}
                      onValueChange={(value) => setFormData({ ...formData, canvasSize: value })}
                      className="grid grid-cols-2 gap-4 mt-2"
                    >
                      {["30x40", "50x70", "70x100", "100x100"].map((size) => (
                        <div key={size} className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value={size} id={size} />
                          <Label htmlFor={size} className="cursor-pointer">
                            {size} سانتی‌متر
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="material">نوع متریال</Label>
                    <Select
                      value={formData.material}
                      onValueChange={(value) => setFormData({ ...formData, material: value })}
                    >
                      <SelectTrigger id="material">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oil">رنگ روغن</SelectItem>
                        <SelectItem value="watercolor">آبرنگ</SelectItem>
                        <SelectItem value="acrylic">اکریلیک</SelectItem>
                        <SelectItem value="pencil">مداد رنگی</SelectItem>
                        <SelectItem value="digital">دیجیتال پرینت</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id="rush"
                      checked={formData.isRush}
                      onChange={(e) => setFormData({ ...formData, isRush: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="rush" className="cursor-pointer">
                      سفارش فوری (7 روزه) - هزینه اضافه: 300,000 تومان
                    </Label>
                  </div>
                </motion.div>
              )}

 {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {!aiPreview ? (
                    <div className="text-center py-12">
                      <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
                      <p className="text-lg mb-4">پیش‌نمایش نقاشی با AI بسازید</p>
                      <Button onClick={generateAIPreview} disabled={isLoading} size="lg">
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            در حال ساخت...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            ساخت پیش‌نمایش
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-4">
                        <img src={aiPreview} alt="AI Preview" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        این پیش‌نمایش با هوش مصنوعی ساخته شده است. نقاشی نهایی توسط هنرمند واقعی کشیده می‌شود.
                      </p>
                      <Button onClick={generateAIPreview} variant="outline" className="w-full" disabled={isLoading}>
                        ساخت مجدد
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="bg-muted/50 rounded-lg p-6">
                    <h3 className="font-bold mb-4">خلاصه سفارش</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>سایز:</span>
                        <span className="font-bold">{formData.canvasSize} سانتی‌متر</span>
                      </div>
                      <div className="flex justify-between">
                        <span>متریال:</span>
                        <span className="font-bold">{formData.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>قیمت پایه:</span>
                        <span>500,000 تومان</span>
                      </div>
                      {formData.isRush && (
                        <div className="flex justify-between">
                          <span>هزینه فوری:</span>
                          <span>300,000 تومان</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-base">
                        <span>جمع کل:</span>
                        <span className="text-primary">
                          {(formData.isRush ? 800000 : 500000).toLocaleString()} تومان
                        </span>
                      </div>
                    </div>
                  </div>
