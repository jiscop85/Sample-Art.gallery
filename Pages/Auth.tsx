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

    try {
      const data = signInSchema.parse({
        email: formData.get("email"),
        password: formData.get("password"),
      });

      setIsLoading(true);
      const { error } = await signIn(data.email, data.password);

      if (error) {
        if (error.message.includes("Invalid")) {
          toast.error("ایمیل یا رمز عبور اشتباه است");
        } else {
          toast.error(error.message || "خطا در ورود");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => toast.error(err.message));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas-texture p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block mb-4"
          >
            <Palette className="w-16 h-16 text-primary mx-auto" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-gradient mb-2">
            آتلیه رنگینه
          </h1>
          <p className="text-muted-foreground">ورود به دنیای هنر</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>خوش آمدید</CardTitle>
            <CardDescription>
              برای سفارش نقاشی و ثبت‌نام در کلاس‌ها وارد شوید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" dir="rtl">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">ورود</TabsTrigger>
                <TabsTrigger value="signup">ثبت‌نام</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">ایمیل</Label>
                    <Input
                      id="signin-email"
                      name="email"
                      type="email"
                      placeholder="example@email.com"
                      required
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">رمز عبور</Label>
                    <Input
                      id="signin-password"
                      name="password"
                      type="password"
                      placeholder="••••••"
                      required
                      dir="ltr"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        در حال ورود...
                      </>
                    ) : (
                      "ورود"
                    )}
                  </Button>
                </form>
              </TabsContent>
