"use client";

import { AlertCircle } from "lucide-react";
import Button from "@/app/components/ui/Button";

export function SocialLoginButtons({
  providers,
  onProviderLogin,
  loadingProvider,
  isLoading,
  isInLineApp,
}) {
  if (!providers || providers.length === 0) return null;

  return (
    <div className="space-y-3">
      {providers.map((provider) => {
        const isLoadingProvider = loadingProvider === provider.id;
        const Icon = provider.icon;

        return (
          <Button
            key={provider.id}
            onClick={() => onProviderLogin(provider.id)}
            disabled={loadingProvider !== null || isLoading}
            fullWidth
            variant="outline"
            className={`
              ${provider.borderColor} ${provider.bgColor}
              hover:${provider.bgColor} ${provider.textColor}
            `}
            icon={Icon}
            loading={isLoadingProvider}
          >
            {isLoadingProvider
              ? `กำลังเข้าสู่ระบบ ${provider.name}...`
              : `เข้าสู่ระบบด้วย ${provider.name}`}
          </Button>
        );
      })}

      {/* Special note for LINE in browser */}
      {!isInLineApp && providers.some((p) => p.id === "line") && (
        <div className="mt-3 p-3 bg-social-line-50 border border-social-line-200 rounded-lg">
          <p className="text-xs text-social-line-700 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
            การใช้ LINE Login
            จากเบราว์เซอร์อาจต้องเปิดหน้าต่างใหม่เพื่อยืนยันตัวตน
          </p>
        </div>
      )}
    </div>
  );
}
