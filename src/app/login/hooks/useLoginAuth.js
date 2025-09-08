"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiffGuest } from "@/app/contexts/LiffGuestProvider";

export function useLoginAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isInLineApp, lineUser, setLineUser } = useLiffGuest();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [userLoginData, setUserLoginData] = useState(false);

  // Get URL parameters
  const authError = searchParams.get("error");
  const lineUserIdParam = searchParams.get("lineUserId");
  const redirectUrl = searchParams.get("redirect");

  // Handle LINE account not linked error
  useEffect(() => {
    if (authError === "LineAccountNotLinked" && lineUserIdParam) {
      setError(
        "บัญชี LINE ของคุณยังไม่ได้เชื่อมต่อกับระบบ กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านเพื่อเชื่อมต่อบัญชี LINE"
      );
      setLineUser(lineUserIdParam);

      // Clean URL
      const params = new URLSearchParams(window.location.search);
      params.delete("error");
      params.delete("lineUserId");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    }
  }, [authError, lineUserIdParam, setLineUser]);

  // Handle user login data updates
  useEffect(() => {
    if (userLoginData && userLoginData.user?.id) {
      console.log("userLoginData updated:", userLoginData);
      console.log(
        "isLineConnected from state:",
        userLoginData.user?.isLineConnected
      );

      if (!userLoginData.user?.isLineConnected) {
        console.log("Setting notLineConnected to true");
      } else {
        console.log("LINE is connected or no LINE user, redirecting...");
      }
    }
  }, [userLoginData, lineUser, router, redirectUrl]);

  // Provider login handler
  const handleProviderLogin = async (providerId) => {
    setLoadingProvider(providerId);
    setError("");

    try {
      const result = await signIn(providerId, {
        redirect: false,
        callbackUrl: redirectUrl || "/dashboard",
        userId: userLoginData?.user?.id,
      });

      if (result?.error) {
        setError(`เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง`);
      }
    } catch (error) {
      console.error(`${providerId} login error:`, error);
      setError(`เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง`);
    } finally {
      setLoadingProvider(null);
    }
  };

  // Credentials login handler
  const handleCredentialsLogin = async (data, setFormError) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username: data.username,
        password: data.password,
        lineUserIdToLink: lineUser,
        redirect: false,
      });

      let freshSession = null;
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
        try {
          // Force session refresh with retry logic
          await update();
          freshSession = await getSession();
          let attempts = 0;
          const maxAttempts = 15;

          // Wait for session to be properly updated
          while (
            (!freshSession || !freshSession.user?.id) &&
            attempts < maxAttempts
          ) {
            console.log(
              `[Login] Waiting for session... attempt ${attempts + 1}`
            );
            await new Promise((resolve) => setTimeout(resolve, 300));
            freshSession = await getSession();
            attempts++;
          }

          if (freshSession && freshSession.user?.id) {
            console.log(
              "✅ Session refreshed successfully:",
              freshSession.user
            );

            setUserLoginData(freshSession);
            document.cookie = `linkUserId=${freshSession.user.id}; path=/; max-age=600`;
          } else {
            console.error("❌ Failed to refresh session after login");
            setError("เกิดข้อผิดพลาดในการรีเฟรชเซสชัน กรุณาโหลดหน้าใหม่");
          }
        } catch (sessionError) {
          console.error("❌ Session refresh error:", sessionError);
          setError("เกิดข้อผิดพลาดในการรีเฟรชเซสชัน กรุณาโหลดหน้าใหม่");
        }

        if (!freshSession?.user?.isLineConnected && !lineUser) {
          return {
            suceess: false,
            errorType: "LINE_NOT_CONNECT",
            message: "Line not connect yet",
          };
        }

        return {
          suceess: true,
          message: "credential and line has been connected",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}
