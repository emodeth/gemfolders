import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { FolderInput, Pencil, Trash2 } from "lucide-react";
import ContextMenuItem from "./ContextMenuItem";
import { useFolder } from "../context/FolderContext";

const styles = {
  menu: {
    position: "absolute" as const,
    zIndex: 100000,
    minWidth: 200,
    backgroundColor: "#1e1e1e",
    border: "1px solid #333",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
    padding: 6,
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
  },
  header: {
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 600,
    color: "#e0e0e0",
    borderBottom: "1px solid #333",
    marginBottom: 4,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    maxWidth: 200,
  },
};

const ChatContextMenu: React.FC = () => {
  const {
    chatContextMenu,
    closeChatContextMenu,
    handleChatMoveTo,
    handleChatRename,
    handleChatDelete,
  } = useFolder();

  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  const { x, y, chatName } = chatContextMenu;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (menuRef.current?.contains(target)) {
        return;
      }

      closeChatContextMenu();
    };

    const handleScroll = () => {
      closeChatContextMenu();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeChatContextMenu();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("scroll", handleScroll, true);
      document.addEventListener("keydown", handleKeyDown);
    }, 10);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeChatContextMenu]);

  useLayoutEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const menuWidth = menuRect.width || 200;
      const menuHeight = menuRect.height || 200;

      const sidebar = menuRef.current.closest('[class*="organizer-fixed"]');
      let offsetX = 0;
      let offsetY = 0;

      if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        offsetX = sidebarRect.left;
        offsetY = sidebarRect.top;
      }

      let newLeft = x - offsetX;
      let newTop = y - offsetY;

      if (x + menuWidth > window.innerWidth - 10) {
        newLeft = x - offsetX - menuWidth;
      }

      if (y + menuHeight > window.innerHeight - 10) {
        newTop = y - offsetY - menuHeight;
      }

      newTop = Math.max(10 - offsetY, newTop);
      newLeft = Math.max(10 - offsetX, newLeft);

      setPosition({ top: newTop, left: newLeft });
      setIsPositioned(true);
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      style={{
        ...styles.menu,
        top: position.top,
        left: position.left,
        visibility: isPositioned ? "visible" : "hidden",
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Chat name header */}
      <div style={styles.header}>{chatName}</div>

      {/* Move to... */}
      <ContextMenuItem
        icon={<FolderInput size={16} />}
        label="Move to..."
        onClick={handleChatMoveTo}
      />

      {/* Rename */}
      <ContextMenuItem
        icon={<Pencil size={16} />}
        label="Rename"
        onClick={handleChatRename}
      />

      {/* Delete */}
      <ContextMenuItem
        icon={<Trash2 size={16} />}
        label="Delete"
        isDanger
        onClick={handleChatDelete}
      />
    </div>
  );
};

export default ChatContextMenu;
