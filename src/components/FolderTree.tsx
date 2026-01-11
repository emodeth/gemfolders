import { Tree } from "react-arborist";
import Node from "./Node";

const FolderTree = () => {

  const data = [
    {
      id: "1",
      name: "public",
      children: [{ id: "c1-1", name: "index.html" }]
    },
    {
      id: "2",
      name: "src",
      children: [
        { id: "c2-1", name: "App.js" },
        { id: "c2-2", name: "index.js" },
        { id: "c2-3", name: "styles.css" }
      ]
    },
  ];

  return (
    <Tree width={"100%"} rowHeight={36} initialData={data} >
      {Node}
    </Tree >
  )
}

export default FolderTree