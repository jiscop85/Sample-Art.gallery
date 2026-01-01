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
