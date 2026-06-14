import React from "react";
import { Toaster, ToastBar } from "react-hot-toast";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { useTheme } from "~context/ThemeContext";

const ToastProvider: React.FC = () => {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

  return (
    <Toaster
      position="top-center"
      containerStyle={{
        top: 20,
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--bg-surface)",
          color: "var(--text-primary)",
          borderRadius: "8px",
          padding: "12px 16px",
          fontSize: "13px",
          fontFamily: "var(--font-sans)",
          boxShadow: isDark
            ? "0 4px 12px rgba(0, 0, 0, 0.4)"
            : "0 4px 12px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      {(t) => (
        <ToastBar
          toast={t}
          style={{
            ...t.style,
            animation: t.visible
              ? "toast-enter 0.3s ease-out"
              : "toast-exit 0.3s ease-in forwards",
          }}
        >
          {({ message }) => (
            <div className="organizer-flex organizer-items-center organizer-gap-3">
              {t.type === "success" && (
                <CheckCircle2
                  size={20}
                  style={{ color: "var(--color-primary)" }}
                  className="organizer-flex-shrink-0"
                />
              )}
              {t.type === "error" && (
                <XCircle
                  size={20}
                  style={{ color: "#b3261e" }}
                  className="organizer-flex-shrink-0"
                />
              )}
              {t.type !== "success" && t.type !== "error" && (
                <Info
                  size={20}
                  style={{ color: "var(--color-primary)" }}
                  className="organizer-flex-shrink-0"
                />
              )}
              <span>{message}</span>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default ToastProvider;
