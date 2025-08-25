"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useLiffGuest } from "@/app/contexts/LiffGuestProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/Card";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import InputRow from "@/app/components/ui/InputRow";
import Alert from "@/app/components/ui/Alert";
import { Icons } from "@/app/components/ui/Icons";
import LineConnectButton from "@/components/line/LineConnectButton";

import {
  User,
  Lock,
  AlertCircle,
  XCircle,
  Loader2,
  Facebook,
  Apple,
} from "lucide-react";

// ✅ Login Provider Configuration - Updated with main color tone
const LOGIN_PROVIDERS = {
  credentials: {
    id: "credentials",
    name: "ชื่อผู้ใช้/รหัสผ่าน",
    description: "เข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน",
    icon: User,
    color: "bg-primary-500 hover:bg-primary-600",
    textColor: "text-primary-600",
    bgColor: "bg-primary-50",
    borderColor: "border-primary-200",
    primary: true,
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

// ✅ Separate component that uses useSearchParams
function LoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [showCredentialsForm, setShowCredentialsForm] = useState(true);
  const { isInLineApp, getLineUserId } = useLiffGuest();

  // ✅ React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError: setFormError,
    clearErrors,
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onBlur",
  });

  // Check for LINE account not linked error
  const authError = searchParams.get("error");
  const lineUserId = searchParams.get("lineUserId");
  const redirectUrl = searchParams.get("redirect");

  useEffect(() => {
    if (authError === "LineAccountNotLinked" && lineUserId) {
      setError(
        "บัญชี LINE ของคุณยังไม่ได้เชื่อมต่อกับระบบ กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านเพื่อเชื่อมต่อบัญชี LINE"
      );
      setShowCredentialsForm(true);
    }
  }, [authError, lineUserId]);

  // ✅ Auto-show LINE login for LINE app users
  useEffect(() => {
    if (isInLineApp() && !authError) {
      setShowCredentialsForm(false);
    }
  }, [isInLineApp, authError]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && !lineUserId) {
      router.push(redirectUrl || "/dashboard");
    }
  }, [status, router, redirectUrl, lineUserId]);

  // ✅ Generic provider login handler
  const handleProviderLogin = async (providerId) => {
    setLoadingProvider(providerId);
    setError("");
    clearErrors();

    try {
      const result = await signIn(providerId, {
        redirect: false,
        callbackUrl: redirectUrl || "/dashboard",
      });

      if (result?.error) {
        setError(
          `เกิดข้อผิดพลาดในการเข้าสู่ระบบ ${LOGIN_PROVIDERS[providerId]?.name} กรุณาลองใหม่อีกครั้ง`
        );
      }
    } catch (error) {
      console.error(`${providerId} login error:`, error);
      setError(
        `เกิดข้อผิดพลาดในการเข้าสู่ระบบ ${LOGIN_PROVIDERS[providerId]?.name} กรุณาลองใหม่อีกครั้ง`
      );
    } finally {
      setLoadingProvider(null);
    }
  };

  // ✅ Form submission handler with React Hook Form
  const onSubmit = async (data) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        lineUserIdToLink: lineUserId,
        redirect: false,
      });

      console.log("[login page] result : ", result);

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setFormError("username", {
            type: "manual",
            message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
          });
          setFormError("password", {
            type: "manual",
            message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
          });
        } else {
          setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
        }
      } else if (result?.ok) {
        reset();
        setTimeout(() => {
          router.push(redirectUrl || "/dashboard");
        }, 500);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Get available providers
  const getAvailableProviders = () => {
    return Object.values(LOGIN_PROVIDERS).filter((provider) => {
      return ["credentials", "line"].includes(provider.id);
    });
  };

  // ✅ Get alternative providers
  const getAlternativeProviders = () => {
    const availableProviders = getAvailableProviders();

    if (showCredentialsForm) {
      return availableProviders.filter((p) => p.id !== "credentials");
    } else {
      return availableProviders.filter((p) => p.id === "credentials");
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-main-100 via-main-50 to-main-200 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
              <span className="ml-3 text-main-600">
                กำลังตรวจสอบสถานะการเข้าสู่ระบบ...
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is already logged in but needs to connect LINE
  if (session && lineUserId) {
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
            <LineConnectButton
              onConnected={(lineId) => {
                router.push("/dashboard");
              }}
              fullWidth
            />

            <Button
              variant="outline"
              fullWidth
              onClick={() => router.push("/dashboard")}
            >
              ข้ามไปก่อน
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-4">
          {/* Logo/Brand */}
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
          </div>

          <CardTitle className="text-2xl text-main-900">เข้าสู่ระบบ</CardTitle>
          <CardDescription className="text-main-600">
            CKC Car Services - ระบบจัดการรถยนต์
          </CardDescription>
        </CardHeader>

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

          {/* ✅ Credentials Form with React Hook Form (primary view) */}
          {showCredentialsForm && (
            <div className="space-y-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* ✅ Username Field with Validation */}
                <InputRow label="ชื่อผู้ใช้" id="username" isError={errors}>
                  <Input
                    type="text"
                    icon={User}
                    placeholder="กรุณากรอกชื่อผู้ใช้"
                    disabled={isLoading}
                    {...register("username", {
                      required: "กรุณากรอกชื่อผู้ใช้",
                      minLength: {
                        value: 3,
                        message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร",
                      },
                      pattern: {
                        value: /^[a-zA-Z0-9_.-]+$/,
                        message:
                          "ชื่อผู้ใช้ใช้ได้เฉพาะตัวอักษร ตัวเลข และเครื่องหมาย _ . -",
                      },
                    })}
                  />
                </InputRow>

                {/* ✅ Password Field with Validation */}
                <InputRow label="รหัสผ่าน" id="password" isError={errors}>
                  <Input
                    type="password"
                    icon={Lock}
                    placeholder="กรุณากรอกรหัสผ่าน"
                    showPasswordToggle
                    disabled={isLoading}
                    {...register("password", {
                      required: "กรุณากรอกรหัสผ่าน",
                      minLength: {
                        value: 6,
                        message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
                      },
                    })}
                  />
                </InputRow>

                <Button
                  type="submit"
                  fullWidth
                  loading={isLoading}
                  disabled={isSubmitting}
                  className="mt-6"
                >
                  {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>
              </form>

              {/* ✅ Alternative Login Methods */}
              {getAlternativeProviders().length > 0 && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-main-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-white text-main-500">หรือ</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {getAlternativeProviders().map((provider) => {
                      const isLoadingProvider = loadingProvider === provider.id;
                      const Icon = provider.icon;

                      return (
                        <Button
                          key={provider.id}
                          onClick={() => handleProviderLogin(provider.id)}
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
                  </div>

                  {/* Special note for LINE in browser */}
                  {!isInLineApp() &&
                    getAlternativeProviders().some((p) => p.id === "line") && (
                      <div className="mt-3 p-3 bg-social-line-50 border border-social-line-200 rounded-lg">
                        <p className="text-xs text-social-line-700 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                          การใช้ LINE Login
                          จากเบราว์เซอร์อาจต้องเปิดหน้าต่างใหม่เพื่อยืนยันตัวตน
                        </p>
                      </div>
                    )}
                </>
              )}
            </div>
          )}

          {/* ✅ Provider Selection (for LINE app users) */}
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

              {/* ✅ LINE Login (prioritized for LINE app) */}
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

          {/* ✅ Quick switch option */}
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

// ✅ Loading Fallback Component
function LoginPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-main-100 via-main-50 to-main-200 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
            <span className="ml-3 text-main-600">
              กำลังโหลดหน้าเข้าสู่ระบบ...
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ✅ Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageLoading />}>
      <LoginPageContent />
    </Suspense>
  );
}
