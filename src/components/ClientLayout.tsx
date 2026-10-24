"use client";
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "@/contexts/AuthContext";
import Navmenu from "@/app/components/common/Navmenu";
import Footer from "@/app/components/common/Footer";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <HeroUIProvider>
      <AuthProvider>
        <Navmenu />
        <div className="flex-1">{children}</div>
        <Footer />
      </AuthProvider>
    </HeroUIProvider>
  );
}