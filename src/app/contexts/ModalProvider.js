"use client";

import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import ConfirmModal from "../components/ui/ConfirmModal";

const defaultComponent = <ConfirmModal />;
const ConfirmModalContext = createContext(undefined);

export function ModalProvider({ children }) {
  const [modalsOptions, setModalsOptions] = useState([]);
  const [modalIds, setModalIds] = useState([]);
  const [modalsComponents, setModalsComponents] = useState([]);

  // Open a new modal
  const openModals = ({
    activeId,
    title,
    description,
    onConfirm,
    onCancel,
    data,
    component = false,
  }) => {
    setModalsOptions((prev) => [
      ...prev,
      {
        activeId,
        isOpen: true,
        title,
        description,
        onConfirm,
        onCancel,
        data,
      },
    ]);
    setModalIds((prev) => [...prev, activeId]);
    setModalsComponents((prev) => [
      ...prev,
      component ? component : defaultComponent,
    ]);
  };

  // Close the topmost modal
  const closeModals = () => {
    setModalsOptions((prev) => prev.slice(0, -1));
    setModalsComponents((prev) => prev.slice(0, -1));
    setModalIds((prev) => prev.slice(0, -1));
  };

  // Update modal data by activeId
  const updateModalsData = useCallback((dataArr) => {
    if (!dataArr) return;
    setModalsOptions((prev) =>
      prev.map((modalOpt) => {
        const found = dataArr.find((i) => i.id === modalOpt.activeId);
        return found ? { ...modalOpt, data: found } : modalOpt;
      })
    );
  }, []);

  return (
    <ConfirmModalContext.Provider
      value={{
        openModals,
        closeModals,
        updateModalsData,
        modalsOptions,
        isModalsOpen: modalsOptions.some((i) => i.isOpen),
        modalIds,
      }}
    >
      {children}

      {modalsComponents.map((component, index) => {
        const modalProps = {
          ...modalsOptions[index],
          closeModals,
          key: index,
        };
        return cloneElement(component, modalProps);
      })}
    </ConfirmModalContext.Provider>
  );
}

export function useModals() {
  const ctx = useContext(ConfirmModalContext);
  if (!ctx) throw new Error("useModals must be used within ModalProvider");
  return ctx;
}
