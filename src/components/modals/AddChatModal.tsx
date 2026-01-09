import React, { useState } from "react";
import { X } from "lucide-react";
import { useModal } from "~context/ModalContext";
import ChatItem from "../ChatItem";

const DUMMY_CHATS = [
  { id: 1, title: "Pasaport başvurusu gereksinimleri", date: "05.01.2026 04:45:54" },
  { id: 2, title: "Logo design request", date: "29.12.2025 03:00:06" },
  { id: 3, title: "Logo design request", date: "29.12.2025 02:56:51" },
  { id: 4, title: "Radix UI button fix", date: "15.12.2025 03:27:31" },
  { id: 5, title: "Create project life cycle answer", date: "14.12.2025 20:12:37" },
  { id: 6, title: "Füzyon algoritması özeti", date: "10.11.2025 17:30:28" },
  { id: 7, title: "Hasan Çifci e-posta arama", date: "08.11.2025 16:35:51" },
  { id: 8, title: "TypeScript types for sidebar", date: "07.11.2025 19:50:43" },
];

const AddChatModal: React.FC = () => {
  const { onClose, data } = useModal();
  const { folderName = "folder" } = data || {};
  const [selectedChats, setSelectedChats] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleChat = (id: number) => {
    setSelectedChats((prev) =>
      prev.includes(id) ? prev.filter((chatId) => chatId !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    console.log("Saving chats:", selectedChats);
    onClose();
  };

  const filteredChats = DUMMY_CHATS.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className="organizer-w-[520px] organizer-bg-[#141414] organizer-rounded-md organizer-shadow-2xl organizer-overflow-hidden organizer-flex organizer-flex-col organizer-fixed organizer-top-[10%] organizer-left-1/2 -organizer-translate-x-1/2"
      style={{ maxHeight: "80vh" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-p-5 organizer-pb-2">
        <div className="organizer-text-lg organizer-font-medium organizer-text-white">
          Add chats to&nbsp;
          <span className="organizer-text-[#60a5fa]">{folderName}</span>
          &nbsp;folder
        </div>
        <button
          className="organizer-text-gray-400 hover:organizer-text-white organizer-transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <div className="organizer-pb-5 organizer-px-3 organizer-pt-4 organizer-flex-1 organizer-overflow-hidden organizer-flex organizer-flex-col">
        <div className="organizer-relative organizer-mb-4 organizer-px-2">
          <input
            type="text"
            placeholder="Filter chats by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="organizer-w-full organizer-bg-[#202123] organizer-rounded-lg organizer-px-4 organizer-py-2.5 organizer-text-gray-200 organizer-placeholder-gray-500 organizer-outline-none organizer-border organizer-border-[#202123] focus:organizer-border-blue-500 organizer-text-sm"
          />
        </div>

        <div className="organizer-text-center organizer-mb-4">
          <p className="organizer-text-white organizer-text-xs organizer-mb-1">
            Chat history is only partially imported. Some chats may not be shown.
          </p>
          <button className="organizer-text-[#60a5fa] organizer-text-xs organizer-p-2 hover:organizer-bg-neutral-800 organizer-rounded-lg organizer-text-decoration-none organizer-mt-1">
            Import all chats
          </button>
        </div>

        <div className="organizer-overflow-y-auto organizer-flex-1 organizer-pr-2 organizer-scrollbar-thin">
          <div className="organizer-flex organizer-flex-col organizer-gap-1">
            {filteredChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChats.includes(chat.id)}
                onToggle={toggleChat}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="organizer-p-5 organizer-pt-2 organizer-flex organizer-justify-end organizer-gap-4">
        <button
          className="organizer-text-gray-300 hover:organizer-text-white organizer-text-sm organizer-font-medium organizer-transition-colors"
          onClick={() => setSelectedChats([])}
        >
          Clear
        </button>
        <button
          className="organizer-px-4 organizer-py-2 organizer-rounded-lg organizer-bg-neutral-700 hover:organizer-bg-neutral-600 organizer-text-white organizer-text-sm organizer-font-medium organizer-transition-colors"
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default AddChatModal;
