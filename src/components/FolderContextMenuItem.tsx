import React, { useState, useRef } from "react";

interface FolderContextMenuItemProps {
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
    padding: "8px 12px",
    fontSize: 13,
    color: "#c0c0c0",
    cursor: "pointer",
    borderRadius: 4,
    transition: "all 0.15s ease",
    userSelect: "none" as const,
    backgroundColor: "transparent",
  },
  icon: {
    marginRight: 10,
    opacity: 0.8,
    display: "flex",
    alignItems: "center",
  },
};

const FolderContextMenuItem: React.FC<FolderContextMenuItemProps> = ({
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
    backgroundColor: isHovered ? (isDanger ? "#d32f2f" : "#0078d4") : "transparent",
    color: isHovered ? "#fff" : "#c0c0c0",
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

export default FolderContextMenuItem;

