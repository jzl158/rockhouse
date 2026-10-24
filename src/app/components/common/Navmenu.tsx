"use client";
import React from "react";
import Image from "next/image";
import NextLink from "next/link";
import {  
    Navbar,   
    NavbarBrand,   
    NavbarContent,   
    NavbarItem,   
    NavbarMenuToggle,  
    NavbarMenu,  
    NavbarMenuItem
} from "@heroui/navbar";
import { menuLinks } from "@/data/menuLinks";
import { useAuth } from "@/contexts/AuthContext";

export const RockhouseLogo = () => {
  return (
    <Image
      src="/rockhouse-icon.png" // in /public folder
      alt="Rockhouse ATL Logo"
      width={36}
      height={36}
      priority
    />
  );
};

export default function Navmenu() {
  const { user, profile, signOut } = useAuth();

  return (
    <Navbar>
      <div className="flex items-center gap-8">
        <NavbarBrand>
          <NextLink href="/" className="flex items-center gap-2">
            <RockhouseLogo />
          </NextLink>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4">
          {menuLinks.map((link) => (
            <NavbarItem key={link.href}>
              <NextLink
                href={link.href}
                className="text-[#255756] uppercase font-league-spartan font-bold"
              >
                {link.label}
              </NextLink>
            </NavbarItem>
          ))}
        </NavbarContent>
      </div>

      <NavbarContent justify="end">
        {user ? (
          <>
            {/* Role-based dashboard links */}
            <NavbarItem className="hidden lg:flex">
              <NextLink 
                href={
                  profile?.role === 'admin_assist' || profile?.role === 'Employee' 
                    ? "/admin" 
                    : profile?.role === 'employee' 
                    ? "/employee"
                    : "/customer"
                } 
                className="text-[#255756] hover:underline"
              >
                Dashboard
              </NextLink>
            </NavbarItem>
            <NavbarItem className="hidden lg:flex">
              <button 
                onClick={async () => { await signOut(); window.location.assign("/"); }} 
                className="text-[#255756] hover:underline"
              >
                Sign Out
              </button>
            </NavbarItem>
          </>
        ) : (
          <>
            <NavbarItem className="hidden lg:flex">
              <NextLink 
                href="/contact?type=quote" 
                className="bg-[#255756] text-white px-4 py-2 rounded hover:bg-[#418F6D] transition-colors"
              >
                Get Quote
              </NextLink>
            </NavbarItem>
            <NavbarItem className="hidden lg:flex">
              <NextLink 
                href="/login" 
                className="border-2 border-[#255756] text-[#255756] px-4 py-2 rounded hover:bg-[#255756] hover:text-white transition-colors"
              >
                Login
              </NextLink>
            </NavbarItem>

          </>
        )}
      </NavbarContent>
    </Navbar>
  );
}