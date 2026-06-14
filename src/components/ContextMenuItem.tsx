import React, { useState, useRef } from "react";

interface ContextMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  onClickWithRect?: (rect: DOMRect) => void;
  isDanger?: boolean;
}

const styles = {
  item: {
    display: "flex",
    alignItems: "center",
    padding: "6px 12px",
    fontSize: 13,
    color: "var(--text-primary)",
    cursor: "pointer",
    borderRadius: 4,
    transition: "all 0.15s ease",
    userSelect: "none" as const,
    backgroundColor: "transparent",
  },
  icon: {
    marginRight: 8,
    opacity: 0.9,
    display: "flex",
    alignItems: "center",
  },
};

const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  icon,
  label,
  onClick,
  onClickWithRect,
  isDanger = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const itemStyle: React.CSSProperties = {
    ...styles.item,
    backgroundColor: isHovered ? (isDanger ? "#d32f2f" : "var(--bg-surface-hover)") : "transparent",
    color: isDanger && isHovered ? "#fff" : "var(--text-primary)",
  };

  const iconStyle: React.CSSProperties = {
    ...styles.icon,
    opacity: isHovered ? 1 : 0.8,
  };

  const handleClick = () => {
    if (onClickWithRect && itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      onClickWithRect(rect);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={itemRef}
      style={itemStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={iconStyle}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
    </div>
  );
};

export default ContextMenuItem;

