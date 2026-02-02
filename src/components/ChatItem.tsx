import React from "react";

interface ChatItemProps {
  chat: {
    id: string;
    title: string;
    date?: string;
  };
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, isSelected, onToggle }) => {
  return (
    <div
      className="organizer-flex organizer-items-start organizer-gap-3 organizer-p-2 hover:organizer-bg-bg-surface-hover organizer-rounded-md organizer-cursor-pointer organizer-group"
      onClick={() => onToggle(chat.id)}
    >
      <div className="organizer-pt-1">
        <div
          className={`organizer-w-4 organizer-h-4 organizer-rounded-sm organizer-bg-bg-input organizer-border organizer-border-border-default organizer-flex organizer-items-center organizer-justify-center organizer-transition-colors ${isSelected
            ? "!organizer-bg-primary !organizer-border-primary"
            : ""
            }`}
        >
          {isSelected && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="organizer-w-3 organizer-h-3 organizer-text-white"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>
      <div className="organizer-flex-1 organizer-gap-2 organizer-flex organizer-flex-col ">
        <div className="organizer-text-sm organizer-text-text-primary organizer-font-medium">
          {chat.title}
        </div>
        {chat.date && (
          <div className="organizer-text-xs organizer-text-text-muted">
            Updated at: {chat.date}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatItem;
