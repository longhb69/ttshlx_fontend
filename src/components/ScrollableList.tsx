import { useRef, ReactElement, useEffect } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

export default function ScrollableList({ children }: { children: ReactElement }) {
    const ref = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        return combine(
            autoScrollForElements({
                element,
            })
        );
    });

    return (
        <div ref={ref} className="h-[90%] custom-scrollbar overflow-y-scroll scrollbar-hidden">
            {children}
        </div>
    );
}
