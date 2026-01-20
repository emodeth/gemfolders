import { Tree } from "react-arborist";
import toast from "react-hot-toast";
import Node from "./Node";
import { useFolder } from "../context/FolderContext";
import type { Folder } from "~lib/storage";

const FolderTree = ({ searchTerm }: { searchTerm?: string }) => {
  const { folders, onCreate, onMove } = useFolder();

  const handleCreate = async ({ parentId, index, type }: { parentId: string | null, index: number, type: "internal" | "leaf" }) => {
    const result = await onCreate({
      parentId,
      index,
      type: type === "internal" ? "folder" : "chat"
    });
    return result ?? null;
  };

  const findFolderName = (folderId: string | null, nodes: Folder[]): string | null => {
    if (!folderId) return "root";
    for (const node of nodes) {
      if (node.id === folderId) return node.name;
      if (node.children) {
        const found = findFolderName(folderId, node.children);
        if (found && found !== "root") return found;
      }
    }
    return null;
  };

  const handleMove = async ({ dragIds, parentId, index }: { dragIds: string[], parentId: string | null, index: number }) => {
    await onMove({ dragIds, parentId, index });

    const targetName = findFolderName(parentId, folders);
    const itemCount = dragIds.length;

    if (targetName === "root") {
      toast.success(`Moved ${itemCount} item${itemCount > 1 ? 's' : ''} to root`);
    } else if (targetName) {
      toast.success(`Moved ${itemCount} item${itemCount > 1 ? 's' : ''} to "${targetName}"`);
    }
  };

  if (!folders) return null;

  return (
    <Tree
      width={"100%"}
      rowHeight={36}
      data={folders}
      onCreate={handleCreate}
      onMove={handleMove}
      openByDefault={false}
      searchTerm={searchTerm}
      searchMatch={(node, term) =>
        node.data.name.toLowerCase().includes(term.toLowerCase())
      }
      disableDrop={({ parentNode }) =>
        parentNode?.data.type === 'chat'
      }
    >
      {Node}
    </Tree >
  )
}

export default FolderTree