import clsx from "clsx";
import React from "react";

const buttonColors = {
  save: {
    bg: "bg-main-600",
    hover: "hover:bg-main-600",
    disabled: "disabled:bg-main-600",
    text: "text-white",
    textDisabled: "disabled:text-main-700",
    border: "border-main-600",
  },
  delete: {
    bg: "bg-main-800",
    hover: "hover:bg-main-900",
    disabled: "disabled:bg-main-600",
    text: "text-white",
    textDisabled: "disabled:text-main-700",
    border: "border-main-800",
  },
  edit: {
    bg: "bg-main-400",
    hover: "hover:bg-main-500",
    disabled: "disabled:bg-main-600",
    text: "text-white",
    textDisabled: "disabled:text-main-700",
    border: "border-main-400",
  },
  pending: {
    bg: "bg-main-300",
    hover: "hover:bg-main-400",
    disabled: "disabled:bg-main-600",
    text: "text-black",
    textDisabled: "disabled:text-main-700",
    border: "border-main-300",
  },
  warning: {
    bg: "bg-main-700",
    hover: "hover:bg-main-800",
    disabled: "disabled:bg-main-600",
    text: "text-white",
    textDisabled: "disabled:text-main-700",
    border: "border-main-700",
  },
  alert: {
    bg: "bg-main-900",
    hover: "hover:bg-main-800",
    disabled: "disabled:bg-main-600",
    text: "text-white",
    textDisabled: "disabled:text-main-700",
    border: "border-main-900",
  },
  attention: {
    bg: "bg-main-600",
    hover: "hover:bg-main-700",
    disabled: "disabled:bg-main-600",
    text: "text-white",
    textDisabled: "disabled:text-main-700",
    border: "border-main-600",
  },
  submit: {
    bg: "bg-main-600",
    hover: "hover:bg-main-700",
    disabled: "disabled:bg-main-700",
    text: "text-main-300",
    textDisabled: "disabled:text-main-800",
    border: "border-transparent",
  },
  cancel: {
    bg: "bg-main-800 shadow-sm",
    hover: "hover:bg-main-100",
    disabled: "disabled:bg-main-600",
    text: "text-main-500",
    textDisabled: "disabled:text-main-700",
    border: "border-main-500 ",
  },
  primary: {
    bg: "bg-primary-600",
    hover: "hover:bg-primary-700",
    disabled: "disabled:bg-primary-400",
    text: "text-white",
    textDisabled: "disabled:text-primary-100",
    border: "border-primary-600",
  },
};

const sizeStyles = {
  sm: "text-sm px-3 py-2",
  md: "text-md px-4 py-3",
  lg: "text-lg px-6 py-3",
  xl: "text-xl px-8 py-4",
};

const Button = ({
  variant = "primary",
  size = "md",
  fit = false,
  disabled = false,
  textAlign = "center",
  children,
  ...props
}) => {
  const colors = buttonColors[variant] || buttonColors.save;

  return (
    <button
      className={clsx(
        "flex items-center justify-center gap-2 rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-main-500 focus:ring-offset-1 font-medium",
        sizeStyles[size] || sizeStyles.md,
        fit && "flex-1 w-full",
        textAlign && `justify-${textAlign}`,
        disabled && "cursor-not-allowed bg-blue-400 text-blue-100",
        colors.bg,
        colors.hover,
        colors.text,
        colors.disabled,
        colors.textDisabled,
        colors.border && `border ${colors.border}`
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
