import React from 'react';
import { useModal } from '../context/ModalContext';
import CreateFolderModal from '~components/modals/CreateFolderModal';
import ColorPickerModal from '~components/modals/ColorPickerModal';
import DeleteFolderModal from '~components/modals/DeleteFolderModal';
import AddChatModal from '~components/modals/AddChatModal';
import RenameFolderModal from '~components/modals/RenameFolderModal';

const ModalManager: React.FC = () => {
  const { type, isOpen, onClose } = useModal();

  if (!isOpen || !type) return null;

  const isSmallModal = type === 'deleteFolder' || type === 'renameFolderModal';

  return (
    <>
      <div
        className={`organizer-fixed organizer-inset-0 organizer-z-[10000] ${type === 'createFolder' ? 'organizer-bg-transparent' : 'organizer-bg-black/50'}`}
        onClick={onClose}
      />
      <div
        className={`organizer-fixed organizer-inset-0 organizer-z-[10001] organizer-pointer-events-none
          ${type === 'createFolder' ? '' : 'organizer-flex organizer-justify-center'}
          ${isSmallModal ? 'organizer-items-start organizer-pt-[20vh]' : (type !== 'createFolder' ? 'organizer-items-center' : '')}
        `}
      >
        <div className="organizer-pointer-events-auto">
          {type === 'createFolder' && <CreateFolderModal />}
          {type === 'colorPicker' && <ColorPickerModal />}
          {type === 'deleteFolder' && <DeleteFolderModal />}
          {type === 'addChat' && <AddChatModal />}
          {type === 'renameFolderModal' && <RenameFolderModal />}
        </div>
      </div>
    </>
  );
};

export default ModalManager;
