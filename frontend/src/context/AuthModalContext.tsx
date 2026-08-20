import React, { createContext, useContext, useState, useEffect } from "react";

type AuthModalType = "login" | "register" | null;
type RegisterTab = "donor" | "hospital";

interface AuthModalContextType {
  modalType: AuthModalType;
  registerTab: RegisterTab;
  openLogin: () => void;
  openRegister: (tab?: RegisterTab) => void;
  closeModals: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [modalType, setModalType] = useState<AuthModalType>(null);
  const [registerTab, setRegisterTab] = useState<RegisterTab>("donor");

  useEffect(() => {
    if (modalType) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalType]);

  const openLogin = () => {
    setModalType("login");
  };

  const openRegister = (tab: RegisterTab = "donor") => {
    setRegisterTab(tab);
    setModalType("register");
  };

  const closeModals = () => {
    setModalType(null);
  };

  return (
    <AuthModalContext.Provider
      value={{
        modalType,
        registerTab,
        openLogin,
        openRegister,
        closeModals,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthModalProvider");
  }
  return context;
}
