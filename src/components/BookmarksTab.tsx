import React from "react";

const BookmarksTab: React.FC = () => {
  return (
    <div className="organizer-flex organizer-flex-col organizer-items-center organizer-justify-center organizer-flex-1 organizer-text-center">
      <p className="organizer-text-gray-300 organizer-font-medium organizer-mb-1">
        No bookmarks yet
      </p>
      <p className="organizer-text-gray-500 organizer-text-sm">
        Bookmark your favorite chats for quick access
      </p>
    </div>
  );
};

export default BookmarksTab;
