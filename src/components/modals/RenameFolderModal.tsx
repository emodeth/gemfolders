import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useModal } from "~context/ModalContext";

const RenameFolderModal: React.FC = () => {
  const { onClose, data } = useModal();
  const { folderName = "", folderId, onRename } = data || {};
  const [newName, setNewName] = useState(folderName);

  useEffect(() => {
    setNewName(folderName);
  }, [folderName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (onRename) {
      await onRename(folderId, newName.trim());
    }
    onClose();
  };

  return (
    <div
      className="organizer-w-[400px] organizer-bg-[#2a2a2a] organizer-rounded-lg organizer-shadow-2xl organizer-overflow-hidden organizer-fixed organizer-top-[20%] organizer-left-1/2 -organizer-translate-x-1/2"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-px-4 organizer-py-3">
        <div className="organizer-text-[14px] organizer-font-medium organizer-text-white">
          Rename Folder
        </div>
        <button
          className="organizer-text-gray-400 hover:organizer-text-white organizer-transition-colors"
          onClick={onClose}
        >
          <X size={18} />
        </button>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit}>
        <div className="organizer-px-4 organizer-pb-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter folder name"
            className="organizer-w-full organizer-bg-[#212121] organizer-rounded-md organizer-px-3 organizer-py-2 organizer-text-white organizer-text-sm organizer-border organizer-border-[#212121] organizer-outline-none focus:organizer-border-blue-500 organizer-placeholder-neutral-500"
            autoFocus
          />
        </div>

        {/* Footer with buttons */}
        <div className="organizer-px-4 organizer-pb-4 organizer-flex organizer-justify-end organizer-gap-2">
          <button
            type="button"
            className="organizer-px-3 organizer-py-1.5 organizer-text-gray-300 hover:organizer-text-white organizer-text-sm organizer-font-medium organizer-transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="organizer-px-3 organizer-py-1.5 organizer-rounded-md organizer-bg-neutral-700 hover:organizer-bg-neutral-600 organizer-text-white organizer-text-sm organizer-font-medium organizer-transition-colors"
          >
            Rename
          </button>
        </div>
      </form>
    </div>
  );
};

export default RenameFolderModal;
