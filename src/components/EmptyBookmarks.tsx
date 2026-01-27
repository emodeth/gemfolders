import React from 'react';
import { Bookmark } from 'lucide-react';

interface EmptyBookmarksProps {
  message?: string;
  description?: string;
}

const EmptyBookmarks: React.FC<EmptyBookmarksProps> = ({
  message = "No bookmarks yet",
  description = "Bookmark chats to find them quickly"
}) => {
  return (
    <div className="organizer-flex organizer-flex-col organizer-items-center organizer-justify-center organizer-py-8 organizer-w-full organizer-text-text-secondary modal-animate-fade organizer-mt-11">
      <div className="organizer-bg-surface-hover organizer-p-2 organizer-rounded-full ">
        <Bookmark size={24} className="organizer-text-primary/60" />
      </div>
      <h3 className="organizer-text-sm organizer-font-medium organizer-mb-1 organizer-text-text-primary">
        {message}
      </h3>
      <p className="organizer-text-xs organizer-text-center organizer-text-text-muted organizer-max-w-[200px]">
        {description}
      </p>
    </div>
  );
};

export default EmptyBookmarks;
