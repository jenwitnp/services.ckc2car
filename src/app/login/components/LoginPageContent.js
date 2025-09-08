"use client";

import { useState, useEffect } from "react";
import { User, XCircle } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Alert from "@/app/components/ui/Alert";
import { Icons } from "@/app/components/ui/Icons";

// Components
import { LoginHeader } from "./LoginHeader";
import { CredentialsForm } from "./CredentialsForm";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { LineConnectPrompt } from "./LineConnectPrompt";
import { LoadingScreen } from "./LoadingScreen";

// Hooks
import { useLoginForm } from "../hooks/useLoginForm";
import { useLoginAuth } from "../hooks/useLoginAuth";
import { useLoginProviders } from "../hooks/useLoginProviders";

export function LoginPageContent() {
  const [showCredentialsForm, setShowCredentialsForm] = useState(true);

  // Custom hooks
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    reset,
    setFormError,
    clearErrors,
  } = useLoginForm();

  const {
    session,
    status,
    error,
    setError,
    isLoading,
    loadingProvider,
    userLoginData,
    isInLineApp,
    lineUser,
    redirectUrl,
    handleProviderLogin,
    handleCredentialsLogin,
    router,
  } = useLoginAuth();

  const { getAlternativeProviders } = useLoginProviders();

  // Auto-show LINE login for LINE app users
  useEffect(() => {
    if (isInLineApp() && !error) {
      setShowCredentialsForm(false);
    }
  }, [isInLineApp, error]);

  // Form submission handler
  const onSubmit = async (data) => {
    const result = await handleCredentialsLogin(data, setFormError);
    if (!result) {
      setShowCredentialsForm(true);
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");

      console.log("errors is ", error);
      reset();
    } else if (result && result.errorType === "LINE_NOT_CONNECT") {
      console.log("line not connect yet", userLoginData);
    } else {
      setTimeout(() => {
        router.push(redirectUrl || "/dashboard");
      }, 500);
    }

    // if (
    //   status === "unauthenticated" &&
    //   !userLoginData?.user?.isLineConnected &&
    //   !lineUser
    // ) {
    //   reset();
    // }
  };

  // Loading state
  if (status === "loading") {
    return <LoadingScreen message="กำลังตรวจสอบสถานะการเข้าสู่ระบบ..." />;
  }

  // If user is already logged in but needs to connect LINE
  if (userLoginData && !userLoginData.user?.isLineConnected && !lineUser) {
    return (
      <LineConnectPrompt
        onConnectLine={() => handleProviderLogin("line")}
        onSkip={() => router.push("/dashboard")}
        loadingProvider={loadingProvider}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <LoginHeader />

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert
              variant="destructive"
              icon={XCircle}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          {/* Credentials Form (primary view) */}
          {showCredentialsForm && (
            <div className="space-y-4">
              <CredentialsForm
                onSubmit={handleSubmit(onSubmit)}
                register={register}
                errors={errors}
                isLoading={isLoading}
                isSubmitting={isSubmitting}
              />

              {/* Alternative Login Methods */}
              {getAlternativeProviders(showCredentialsForm).filter(
                (provider) => provider.id === "line" && !lineUser
              ).length > 0 && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-main-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white text-main-500">หรือ</span>
                    </div>
                  </div>

                  <SocialLoginButtons
                    providers={getAlternativeProviders(
                      showCredentialsForm
                    ).filter((provider) => provider.id === "line" && !lineUser)}
                    onProviderLogin={handleProviderLogin}
                    loadingProvider={loadingProvider}
                    isLoading={isLoading}
                    isInLineApp={isInLineApp()}
                  />
                </>
              )}
            </div>
          )}

          {/* Provider Selection (for LINE app users) */}
          {!showCredentialsForm && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-main-900 mb-2">
                  เลือกวิธีการเข้าสู่ระบบ
                </h3>
                <p className="text-main-600 text-sm">
                  เลือกวิธีที่คุณต้องการใช้ในการเข้าสู่ระบบ
                </p>
              </div>

              {/* LINE Login (prioritized for LINE app) */}
              <Button
                onClick={() => handleProviderLogin("line")}
                disabled={loadingProvider !== null}
                fullWidth
                variant="line"
                size="lg"
                icon={Icons.Line}
                loading={loadingProvider === "line"}
              >
                {loadingProvider === "line"
                  ? "กำลังเข้าสู่ระบบ LINE..."
                  : "เข้าสู่ระบบด้วย LINE"}
              </Button>

              {/* Context-aware helper text */}
              <div className="p-3 bg-social-line-50 rounded-lg">
                <p className="text-xs text-social-line-700 text-center flex items-center justify-center">
                  <span className="mr-1">🔥</span>
                  คุณกำลังใช้งานผ่าน LINE App - แนะนำให้ใช้ LINE Login
                </p>
              </div>

              {/* Alternative: Credentials */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-main-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-main-500">หรือ</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  setShowCredentialsForm(true);
                  clearErrors();
                  reset();
                }}
                fullWidth
                variant="outline"
                icon={User}
              >
                ใช้ชื่อผู้ใช้และรหัสผ่าน
              </Button>
            </div>
          )}

          {/* Quick switch option */}
          {showCredentialsForm && isInLineApp() && (
            <div className="text-center">
              <button
                onClick={() => {
                  setShowCredentialsForm(false);
                  clearErrors();
                  reset();
                }}
                className="text-sm text-main-500 hover:text-main-700 transition-colors"
              >
                กลับไปหน้าเลือกวิธีการเข้าสู่ระบบ
              </button>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-center text-xs text-main-500">
            มีปัญหาในการเข้าสู่ระบบ?{" "}
            <a
              href="/support"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              ติดต่อฝ่ายสนับสนุน
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
