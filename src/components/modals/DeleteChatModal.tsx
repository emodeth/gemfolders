import React from "react";
import toast from "react-hot-toast";
import { X, MessageSquareText } from "lucide-react";
import { useModal } from "~context/ModalContext";
import { Button } from "../ui/Button";
import { truncateText } from "~lib/utils";

const DeleteChatModal: React.FC = () => {
  const { onClose, data } = useModal();
  const { chatName = "Chat", onDelete } = data || {};

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    toast.success(`"${truncateText(chatName)}" removed from folder`);
    onClose();
  };

  return (
    <div
      className="organizer-w-[520px] organizer-bg-bg-background organizer-rounded-lg organizer-shadow-2xl organizer-overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="organizer-flex organizer-items-center organizer-justify-between organizer-p-5 organizer-pb-0">
        <div className="organizer-flex organizer-items-center organizer-gap-3 organizer-flex-1 organizer-min-w-0 organizer-mr-4">
          <div className="organizer-text-text-primary organizer-flex-shrink-0">
            <MessageSquareText size={20} />
          </div>
          <div className="organizer-text-[16px] organizer-font-medium organizer-text-text-primary organizer-truncate">
            Delete {chatName}
          </div>
        </div>
        <button
          className="organizer-text-text-secondary hover:organizer-text-text-primary organizer-transition-colors"
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

