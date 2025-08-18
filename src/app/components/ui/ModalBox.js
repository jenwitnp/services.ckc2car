"use client";

import { Fragment } from "react";
import {
  Dialog,
  DialogTitle,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";

const sizeClassMap = {
  s: "max-w-xs",
  m: "max-w-md",
  l: "max-w-2xl",
};

export default function ModalBox({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "m",
  showFooter = true,
  confirmText = "ตกลง",
  cancelText = "ยกเลิก",
  onConfirm,
  onCancel,
}) {
  function handleCancel() {
    onCancel && onCancel();
    onClose();
  }

  function handleConfirm() {
    onConfirm && onConfirm();
    onClose();
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCancel}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel
              className={`w-full ${sizeClassMap[size]} transform overflow-y-visible rounded-2xl bg-main-900 p-6 text-left align-middle shadow-xl transition-all`}
            >
              {title && (
                <DialogTitle
                  as="h3"
                  className="text-lg font-medium leading-6 text-main-300"
                >
                  {title}
                </DialogTitle>
              )}
              {description && (
                <div className="mt-2">
                  <p className="text-sm text-main-500">{description}</p>
                </div>
              )}
              {children && <div className="mt-4">{children}</div>}

              {showFooter && (
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-main-500 bg-main-900 px-4 py-2 text-sm font-medium text-main-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-main-500 focus:ring-offset-2"
                    onClick={handleCancel}
                  >
                    {cancelText}
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-main-700 px-4 py-2 text-sm font-medium text-main-300 shadow-sm hover:bg-main-800 focus:outline-none focus:ring-2 focus:ring-main-500 focus:ring-offset-2"
                    onClick={handleConfirm}
                  >
                    {confirmText}
                  </button>
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
