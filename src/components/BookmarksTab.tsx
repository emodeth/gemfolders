import React, { useState } from "react";
import { Bookmark, Search, Sparkles } from "lucide-react";
import { Input } from "./ui/Input";
import { useBookmark } from "../context/BookmarkContext";
import BookmarkItem from "./BookmarkItem";

const BookmarksTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { bookmarks, isLoading, removeBookmark } = useBookmark();

  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasBookmarks = bookmarks.length > 0;
  const hasSearchResults = filteredBookmarks.length > 0;

  const handleRemoveBookmark = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    await removeBookmark(chatId);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="organizer-flex organizer-items-center organizer-justify-center organizer-flex-1">
          <div className="organizer-animate-spin organizer-w-6 organizer-h-6 organizer-border-2 organizer-border-blue-500 organizer-border-t-transparent organizer-rounded-full" />
        </div>
      );
    }

    return hasSearchResults ? (
      <div className="organizer-flex organizer-flex-col organizer-gap-2 organizer-overflow-y-auto organizer-flex-1">
        {filteredBookmarks.map((bookmark) => (
          <BookmarkItem
            key={bookmark.id}
            bookmark={bookmark}
            onRemove={handleRemoveBookmark}
          />
        ))}
      </div>
    ) : (
      <div className="organizer-flex organizer-flex-col organizer-items-center organizer-justify-center organizer-flex-1 organizer-text-center organizer-px-6">
        <div className="organizer-w-14 organizer-h-14 organizer-rounded-full organizer-bg-bg-surface organizer-flex organizer-items-center organizer-justify-center organizer-mb-4">
          <Search size={24} className="organizer-text-text-muted" />
        </div>
        <p className="organizer-text-text-primary organizer-font-medium organizer-mb-1">
          No results found
        </p>
        <p className="organizer-text-text-muted organizer-text-sm">
          Try a different search term
        </p>
      </div>
    )

  }

  const renderEmptyState = () => {
    return (<div className="organizer-flex organizer-flex-col organizer-items-center organizer-justify-center organizer-flex-1 organizer-text-center organizer-px-6">
      <div className="organizer-relative organizer-mb-6">
        <div className="organizer-w-20 organizer-h-20 organizer-rounded-2xl organizer-bg-blue-500/20 organizer-flex organizer-items-center organizer-justify-center organizer-shadow-lg organizer-backdrop-blur-sm">
          <Bookmark
            size={36}
            className="organizer-text-blue-500"
            strokeWidth={1.5}
          />
        </div>
        <div className="organizer-absolute organizer--top-1 organizer--right-1 organizer-animate-pulse">
          <Sparkles size={16} className="organizer-text-blue-400" />
        </div>
      </div>

      <h3 className="organizer-text-text-primary organizer-font-semibold organizer-text-lg organizer-mb-2">
        No bookmarks yet
      </h3>
      <p className="organizer-text-text-muted organizer-text-sm organizer-leading-relaxed organizer-max-w-[220px]">
        Bookmark your favorite chats for quick access. They'll appear here for easy reference.
      </p>

      <div className="organizer-mt-6 organizer-flex organizer-items-center organizer-gap-2 organizer-text-text-placeholder organizer-text-xs organizer-bg-bg-surface organizer-px-3 organizer-py-2 organizer-rounded-full">
        <Bookmark size={12} />
        <span>Right-click a chat to bookmark it</span>
      </div>
    </div>)
  }

  return (
    <div className="organizer-flex organizer-flex-col organizer-h-full">
      <div className="organizer-relative organizer-mb-4">
        <Input
          type="text"
          placeholder="Search bookmarks..."
          variant="ghost"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {hasBookmarks && renderContent()}
      {!hasBookmarks && !isLoading && renderEmptyState()}
      {isLoading && renderContent()}
    </div>
  );
};

export default BookmarksTab;
