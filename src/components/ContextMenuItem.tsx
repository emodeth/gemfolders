import React, { useState, useRef } from "react";

interface ContextMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  onClickWithRect?: (rect: DOMRect) => void;
  isDanger?: boolean;
}

const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  icon,
  label,
  onClick,
  onClickWithRect,
  isDanger = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (onClickWithRect && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      onClickWithRect(rect);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      ref={itemRef}
      type="button"
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        padding: "10px 16px",
        fontSize: 14,
        fontWeight: 400,
        fontFamily: "inherit",
        lineHeight: "20px",
        color: isHovered && isDanger ? "#fff" : "var(--text-primary)",
        cursor: "pointer",
        borderRadius: 8,
        border: "none",
        transition: "background-color 0.15s ease",
        userSelect: "none",
        backgroundColor: isHovered
          ? isDanger
            ? "#b3261e"
            : "var(--bg-surface-hover)"
          : "transparent",
        textAlign: "left",
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        style={{
          marginRight: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 20,
          height: 20,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span style={{ flex: 1 }}>{label}</span>
    </button>
  );
};

export default ContextMenuItem;
