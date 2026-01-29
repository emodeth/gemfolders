import { useEffect } from "react";
import { ChevronDown, ChevronRight, Folder, GripVertical, MessageSquareText } from "lucide-react";
import { isLightColor } from "../constants/colors";
import { useFolder } from "../context/FolderContext";
import { useChat } from "../context/ChatContext";

const Node = ({ node, style, dragHandle, dragWidth = 260 }: any) => {
  const { openContextMenu } = useFolder();
  const { openChatContextMenu } = useChat();

  useEffect(() => {
    if (node.willReceiveDrop && !node.isOpen && node.data.type !== 'chat') {
      const timer = setTimeout(() => {
        node.toggle();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [node.willReceiveDrop, node.isOpen, node.data.type, node]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (node.data.type === 'chat') {
      openChatContextMenu(e, {
        id: node.data.id,
        name: node.data.name,
        url: node.data.chatUrl,
        folderId: node.parent?.id,
        originalId: node.data.originalId
      });
      return;
    }

    openContextMenu(e, {
      id: node.data.id,
      name: node.data.name,
      color: node.data.color,
      childrenCount: node.data.children?.length || 0,
    });
  };

  function renderFolder() {
    const bgColor = node.data.color || "#60a5fa";
    const textColor = isLightColor(bgColor) ? "#1f2937" : "#fff";
    const hasChildren = node.data.children?.length > 0;

    const renderIcon = () => {
      if (!hasChildren) {
        return <Folder className="organizer-mr-2" size={16} style={{ color: bgColor }} fill={bgColor} />;
      }
      return node.isOpen
        ? <ChevronDown className="organizer-mr-2" size={16} />
        : <ChevronRight className="organizer-mr-2" size={16} />;
    };

    return (
      <>
        {renderIcon()}
        <div
          className="organizer-flex-1 organizer-flex organizer-items-center organizer-justify-between organizer-h-full organizer-px-2 organizer-py-1 organizer-rounded-md organizer-overflow-hidden"
          style={{ backgroundColor: bgColor, color: textColor }}
        >
          <span className="organizer-truncate organizer-min-w-0">{node.data.name}</span>
          {hasChildren ? (
            <span className="organizer-text-xs organizer-shrink-0 organizer-ml-2">{node.data.children.length} {node.data.children.length === 1 ? "item" : "items"}</span>
          ) : null}
        </div>
      </>
    )
  }

  function renderChat() {
    return (
      <>
        <MessageSquareText className="organizer-ml-1 organizer-shrink-0" size={16} />
        <div className="organizer-flex-1 organizer-flex organizer-items-center organizer-px-2 organizer-py-1 organizer-h-full organizer-overflow-hidden">
          <span className="organizer-truncate">{node.data.name}</span>
        </div>
      </>
    )
  }

  return (
    <div
      onClick={(e) => {
        if (node.data.type === "chat" && node.data.chatUrl) {
          globalThis.location.href = node.data.chatUrl;
        } else if (node.isInternal) {
          node.toggle();
        }
      }}
      onContextMenu={handleContextMenu}
      style={{
        ...style,
        ...(node.isDragging && {
          width: `${dragWidth}px`,
          maxWidth: `${dragWidth}px`,
          background: "var(--bg-background)",
          borderRadius: "6px",
          opacity: 0.5
        })
      }}
      className="organizer-text-sm organizer-font-semibold organizer-flex organizer-items-center organizer-h-8 organizer-mb-1 organizer-text-text-primary organizer-cursor-pointer hover:organizer-brightness-110 dark:hover:organizer-brightness-[85%]"
      ref={dragHandle}
    >
      <GripVertical className="organizer-mr-1 organizer-text-text-muted" size={14} />
      {node.data.type === 'chat' ? renderChat() : renderFolder()}
    </div>
  );
}

export default Node