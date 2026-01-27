import React from "react";
import { Tree } from "react-arborist";
import toast from "react-hot-toast";
import Node from "./Node";
import { useFolder } from "../context/FolderContext";
import type { Folder } from "~lib/storage";
import { TreeContextProvider } from "../context/TreeContext";

interface FolderTreeProps {
  searchTerm?: string;
  folders?: Folder[];
}

const FolderTree = ({ searchTerm, folders: propFolders }: FolderTreeProps) => {
  const { folders: contextFolders, onCreate, onMove } = useFolder();
  const folders = propFolders ?? contextFolders;
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(new Set());
  const [containerWidth, setContainerWidth] = React.useState(260);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleCreate = async ({ parentId, index, type }: { parentId: string | null, index: number, type: "internal" | "leaf" }) => {
    const result = await onCreate({
      parentId,
      index,
      type: type === "internal" ? "folder" : "chat"
    });

    if (parentId) {
      setExpandedIds(prev => {
        const next = new Set(prev);
        next.add(parentId);
        return next;
      });
    }
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
    const isReorder = dragIds.every(id => {
      const currentParent = findNodeParent(folders, id);
      return currentParent === parentId;
    });

    await onMove({ dragIds, parentId, index });

    if (isReorder) return;

    const targetName = findFolderName(parentId, folders);
    const itemCount = dragIds.length;

    if (targetName === "root") {
      toast.success(`Moved ${itemCount} item${itemCount > 1 ? 's' : ''} to root`);
    } else if (targetName) {
      toast.success(`Moved ${itemCount} item${itemCount > 1 ? 's' : ''} to "${targetName}"`);
    }
  };

  const findNodeParent = (nodes: Folder[], targetId: string, currentParentId: string | null = null): string | null | undefined => {
    for (const node of nodes) {
      if (node.id === targetId) return currentParentId;
      if (node.children) {
        const found = findNodeParent(node.children, targetId, node.id);
        if (found !== undefined) return found;
      }
    }
    return undefined;
  };

  const countVisibleNodes = (nodes: Folder[], expanded: Set<string>, term: string = "") => {
    let count = 0;
    const traverse = (items: Folder[]) => {
      for (const item of items) {
        if (term) {
          count++;
          if (item.children) traverse(item.children);
        } else {
          count++;
          if (item.children && item.children.length > 0 && expanded.has(item.id)) {
            traverse(item.children);
          }
        }
      }
    };
    traverse(nodes);
    return count;
  };

  const treeHeight = React.useMemo(() => {
    if (!folders) return 0;
    if (searchTerm) return 400;
    const visibleCount = countVisibleNodes(folders, expandedIds);
    return Math.max(visibleCount * 36, 36);
  }, [folders, expandedIds, searchTerm]);

  const handleToggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (!folders) return null;

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <TreeContextProvider value={{ containerWidth }}>
        <Tree
          className="organizer-overflow-x-hidden"
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
          onToggle={handleToggle}
        >
          {Node}
        </Tree >
      </TreeContextProvider>
    </div>
  )
}

export default FolderTree