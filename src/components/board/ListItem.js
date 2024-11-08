import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import CardItem from "./CardItem";
import ListHeader from "./ListHeader";
import { useEffect, useRef, useState } from "react";

export default function ListItem() {
  const ref = useRef(null); 
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      onDragEnter: ({source, self}) => {
        //console.log("Drag Enter");
        //console.log(source.data.dimensions, self.data)
        setIsDraggedOver(true)
      },
      onDragLeave: () => {
        console.log("Drag Leave");
        setIsDraggedOver(false)
      },
      onDrop: ({source, self}) => {
        setIsDraggedOver(false)
      },
    })
  }, []);
  return (
    <li className="shrink-0 h-full w-[272px] select-none" ref={ref}>
      <div className="w-full rounded-md bg-[#f1f2f4] shadow-md pb-2">
        <ListHeader />
        <ol className="mx-1 px-1 py-0.5 flex flex-col gap-y-2">
          <CardItem />
          <CardItem />
          <CardItem />
        </ol>
      </div>
    </li>
  );
}
