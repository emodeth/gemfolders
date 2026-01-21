import React from "react";
import { Bookmark, MessageSquareText } from "lucide-react";
import type { BookmarkedChat } from "../lib/storage";

interface BookmarkItemProps {
  bookmark: BookmarkedChat;
  onRemove: (e: React.MouseEvent, chatId: string) => void;
}

const BookmarkItem: React.FC<BookmarkItemProps> = ({ bookmark, onRemove }) => {
  return (
    <a
      href={bookmark.url}
      className="organizer-flex organizer-items-center organizer-gap-3 organizer-px-3 organizer-py-2 organizer-rounded-lg organizer-bg-bg-surface hover:organizer-bg-bg-surface-hover organizer-transition-all organizer-duration-200 organizer-group"
    >
      <MessageSquareText
        size={18}
        className="organizer-text-text-muted organizer-flex-shrink-0"
      />
      <span className="organizer-text-text-primary organizer-text-sm organizer-truncate organizer-flex-1">
        {bookmark.title}
      </span>
      <button
        onClick={(e) => onRemove(e, bookmark.id)}
        className="organizer-flex-shrink-0 organizer-p-1 organizer-rounded hover:organizer-bg-bg-surface-hover organizer-text-text-muted hover:organizer-text-blue-500 organizer-transition-colors"
        title="Remove bookmark"
      >
        <Bookmark size={16} fill="currentColor" />
      </button>
    </a>
  );
};

export default BookmarkItem;
