import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Palette, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "نام باید حداقل 2 کاراکتر باشد"),
  email: z.string().trim().email("ایمیل نامعتبر است"),
  password: z.string().min(6, "رمز عبور باید حداقل 6 کاراکتر باشد"),
});

const signInSchema = z.object({
  email: z.string().trim().email("ایمیل نامعتبر است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

const Auth = () => {
  const { user, signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const data = signUpSchema.parse({
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        password: formData.get("password"),
      });

      setIsLoading(true);
      const { error } = await signUp(data.email, data.password, data.fullName);

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("این ایمیل قبلاً ثبت شده است");
        } else {
          toast.error(error.message || "خطا در ثبت‌نام");
        }
      } else {
        toast.success("ثبت‌نام موفق! خوش آمدید 🎨");
        navigate("/");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
