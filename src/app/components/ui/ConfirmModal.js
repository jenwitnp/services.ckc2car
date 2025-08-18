"use client";

import { Fragment } from "react";
import {
  Dialog,
  DialogTitle,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";

export default function ConfirmModal({
  isOpen,
  data,
  closeModals,
  title,
  description,
  onCancel,
  onConfirm: handleConfirm,
}) {
  function onClose() {
    onCancel?.();
    closeModals?.();
  }

  function onConfirm() {
    handleConfirm?.(data);
    closeModals?.();
  }

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-700 p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle
                as="h3"
                className="text-lg font-medium leading-6 text-main-300"
              >
                {title || "ยืนยันการลบ ?"}
              </DialogTitle>
              <div className="mt-2">
                <p className="text-sm text-main-500">
                  {description || "กรุณากด 'ตกลง' เพื่อยืนยันการทำรายการ"}
                </p>
              </div>

              <div className="mt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  className="hover:bg-gray-700inline-flex justify-center rounded-md border border-main-500 bg-gray-700 px-4 py-2 text-sm font-medium text-main-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-main-500 focus:ring-offset-2"
                  onClick={onClose}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-800 px-4 py-2 text-sm font-medium text-main-300 shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-main-500 focus:ring-offset-2"
                  onClick={onConfirm}
                >
                  ตกลง
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
