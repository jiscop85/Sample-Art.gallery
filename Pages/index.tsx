import { Hero } from "@/components/Hero";
import { PaintingStyles } from "@/components/PaintingStyles";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-display font-bold text-gradient">
            آتلیه رنگینه
          </Link>
          
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 ml-2" />
                    پنل کاربری
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 ml-2" />
                  خروج
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm">ورود / ثبت‌نام</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <div className="pt-16">
        <Hero />
        <PaintingStyles />
        <Gallery />
        <Footer />
      </div>
    </div>
  );
};

export default Index;

