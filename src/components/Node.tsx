import { ChevronDown, ChevronRight, GripVertical, MessageSquareText } from "lucide-react";


const Node = ({ node, style, dragHandle }: any) => {
  function renderFolder() {
    return (
      <>
        {node.isOpen ? <ChevronDown className="organizer-mr-2" size={16} /> : <ChevronRight className="organizer-mr-2" size={16} />}
        <div className="organizer-flex-1 organizer-flex organizer-items-center organizer-justify-between organizer-bg-[#60a5fa] organizer-h-full organizer-px-2 organizer-py-1 organizer-rounded-md ">
          <span>{node.data.name}</span>
          {node.data.children.length > 0 ? (
            <span className="organizer-text-xs">{node.data.children.length} {node.data.children.length === 1 ? "item" : "items"}</span>
          ) : null}
        </div>
      </>
    )
  }

  function renderChat() {
    return (
      <>
        <MessageSquareText className="organizer-ml-1" size={16} />
        <div className="organizer-flex-1 organizer-flex organizer-items-center organizer-px-2 organizer-py-1 organizer-h-full">
          <span>{node.data.name}</span>
        </div></>
    )

  }

  return (
    <div onClick={() => node.isInternal && node.toggle()}
      style={style}
      className="organizer-text-sm organizer-font-semibold organizer-flex organizer-items-center organizer-h-8 organizer-mb-1 organizer-text-white organizer-cursor-pointer hover:organizer-brightness-[85%]" ref={dragHandle}>
      <GripVertical className="organizer-mr-1 organizer-text-neutral-700" size={14} />
      {node.isLeaf ? (
        renderChat()
      ) : (
        renderFolder()
      )}

    </div>
  );
}

export default Node