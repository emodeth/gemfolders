import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { Bookmark, FolderPlus, Pencil, Trash2 } from "lucide-react";
import ContextMenuItem from "./ContextMenuItem";
import { useChat } from "../context/ChatContext";
import { useBookmark } from "../context/BookmarkContext";
import { useFolder } from "../context/FolderContext";
import { useTierLimits } from "../context/TierLimitsContext";
import { isChatInAnyFolder } from "../lib/storage";

const styles = {
  menu: {
    position: "fixed" as const,
    zIndex: 100000,
    minWidth: 150,
    backgroundColor: "var(--bg-background)",
    border: "1px solid var(--border-default)",
    borderRadius: 6,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
    padding: 4,
    display: "flex",
    flexDirection: "column" as const,
    gap: 1,
    fontFamily: "var(--font-sans)",
  },
  header: {
    padding: "6px 10px",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    marginBottom: 4,
    whiteSpace: "nowrap" as const,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    maxWidth: 140,

  },
};

const ChatContextMenu: React.FC = () => {
  const {
    chatContextMenu,
    closeChatContextMenu,
    handleChatMoveTo,
    handleChatRename,
    handleChatDelete,
  } = useChat();

  const { isBookmarked, toggleBookmark } = useBookmark();
  const { folders } = useFolder();
  const { canBookmark, showPaywall, showSignInPaywall, isLoggedIn } = useTierLimits();

  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isPositioned, setIsPositioned] = useState(false);

  const { x, y, chatName, chatId, chatUrl, originalId } = chatContextMenu;
  const bookmarked = isBookmarked(originalId || chatId);
  const inFolder = isChatInAnyFolder(folders, originalId || chatId);

  const handleBookmarkClick = () => {
    toggleBookmark(
      {
        id: originalId || chatId,
        title: chatName,
        url: chatUrl,
      },
      {
        canAdd: canBookmark,
        onLimitReached: () => {
          if (!isLoggedIn) {
            showSignInPaywall("bookmark limit");
          } else {
            showPaywall("bookmark limit");
          }
        },
      }
    );
    closeChatContextMenu();
  };

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

      let parentTransformX = 0;
      let parentTransformY = 0;
      let el = menuRef.current.parentElement;

      while (el) {
        const style = window.getComputedStyle(el);
        if (style.transform !== "none") {
          const rect = el.getBoundingClientRect();
          parentTransformX = rect.left;
          parentTransformY = rect.top;
          break;
        }
        el = el.parentElement;
      }

      let targetGlobalX = x;
      if (x + menuWidth > window.innerWidth - 10) {
        targetGlobalX = x - menuWidth;
      }

      let targetGlobalY = y;
      if (y + menuHeight > window.innerHeight - 10) {
        targetGlobalY = y - menuHeight;
      }

      targetGlobalY = Math.max(10, targetGlobalY);
      targetGlobalX = Math.max(10, targetGlobalX);

      const finalLeft = targetGlobalX - parentTransformX;
      const finalTop = targetGlobalY - parentTransformY;

      setPosition({ top: finalTop, left: finalLeft });
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
      className={isPositioned ? "modal-animate-fade" : ""}
      onMouseDown={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div style={styles.header}>{chatName}</div>

      <ContextMenuItem
        icon={<Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />}
        label={bookmarked ? "Remove Bookmark" : "Bookmark"}
        onClick={handleBookmarkClick}
      />

      <ContextMenuItem
        icon={<FolderPlus size={16} fill={inFolder ? "currentColor" : "none"} />}
        label="Add to folder"
        onClick={handleChatMoveTo}
      />

      <ContextMenuItem
        icon={<Pencil size={16} />}
        label="Rename"
        onClick={handleChatRename}
      />

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

