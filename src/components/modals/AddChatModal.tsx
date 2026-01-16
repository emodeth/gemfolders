import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useModal } from "~context/ModalContext";
import ChatItem from "../ChatItem";
import { loadMoreGeminiChats, type GeminiChat } from "~lib/geminiChats";
import type { ChatToAdd } from "~lib/storage";

interface LoadState {
  isLoadingMore: boolean;
  progress: number;
}

const AddChatModal: React.FC = () => {
  const { onClose, data } = useModal();
  const {
    folderName = "folder",
    folderId,
    existingChatIds = [],
    initialChats = [],
    onAddChatsToFolder
  } = data || {};

  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<GeminiChat[]>(initialChats);
  const [loadState, setLoadState] = useState<LoadState>({
    isLoadingMore: false,
    progress: 0,
  });


  const handleLoadMore = async () => {
    setLoadState({ isLoadingMore: true, progress: chats.length });
    try {
      const allChats = await loadMoreGeminiChats((loaded) => {
        setLoadState((prev) => ({ ...prev, progress: loaded }));
      });
      setChats(allChats);
    } catch (error) {
      console.error("Failed to load more chats:", error);
    } finally {
      setLoadState((prev) => ({ ...prev, isLoadingMore: false }));
    }
  };

  const toggleChat = (id: string) => {
    setSelectedChats((prev) =>
      prev.includes(id) ? prev.filter((chatId) => chatId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!folderId || !onAddChatsToFolder || selectedChats.length === 0) {
      onClose();
      return;
    }

    const chatsToAdd: ChatToAdd[] = selectedChats
      .map((chatId) => {
        const chat = chats.find((c) => c.id === chatId);
        if (!chat) return null;
        return { id: chat.id, title: chat.title, url: chat.url };
      })
      .filter((chat): chat is ChatToAdd => chat !== null);

    await onAddChatsToFolder(folderId, chatsToAdd);
    onClose();
  };

  const filteredChats = chats
    .filter((chat) => !existingChatIds.includes(chat.id))
    .filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const getEmptyStateMessage = () => {
    if (chats.length === 0) {
      return "No chats found. Open the sidebar to load your chat history.";
    }
    return "No chats match your search.";
  };

  const renderChatList = () => {
    if (filteredChats.length === 0) {
      return (
        <div className="organizer-text-center organizer-py-8">
          <p className="organizer-text-gray-400 organizer-text-sm">
            {getEmptyStateMessage()}
          </p>
        </div>
      );
    }

    return (
      <div className="organizer-flex organizer-flex-col organizer-gap-1">
        {filteredChats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={{
              id: chat.id,
              title: chat.title,
              date: chat.lastUpdated,
            }}
            isSelected={selectedChats.includes(chat.id)}
            onToggle={toggleChat}
          />
        ))}
      </div>
    );
  };

  return (
    <div
      className="organizer-w-[520px] organizer-bg-[#141414] organizer-rounded-md organizer-shadow-2xl organizer-overflow-hidden organizer-flex organizer-flex-col organizer-fixed organizer-top-[10%] organizer-left-1/2 -organizer-translate-x-1/2"
      style={{ maxHeight: "80vh" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-p-5 organizer-pb-2">
        <div className="organizer-text-lg organizer-font-medium organizer-text-white">
          Add chats to{" "}
          <span className="organizer-text-[#60a5fa]">{folderName}</span>
          {" "}folder
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
            {loadState.isLoadingMore
              ? `Loading chats... (${loadState.progress} found)`
              : "Chat history is scraped from the sidebar. Some chats may not be shown."}
          </p>
          <button
            className="organizer-text-[#60a5fa] organizer-text-xs organizer-p-2 hover:organizer-bg-neutral-800 organizer-rounded-lg organizer-text-decoration-none organizer-mt-1 organizer-inline-flex organizer-items-center organizer-gap-1.5 disabled:organizer-opacity-50 disabled:organizer-cursor-not-allowed"
            onClick={handleLoadMore}
            disabled={loadState.isLoadingMore}
          >
            {loadState.isLoadingMore && <Loader2 size={12} className="organizer-animate-spin" />}
            {loadState.isLoadingMore ? "Loading..." : "Import all chats"}
          </button>
        </div>

        <div className="organizer-overflow-y-auto organizer-flex-1 organizer-pr-2 organizer-scrollbar-thin">
          {renderChatList()}
        </div>
      </div>

      <div className="organizer-p-5 organizer-pt-2 organizer-flex organizer-justify-between organizer-items-center">
        <div className="organizer-text-sm organizer-text-gray-400">
          {selectedChats.length > 0 && (
            <span>{selectedChats.length} chat{selectedChats.length === 1 ? '' : 's'} selected</span>
          )}
        </div>
        <div className="organizer-flex organizer-gap-4">
          <button
            className="organizer-text-gray-300 hover:organizer-text-white organizer-text-sm organizer-font-medium organizer-transition-colors disabled:organizer-opacity-50"
            onClick={() => setSelectedChats([])}
            disabled={selectedChats.length === 0}
          >
            Clear
          </button>
          <button
            className="organizer-px-4 organizer-py-2 organizer-rounded-lg organizer-bg-neutral-700 hover:organizer-bg-neutral-600 organizer-text-white organizer-text-sm organizer-font-medium organizer-transition-colors disabled:organizer-opacity-50 disabled:organizer-cursor-not-allowed"
            onClick={handleSave}
            disabled={selectedChats.length === 0}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddChatModal;
