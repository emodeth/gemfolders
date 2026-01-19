import React from "react";
import { X, MessageSquareText } from "lucide-react";
import { useModal } from "~context/ModalContext";
import { Button } from "../ui/Button";

const DeleteChatModal: React.FC = () => {
  const { onClose, data } = useModal();
  const { chatName = "Chat", onDelete } = data || {};

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    onClose();
  };

  return (
    <div
      className="organizer-w-[520px] organizer-bg-[#202123] organizer-rounded-lg organizer-shadow-2xl organizer-overflow-hidden organizer-fixed organizer-top-[20%] organizer-left-1/2 -organizer-translate-x-1/2"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-p-5 organizer-pb-0">
        <div className="organizer-flex organizer-items-center organizer-gap-3">
          <div className="organizer-text-white">
            <MessageSquareText size={20} />
          </div>
          <div className="organizer-text-[16px] organizer-font-medium organizer-text-white">
            Delete {chatName}
          </div>
        </div>
        <button
          className="organizer-text-gray-400 hover:organizer-text-white organizer-transition-colors"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      <div className="organizer-p-5 organizer-pt-6 organizer-flex organizer-justify-end organizer-gap-3">
        <Button variant="cancel" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="default" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
};

export default DeleteChatModal;

