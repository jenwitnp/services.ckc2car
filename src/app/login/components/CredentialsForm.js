"use client";

import { Lock, User } from "lucide-react";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";

export function CredentialsForm({
  onSubmit,
  register,
  errors,
  isLoading,
  isSubmitting,
}) {
  console.log("CredentialsForm errors:", errors); // ✅ Debug log

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Username Field */}
      <Input
        {...register("username", {
          required: "กรุณากรอกชื่อผู้ใช้",
          minLength: {
            value: 3,
            message: "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร",
          },
        })}
        type="text"
        placeholder="ชื่อผู้ใช้"
        icon={User}
        disabled={isLoading || isSubmitting}
        autoComplete="username"
        error={errors.username?.message} // ✅ Pass error to Input component
      />

      {/* Password Field */}
      <Input
        {...register("password", {
          required: "กรุณากรอกรหัสผ่าน",
          minLength: {
            value: 6,
            message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
          },
        })}
        type="password"
        placeholder="รหัสผ่าน"
        icon={Lock}
        disabled={isLoading || isSubmitting}
        autoComplete="current-password"
        showPasswordToggle={true} // ✅ Enable password visibility toggle
        error={errors.password?.message} // ✅ Pass error to Input component
      />

      {/* Submit Button */}
      <Button
        type="submit"
        fullWidth
        loading={isLoading || isSubmitting}
        disabled={isLoading || isSubmitting}
        className="bg-primary-600 hover:bg-primary-700 text-white"
      >
        {isLoading || isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </Button>
    </form>
  );
}
