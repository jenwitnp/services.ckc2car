"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { getSession, signIn } from "next-auth/react";
import Button from "./ui/Button";
import Input from "./ui/Input";
import InputRow from "./ui/InputRow";
import { useUserSession } from "../contexts/UserSessionProvider";
import { toast } from "react-hot-toast"; // If you have a toast library, otherwise use alert

const LoginForm = ({ lineUserIdToLink }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { setUser } = useUserSession();

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const onSubmit = async (data) => {
    setFormError("");
    setLoading(true);

    try {
      // Sign in with credentials, passing lineUserIdToLink to the NextAuth callback
      const res = await signIn("credentials", {
        username: data.username,
        password: data.password,
        lineUserIdToLink: lineUserIdToLink,
        redirect: false,
      });

      console.log("sign in result:", res);

      // IMPORTANT FIX: Only treat it as an error if ok is false
      if (res?.error && !res.ok) {
        setFormError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
        return;
      }

      // If we reach here, consider the login successful
      if (res?.ok) {
        // Wait a moment to ensure the session is updated with the linked account
        setTimeout(async () => {
          const session = await getSession();

          if (session?.user) {
            setUser({
              id: session.user.id,
              name: session.user.name,
              position: session.user.position,
              image: session.user.image,
            });

            // Check if LINE account was linked (from the session or URL parameter)
            if (session.linkedLineAccount || lineUserIdToLink) {
              toast.success(
                "บัญชี LINE ของคุณได้เชื่อมต่อกับระบบเรียบร้อยแล้ว"
              );
            }

            if (data.remember) {
              localStorage.setItem("rememberedUsername", data.username);
            } else {
              localStorage.removeItem("rememberedUsername");
            }

            // Redirect after everything is complete
            window.location.href = "/";
          }
        }, 800); // Delay to ensure session is updated
      }
    } catch (error) {
      console.error("Login error:", error);
      setFormError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้ง");
      setLoading(false);
    }
  };

  // Prefill username if remembered (existing code)
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedUsername");
    if (remembered) {
      const input = document.querySelector('input[name="username"]');
      if (input) {
        input.value = remembered;
      }
    }
  }, []);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full bg-main-800 rounded-xl shadow-lg p-5 sm:p-6 md:p-8"
    >
      {lineUserIdToLink && (
        <div className="mb-4 p-3 bg-info-500/10 border border-info-500/20 rounded text-info-400 text-sm">
          เข้าสู่ระบบเพื่อเชื่อมต่อบัญชี LINE
          ของคุณสำหรับการเข้าสู่ระบบครั้งต่อไป
        </div>
      )}

      {formError && (
        <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/20 rounded text-danger-500 text-center text-sm">
          {formError}
        </div>
      )}

      {/* Rest of your form remains unchanged */}
      <InputRow label="ชื่อผู้ใช้ :" id="username" isError={errors}>
        <Input
          {...register("username", {
            required: "กรุณากรอกชื่อผู้ใช้",
            minLength: {
              value: 3,
              message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร",
            },
          })}
          id="username"
          name="username"
          type="text"
          placeholder="ระยุชื่อผู้ใช้"
          autoComplete="username"
          size="md"
          fit
        />
      </InputRow>

      <InputRow label="รหัสผ่าน :" id="password" isError={errors}>
        <Input
          {...register("password", {
            required: "กรุณากรอกรหัสผ่าน",
            minLength: {
              value: 3,
              message: "รหัสผ่านต้องมีอย่างน้อย 3 ตัวอักษร",
            },
          })}
          id="password"
          name="password"
          type="password"
          placeholder="ระบุรหัสผ่าน"
          autoComplete="password"
          size="md"
          fit
        />
      </InputRow>

      {/* Other form fields... */}

      <div className="flex">
        <Button type="submit" variant="save" size="md" disabled={loading} fit>
          {loading
            ? "กำลังเข้าสู่ระบบ..."
            : lineUserIdToLink
            ? "เข้าสู่ระบบและเชื่อมต่อ LINE"
            : "เข้าสู่ระบบ"}
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
