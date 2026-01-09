import React from 'react';
import { useModal } from '../context/ModalContext';
import CreateFolderModal from '~components/modals/CreateFolderModal';
import ColorPickerModal from '~components/modals/ColorPickerModal';
import DeleteFolderModal from '~components/modals/DeleteFolderModal';
import AddChatModal from '~components/modals/AddChatModal';

const ModalManager: React.FC = () => {
  const { type, isOpen, onClose } = useModal();

  if (!isOpen || !type) return null;

  const isDeleteModal = type === 'deleteFolder';

  return (
    <>
      <div
        className={`organizer-fixed organizer-inset-0 organizer-z-[10000] ${type === 'createFolder' ? 'organizer-bg-transparent' : 'organizer-bg-black/50'}`}
        onClick={onClose}
      />
      <div
        className={`organizer-fixed organizer-inset-0 organizer-z-[10001] organizer-pointer-events-none
          ${type === 'createFolder' ? '' : 'organizer-flex organizer-justify-center'}
          ${isDeleteModal ? 'organizer-items-start organizer-pt-[30vh]' : (type !== 'createFolder' ? 'organizer-items-center' : '')}
        `}
      >
        <div className="organizer-pointer-events-auto">
          {type === 'createFolder' && <CreateFolderModal />}
          {type === 'colorPicker' && <ColorPickerModal />}
          {type === 'deleteFolder' && <DeleteFolderModal />}
          {type === 'addChat' && <AddChatModal />}
        </div>
      </div>
    </>
  );
};

export default ModalManager;
