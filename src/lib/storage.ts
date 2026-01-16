import { v4 as uuidv4 } from 'uuid';
import { getRandomColor } from '../constants/colors';

export interface Folder {
  id: string;
  name: string;
  type: 'folder' | 'chat';
  children: Folder[];
  color?: string;
  chatUrl?: string; // Original Gemini chat URL for chat items
}

const STORAGE_KEY = 'gemini-folders';

export const getFolders = async (): Promise<Folder[]> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] || []);
    });
  });
};

export const saveFolders = async (folders: Folder[]): Promise<void> => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: folders }, () => {
      resolve();
    });
  });
};

export const createFolder = async (
  name: string,
  type: 'folder' | 'chat',
  parentId: string | null,
  index?: number
): Promise<{ folders: Folder[]; newFolder: Folder }> => {
  const folders = await getFolders();
  const newId = uuidv4();
  const newNode: Folder = { 
    id: newId, 
    name, 
    type, 
    children: [],
    color: type === 'folder' ? getRandomColor() : undefined
  };

  if (parentId) {
    const addToParent = (nodes: Folder[]): boolean => {
      for (const node of nodes) {
        if (node.id === parentId) {
          if (!node.children) node.children = [];
          if (typeof index === 'number' && index >= 0) {
            node.children.splice(index, 0, newNode);
          } else {
            node.children.push(newNode);
          }
          return true;
        }
        if (node.children && addToParent(node.children)) return true;
      }
      return false;
    };
    addToParent(folders);
  } else {
    if (typeof index === 'number' && index >= 0) {
      folders.splice(index, 0, newNode);
    } else {
      folders.push(newNode);
    }
  }
  
  await saveFolders(folders);
  return { folders, newFolder: newNode };
};

export const updateFolderColor = async (folderId: string, color: string): Promise<Folder[]> => {
  const folders = await getFolders();
  
  const updateColor = (nodes: Folder[]): boolean => {
    for (const node of nodes) {
      if (node.id === folderId) {
        node.color = color;
        return true;
      }
      if (node.children && updateColor(node.children)) return true;
    }
    return false;
  };

  updateColor(folders);
  await saveFolders(folders);
  return folders;
};

export const deleteFolder = async (folderId: string): Promise<Folder[]> => {
  const folders = await getFolders();
  
  const removeFromTree = (nodes: Folder[]): Folder[] => {
    return nodes.filter((node) => {
      if (node.id === folderId) {
        return false;
      }

      if (node.children && node.children.length > 0) {
        node.children = removeFromTree(node.children);
      }
      return true;
    });
  };

  const updatedFolders = removeFromTree(folders);
  await saveFolders(updatedFolders);
  return updatedFolders;
};

export const renameFolder = async (folderId: string, newName: string): Promise<Folder[]> => {
  const folders = await getFolders();
  
  const updateName = (nodes: Folder[]): boolean => {
    for (const node of nodes) {
      if (node.id === folderId) {
        node.name = newName;
        return true;
      }
      if (node.children && updateName(node.children)) return true;
    }
    return false;
  };

  updateName(folders);
  await saveFolders(folders);
  return folders;
};

export interface ChatToAdd {
  id: string;
  title: string;
  url: string;
}

export const addChatsToFolder = async (
  folderId: string,
  chats: ChatToAdd[]
): Promise<Folder[]> => {
  const folders = await getFolders();
  
  const addChats = (nodes: Folder[]): boolean => {
    for (const node of nodes) {
      if (node.id === folderId && node.type === 'folder') {
        const chatNodes: Folder[] = chats.map((chat) => ({
          id: chat.id,
          name: chat.title,
          type: 'chat' as const,
          children: [],
          chatUrl: chat.url,
        }));
        
        const existingIds = new Set(node.children.map((child) => child.id));
        const newChats = chatNodes.filter((chat) => !existingIds.has(chat.id));
        
        node.children.push(...newChats);
        return true;
      }
      if (node.children && addChats(node.children)) return true;
    }
    return false;
  };

  addChats(folders);
  await saveFolders(folders);
  return folders;
};

export const renameChat = async (chatId: string, newName: string): Promise<Folder[]> => {
  const folders = await getFolders();
  
  const updateName = (nodes: Folder[]): boolean => {
    for (const node of nodes) {
      if (node.id === chatId && node.type === 'chat') {
        node.name = newName;
        return true;
      }
      if (node.children && updateName(node.children)) return true;
    }
    return false;
  };

  updateName(folders);
  await saveFolders(folders);
  return folders;
};
