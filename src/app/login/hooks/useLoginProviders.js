"use client";

import { Icons } from "@/app/components/ui/Icons";
import { Facebook, Apple } from "lucide-react";

// Login provider configurations
const LOGIN_PROVIDERS = {
  credentials: {
    id: "credentials",
    name: "ชื่อผู้ใช้/รหัสผ่าน",
    description: "เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน",
    icon: null,
    color: "bg-primary-500 hover:bg-primary-600",
    textColor: "text-primary-600",
    bgColor: "bg-primary-50",
    borderColor: "border-primary-200",
  },
  line: {
    id: "line",
    name: "LINE",
    description: "เข้าสู่ระบบด้วยบัญชี LINE",
    icon: Icons.Line,
    color: "bg-social-line-500 hover:bg-social-line-600",
    textColor: "text-social-line-600",
    bgColor: "bg-social-line-50",
    borderColor: "border-social-line-200",
  },
  google: {
    id: "google",
    name: "Google",
    description: "เข้าสู่ระบบด้วยบัญชี Google",
    icon: Icons.Google,
    color: "bg-social-google-500 hover:bg-social-google-600",
    textColor: "text-social-google-600",
    bgColor: "bg-social-google-50",
    borderColor: "border-social-google-200",
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    description: "เข้าสู่ระบบด้วยบัญชี Facebook",
    icon: Facebook,
    color: "bg-social-facebook-500 hover:bg-social-facebook-600",
    textColor: "text-social-facebook-600",
    bgColor: "bg-social-facebook-50",
    borderColor: "border-social-facebook-200",
  },
  apple: {
    id: "apple",
    name: "Apple",
    description: "เข้าสู่ระบบด้วย Apple ID",
    icon: Apple,
    color: "bg-social-apple-800 hover:bg-social-apple-900",
    textColor: "text-social-apple-800",
    bgColor: "bg-social-apple-50",
    borderColor: "border-social-apple-200",
  },
};

export function useLoginProviders() {
  // Get available providers
  const getAvailableProviders = () => {
    return Object.values(LOGIN_PROVIDERS).filter((provider) => {
      return ["credentials", "line"].includes(provider.id);
    });
  };

  // Get alternative providers based on current view
  const getAlternativeProviders = (showCredentialsForm) => {
    const availableProviders = getAvailableProviders();

    if (showCredentialsForm) {
      return availableProviders.filter((p) => p.id !== "credentials");
    } else {
      return availableProviders.filter((p) => p.id === "credentials");
    }
  };

  return {
    LOGIN_PROVIDERS,
    getAvailableProviders,
    getAlternativeProviders,
  };
}
