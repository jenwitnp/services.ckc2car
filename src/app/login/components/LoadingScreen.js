"use client";

import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/Card";

export function LoadingScreen({ message = "กำลังโหลด..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-main-100 via-main-50 to-main-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            <span className="ml-3 text-main-600">{message}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
