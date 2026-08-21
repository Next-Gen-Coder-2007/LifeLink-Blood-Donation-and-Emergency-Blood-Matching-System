import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  className?: string;
  showCloseButton?: boolean;
}

const SIZE_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  size = "md",
  className = "",
  showCloseButton = true,
}: ModalProps) {
  // Lock body scroll while modal is active
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`relative w-full ${SIZE_MAP[size]} rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 my-auto animate-in zoom-in-95 duration-150 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer print:hidden"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Optional Standardized Header */}
        {(title || icon || description) && (
          <div className="flex items-start gap-3.5 border-b border-slate-100 pb-4 mb-4">
            {icon && (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 shadow-2xs">
                {icon}
              </div>
            )}
            <div className="space-y-0.5">
              {title && typeof title === "string" ? (
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
              ) : (
                title
              )}
              {description && (
                <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
              )}
            </div>
          </div>
        )}

        {/* Modal Body Content */}
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
