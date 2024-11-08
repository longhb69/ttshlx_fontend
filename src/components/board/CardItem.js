import { useEffect, useRef, useState } from "react";
import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { createPortal } from "react-dom";

export default function CardItem() {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!ref) return;

    return draggable({
      element: el,
      getInitialData: () => {
        return {dimensions};
      },
      onDragStart: () => {
        const rect = el.getBoundingClientRect();
        //console.log(rect.width, rect.height);
        setDimensions({ width: rect.width, height: rect.height });
        setIsDragging(true);
      },
      onDrop: () => {
        setIsDragging(false);
        setPreview(null);
      },
      onGenerateDragPreview({ nativeSetDragImage }) {
        setCustomNativeDragPreview({
          // place the (near) top middle of the `container` under the users pointer
          getOffset: () => {
            const rect = el.getBoundingClientRect();
            return { x: rect.width / 2, y: 16 };
          },
          render({ container }) {
            // Cause a `react` re-render to create your portal synchronously
            setPreview(container);
            // In our cleanup function: cause a `react` re-render to create remove your portal
            // Note: you can also remove the portal in `onDragStart`,
            // which is when the cleanup function is called
            return () => setPreview(null);
          },
          nativeSetDragImage,
        });
      },
    });
  }, []);
  return (
    <div
      className={`truncate border-2 border-transparent hover:border-[#388BFF] py-2 px-3 text-sm bg-white rounded-md shadow-sm 
      ${isDragging ? "opacity-40" : ""}`}
      ref={ref}
    >
      <p>This list has the List Limits Power-up</p>
      {preview &&
        createPortal(<CardPreview dimensions={dimensions} />, preview)}
    </div>
  );
}

const CardPreview = ({ dimensions }) => {
  return (
    <div
      className={`border-2 border-transparent py-2 px-3 text-sm bg-white rounded-md shadow-sm opacity-90 rotate-3 w-full`}
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
    >
      This list has the List Limits Power-up
    </div>
  );
};
