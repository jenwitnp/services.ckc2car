"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import { Icons } from "@/app/components/ui/Icons";

export function LineConnectPrompt({ onConnectLine, onSkip, loadingProvider }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-main-100 via-main-50 to-main-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-social-line-100 flex items-center justify-center">
            <Icons.Line className="h-6 w-6 text-social-line-600" />
          </div>
          <CardTitle className="text-main-900">เชื่อมต่อบัญชี LINE</CardTitle>
          <CardDescription className="text-main-600">
            คุณได้เข้าสู่ระบบแล้ว ต้องการเชื่อมต่อบัญชี LINE ของคุณหรือไม่?
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            onClick={onConnectLine}
            disabled={loadingProvider !== null}
            fullWidth
            variant="line"
            size="lg"
            icon={Icons.Line}
            loading={loadingProvider === "line"}
          >
            เชื่อมต่อบัญชี
          </Button>
          <Button variant="outline" fullWidth onClick={onSkip}>
            ข้ามไปก่อน
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
