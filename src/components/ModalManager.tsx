import React, { useEffect } from 'react';
import { useModal } from '../context/ModalContext';
import CreateFolderModal from '~components/modals/CreateFolderModal';
import ColorPickerModal from '~components/modals/ColorPickerModal';
import DeleteFolderModal from '~components/modals/DeleteFolderModal';
import AddChatModal from '~components/modals/AddChatModal';
import RenameFolderModal from '~components/modals/RenameFolderModal';
import AddSubfolderModal from '~components/modals/AddSubfolderModal';
import RenameChatModal from '~components/modals/RenameChatModal';
import DeleteChatModal from '~components/modals/DeleteChatModal';
import MoveChatModal from '~components/modals/MoveChatModal';

const ModalManager: React.FC = () => {
  const { type, isOpen, onClose } = useModal();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !type) return null;

  const isSmallModal = type === 'deleteFolder' || type === 'renameFolderModal' || type === 'renameChatModal' || type === 'deleteChatModal';
  const isTransparentOverlay = type === 'createFolder' || type === 'addSubfolder';

  const handleOverlayClick = (e: React.MouseEvent) => {
    // For addSubfolder, don't close on overlay click (context menu should stay open)
    if (type === 'addSubfolder') {
      e.stopPropagation();
      return;
    }
    onClose();
  };

  return (
    <div
      data-modal-overlay="true"
      className={`organizer-fixed organizer-inset-0 organizer-z-[10000] organizer-bg-transparent
        ${isTransparentOverlay ? '' : 'organizer-flex organizer-justify-center'}
        ${isSmallModal ? 'organizer-items-start organizer-pt-[20vh]' : ''}
        ${!isSmallModal && !isTransparentOverlay ? 'organizer-items-center' : ''}
      `}
      onClick={handleOverlayClick}
    >
      <div className="organizer-pointer-events-auto" onClick={(e) => e.stopPropagation()}>
        {type === 'createFolder' && <CreateFolderModal />}
        {type === 'colorPicker' && <ColorPickerModal />}
        {type === 'deleteFolder' && <DeleteFolderModal />}
        {type === 'addChat' && <AddChatModal />}
        {type === 'renameFolderModal' && <RenameFolderModal />}
        {type === 'addSubfolder' && <AddSubfolderModal />}
        {type === 'renameChatModal' && <RenameChatModal />}
        {type === 'deleteChatModal' && <DeleteChatModal />}
        {type === 'moveChatModal' && <MoveChatModal />}
      </div>
    </div>
  );
};

export default ModalManager;
