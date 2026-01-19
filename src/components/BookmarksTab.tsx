import React from "react";

const BookmarksTab: React.FC = () => {
  return (
    <div className="organizer-flex organizer-flex-col organizer-items-center organizer-justify-center organizer-flex-1 organizer-text-center">
      <p className="organizer-text-text-primary organizer-font-medium organizer-mb-1">
        No bookmarks yet
      </p>
      <p className="organizer-text-text-muted organizer-text-sm">
        Bookmark your favorite chats for quick access
      </p>
    </div>
  );
};

export default BookmarksTab;
