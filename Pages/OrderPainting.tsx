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
