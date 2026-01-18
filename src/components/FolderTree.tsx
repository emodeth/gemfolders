import { Tree } from "react-arborist";
import Node from "./Node";
import { useFolder } from "../context/FolderContext";

const FolderTree = () => {
  const { folders, onCreate, onMove } = useFolder();

  const handleCreate = async ({ parentId, index, type }: { parentId: string | null, index: number, type: "internal" | "leaf" }) => {
    const result = await onCreate({
      parentId,
      index,
      type: type === "internal" ? "folder" : "chat"
    });
    return result ?? null;
  };

  const handleMove = async ({ dragIds, parentId, index }: { dragIds: string[], parentId: string | null, index: number }) => {
    await onMove({ dragIds, parentId, index });
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
      disableDrop={({ parentNode }) =>
        parentNode?.data.type === 'chat'
      }
    >
      {Node}
    </Tree >
  )
}

export default FolderTree