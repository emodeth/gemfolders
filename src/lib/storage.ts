import { v4 as uuidv4 } from 'uuid';
import { getRandomColor } from '../constants/colors';

export interface Folder {
  id: string;
  name: string;
  type: 'folder' | 'chat';
  children: Folder[];
  color?: string;
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
