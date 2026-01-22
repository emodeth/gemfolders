import React from "react";
import { Bookmark, MessageSquareText } from "lucide-react";
import type { BookmarkedChat } from "../lib/storage";
import Tooltip from "./Tooltip";

interface BookmarkItemProps {
  bookmark: BookmarkedChat;
  onRemove: (e: React.MouseEvent, chatId: string) => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, onRemove }) => {
  return (
    <a
      href={bookmark.url}
      className="organizer-flex organizer-items-center organizer-gap-2 organizer-px-2 organizer-py-1 organizer-rounded-lg hover:organizer-bg-bg-surface organizer-bg-bg-surface-hover organizer-transition-all organizer-duration-200 organizer-group"
    >
      <MessageSquareText
        size={16}
        className="organizer-flex-shrink-0 organizer-text-text-primary"
      />
      <span className="organizer-text-text-primary organizer-text-sm organizer-truncate organizer-flex-1 organizer-font-semibold">
        {bookmark.title}
      </span>
      <Tooltip text="Remove bookmark" position="left">
        <button
          onClick={(e) => onRemove(e, bookmark.id)}
          className="organizer-flex-shrink-0 organizer-p-1 organizer-rounded hover:organizer-bg-bg-surface-hover organizer-text-text-primary organizer-transition-colors"
        >
          <Bookmark size={16} fill="currentColor" />
        </button>
      </Tooltip>
    </a>
  );
};

export default BookmarkItem;
