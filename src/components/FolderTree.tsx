import { Tree } from "react-arborist";
import Node from "./Node";
import { useFolder } from "../context/FolderContext";

const FolderTree = () => {
  const { folders, onCreate } = useFolder();

  const handleCreate = async ({ parentId, index, type }: { parentId: string | null, index: number, type: "internal" | "leaf" }) => {
    const result = await onCreate({
      parentId,
      index,
      type: type === "internal" ? "folder" : "chat"
    });
    return result ?? null;
  };

  if (!folders) return null;

  return (
    <Tree
      width={"100%"}
      rowHeight={36}
      data={folders}
      onCreate={handleCreate}
    >
      {Node}
    </Tree >
  )
}

export default FolderTree