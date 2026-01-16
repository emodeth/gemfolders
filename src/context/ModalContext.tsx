import React, { createContext, useContext, useState, type ReactNode } from 'react';

export type ModalType = 'createFolder' | 'renameFolder' | 'deleteFolder' | 'colorPicker' | 'addChat' | 'renameFolderModal' | 'addSubfolder' | 'renameChatModal' | 'deleteChatModal';

interface ModalContextType {
  type: ModalType;
  isOpen: boolean;
  data: any;
  onOpen: (type: ModalType, data?: any) => void;
  onClose: () => void;
}

interface ModalStore {
  type: ModalType;
  data: any;
  isOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<ModalStore>({
    type: null,
    data: {},
    isOpen: false,
  });

  const onOpen = (type: ModalType, data: any = {}) => {
    setStore({ type, data, isOpen: true });
  };

  const onClose = () => {
    setStore({ type: null, data: {}, isOpen: false });
  };

  const value = React.useMemo(
    () => ({ type: store.type, isOpen: store.isOpen, data: store.data, onOpen, onClose }),
    [store]
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
