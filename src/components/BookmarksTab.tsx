import React, { useState } from "react";
import { Input } from "./ui/Input";
import { useBookmark } from "../context/BookmarkContext";
import BookmarkItem from "./BookmarkItem";
import EmptyBookmarks from "./EmptyBookmarks";
import { useI18n } from "~lib/i18n";

const BookmarksTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { bookmarks, isLoading, removeBookmark } = useBookmark();
  const { t } = useI18n();

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

    if (!hasBookmarks) {
      return <EmptyBookmarks />;
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
      <EmptyBookmarks message={t("noResults")} description={t("tryDifferentSearch")} />
    );
  };

  return (
    <div className="organizer-flex organizer-flex-col organizer-h-full">
      <div className="organizer-relative organizer-mb-4">
        <Input
          type="text"
          placeholder={t("searchBookmarks")}
          variant="ghost"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {hasBookmarks && renderContent()}
      {!hasBookmarks && !isLoading && <EmptyBookmarks />}
      {isLoading && renderContent()}
    </div>
  );
};

export default BookmarksTab;
