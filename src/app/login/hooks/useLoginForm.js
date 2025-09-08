"use client";

import { useForm } from "react-hook-form";

export function useLoginForm() {
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

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    reset,
    setFormError,
    clearErrors,
  };
}
