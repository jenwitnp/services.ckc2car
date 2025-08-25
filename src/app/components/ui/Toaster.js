"use client";
import React, { useState, useEffect } from "react";
import { Transition } from "@headlessui/react";
import SuccessIcon from "./SuccessIcon";
import { LuX } from "react-icons/lu";
import Spinner from "./Spinner";
import LoadingText from "./LoadingText";

const toastEventManager = {
  listeners: [],
  emit(toast) {
    this.listeners.forEach((listener) => listener(toast));
  },
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  },
};

export const toast = {
  success(message, options = {}) {
    toastEventManager.emit({
      type: "success",
      message,
      icon: options.icon || <SuccessIcon />,
      ...options,
    });
  },
  error(message, options = {}) {
    toastEventManager.emit({
      type: "error",
      message,
      icon: options.icon || (
        <div className="flex size-6 animate-wiggle items-center justify-center rounded-full bg-red-700 text-white">
          <LuX />
        </div>
      ),
      ...options,
    });
  },
  warning(message, options = {}) {
    toastEventManager.emit({
      type: "warning",
      message,
      icon: options.icon || (
        <div className="flex h-6 w-6 animate-bounce items-center justify-center rounded-full bg-yellow-500">
          ⚠️
        </div>
      ),
      ...options,
    });
  },
  info(message, options = {}) {
    toastEventManager.emit({
      type: "info",
      message,
      icon: options.icon || (
        <div className="animate-fade-in-out flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
          ℹ️
        </div>
      ),
      ...options,
    });
  },
  promise(promise, messages, options = {}) {
    const id = Date.now();
    // Emit loading state with default or custom icon
    toastEventManager.emit({
      id,
      type: "loading",
      message: (
        <LoadingText
          isLoading={true}
          loadingText={messages?.loading || "Loading"}
        />
      ),
      icon: options.icons?.loading || <Spinner size="sm" />,
      ...options,
    });

    promise
      .then((result) => {
        // Emit success state with default or custom icon
        toastEventManager.emit({
          id: Date.now(),
          type: "success",
          message: messages?.success || "Successfully",
          icon: options.icons?.success || <SuccessIcon />, // Default success icon
          isVisible: true,
          ...options,
        });
        return result;
      })
      .catch((error) => {
        // Emit error state with default or custom icon
        toastEventManager.emit({
          id: Date.now(),
          type: "error",
          message: messages?.error || "Something is wrong",
          icon: options.icons?.error || "❌", // Default error icon
          isVisible: true,
          ...options,
        });
        throw error;
      });
  },
};

const Toaster = ({ position = "top-center" }) => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastEventManager.subscribe((toast) => {
      const id = Date.now();

      if (toast.type == "success" || toast.type == "error") {
        setToasts((preToasts) => preToasts.filter((i) => i.type !== "loading"));
      }

      setToasts((prevToasts) => [
        ...prevToasts,
        { id, isVisible: true, ...toast },
      ]);

      if (toast.type !== "loading" && !toast.hide) {
        setTimeout(() => removeToast(id), toast.duration || 2000); // Auto-hide after 3 seconds
      }

      if (toast.type == "success" && toast?.replace) {
        setTimeout(() => location.replace(toast.replace), 500);
      }
    });

    return unsubscribe;
  }, []);

  const removeToast = (id) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, isVisible: false } : toast
      )
    );
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 200); // Wait for exit animation
  };

  const typeStyles = {
    success: "bg-main-200",
    error: "bg-red-100",
    warning: "bg-yellow-100",
    info: "bg-blue-100",
    loading: "bg-main-200",
  };

  const positionClasses = {
    "top-right": "top-10 right-5",
    "top-left": "top-10 left-5",
    "bottom-right": "bottom-10 right-5",
    "bottom-left": "bottom-10 left-5",
    "top-center": "top-10 left-1/2 transform -translate-x-1/2",
    "bottom-center": "bottom-10 left-1/2 transform -translate-x-1/2",
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50 min-w-60 space-y-4`}
    >
      {toasts.map((toast) => (
        <Transition
          key={toast.id}
          show={toast.isVisible}
          appear={true}
          enter="transition ease-out duration-300"
          enterFrom="opacity-0 -translate-y-2"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-2"
        >
          <div
            className={`mx-auto w-full max-w-sm ${
              typeStyles[toast.type] || "bg-main-200"
            } } rounded-lg px-4 py-3 text-main-700 shadow-lg`}
          >
            <div className="flex items-center justify-center gap-4">
              <div>{toast.icon}</div>
              <div className="text-center">{toast.message}</div>

              {toast?.isClose && (
                <button
                  onClick={() => removeToast(toast.id)}
                  className="ml-4 text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </Transition>
      ))}
    </div>
  );
};

export default Toaster;
