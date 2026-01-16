import React from 'react';
import { useModal } from '../context/ModalContext';
import CreateFolderModal from '~components/modals/CreateFolderModal';
import ColorPickerModal from '~components/modals/ColorPickerModal';
import DeleteFolderModal from '~components/modals/DeleteFolderModal';
import AddChatModal from '~components/modals/AddChatModal';
import RenameFolderModal from '~components/modals/RenameFolderModal';
import AddSubfolderModal from '~components/modals/AddSubfolderModal';
import RenameChatModal from '~components/modals/RenameChatModal';
import DeleteChatModal from '~components/modals/DeleteChatModal';

const ModalManager: React.FC = () => {
  const { type, isOpen, onClose } = useModal();

  if (!isOpen || !type) return null;

  const isSmallModal = type === 'deleteFolder' || type === 'renameFolderModal' || type === 'renameChatModal' || type === 'deleteChatModal';
  const isPositionedModal = type === 'createFolder' || type === 'addSubfolder';

  const handleOverlayClick = (e: React.MouseEvent) => {
    // For addSubfolder, don't close on overlay click (context menu should stay open)
    if (type === 'addSubfolder') {
      e.stopPropagation();
      return;
    }
    onClose();
  };

  return (
    <>
      <div
        data-modal-overlay="true"
        className={`organizer-fixed organizer-inset-0 organizer-z-[10000] ${isPositionedModal ? 'organizer-bg-transparent organizer-pointer-events-none' : 'organizer-bg-black/50'}`}
        onClick={handleOverlayClick}
      />
      <div
        className={`organizer-fixed organizer-inset-0 organizer-z-[10001] organizer-pointer-events-none
          ${isPositionedModal ? '' : 'organizer-flex organizer-justify-center'}
          ${isSmallModal ? 'organizer-items-start organizer-pt-[20vh]' : ''}
          ${!isSmallModal && !isPositionedModal ? 'organizer-items-center' : ''}
        `}
      >
        <div className="organizer-pointer-events-auto">
          {type === 'createFolder' && <CreateFolderModal />}
          {type === 'colorPicker' && <ColorPickerModal />}
          {type === 'deleteFolder' && <DeleteFolderModal />}
          {type === 'addChat' && <AddChatModal />}
          {type === 'renameFolderModal' && <RenameFolderModal />}
          {type === 'addSubfolder' && <AddSubfolderModal />}
          {type === 'renameChatModal' && <RenameChatModal />}
          {type === 'deleteChatModal' && <DeleteChatModal />}
        </div>
      </div>
    </>
  );
};

export default ModalManager;
