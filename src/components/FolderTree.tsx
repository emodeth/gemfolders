import React from "react";
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

  const [treeHeight, setTreeHeight] = React.useState(200);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (folders) {
      setTreeHeight(Math.max(folders.length * 36, 100));
    }
  }, [folders?.length]);

  React.useEffect(() => {
    if (!wrapperRef.current) return;

    const findAndObserveList = () => {
      const treeContainer = wrapperRef.current?.firstElementChild;
      if (!treeContainer) return false;


      const scroller = treeContainer.firstElementChild;
      const list = scroller?.firstElementChild;

      if (list instanceof HTMLElement) {
        const observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const newHeight = entry.contentRect.height;
            setTreeHeight(h => Math.abs(h - newHeight) > 2 ? newHeight : h);
          }
        });
        observer.observe(list);
        return () => observer.disconnect();
      }
      return false;
    };

    const cleanup = findAndObserveList();
    if (cleanup) return cleanup;

    const timer = setTimeout(findAndObserveList, 100);
    return () => {
      clearTimeout(timer);
      if (typeof cleanup === 'function') cleanup();
    };
  }, [folders, searchTerm]);

  if (!folders) return null;

  return (
    <div ref={wrapperRef}>
      <Tree
        width={"100%"}
        height={treeHeight}
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
    </div>
  )
}

export default FolderTree