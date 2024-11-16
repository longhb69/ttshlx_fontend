import { useEffect, useRef, useState } from "react";
import {
    draggable,
    dropTargetForElements,
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { createPortal } from "react-dom";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

const idleState = { type: "idle" };
const draggingState = { type: "dragging" };

export default function CardItem() {
    const ref = useRef(null);
    const [state, setState] = useState(idleState);
    const [closestEdge, setClosestEdge] = useState({
        data: null,
        position: "",
    });
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

        return combine(
            draggable({
                element: el,
                getInitialData: () => {
                    return { dimensions };
                },
                onGenerateDragPreview({
                    location,
                    source,
                    nativeSetDragImage,
                }) {
                    const rect = source.element.getBoundingClientRect();

                    setCustomNativeDragPreview({
                        nativeSetDragImage,
                        getOffset: preserveOffsetOnSource({
                            element: el,
                            input: location.current.input,
                        }),
                        render({ container }) {
                            // Cause a `react` re-render to create your portal synchronously
                            setState({ type: "preview", container, rect });
                            // In our cleanup function: cause a `react` re-render to create remove your portal
                            // Note: you can also remove the portal in `onDragStart`,
                            // which is when the cleanup function is called
                            return () => setState(draggingState);
                        },
                    });
                },
                onDragStart: () => setState(draggingState),
                onDrop: () => setState(idleState),
            }),
            dropTargetForElements({
                element: el,
                getIsSticky: () => true,
                onDragEnter: (args) => {
                    setClosestEdge({
                        data: args.source.data,
                        position: "bottom",
                    });
                },
                onDragLeave: () => setClosestEdge(null),
            })
        );
    }, []);
    return (
        <div className="">
            <div
                className={`truncate border-2 border-transparent hover:border-[#388BFF] py-2 px-3 text-sm bg-white rounded-md shadow-sm 
        ${state.type === "dragging" ? "opacity-40" : ""}`}
                ref={ref}
            >
                <p>This list has the List Limits Power-up</p>
                {state.type === "preview" &&
                    createPortal(
                        <CardPreview rect={state.rect} />,
                        state.container
                    )}
            </div>
            {closestEdge && closestEdge.data && (
                <div
                    style={{
                        width: `${closestEdge.data.dimensions.width}px`,
                        height: `${closestEdge.data.dimensions.height}px`,
                    }}
                    className={`bg-slate-300 rounded-md ${
                        closestEdge.position === "bottom" ? "mt-2" : "mb-2"
                    }`}
                ></div>
            )}
        </div>
    );
}

const CardPreview = ({ rect }) => {
    return (
        <div
            className={`border-2 border-transparent py-2 px-3 text-sm bg-white rounded-md shadow-sm opacity-90 rotate-3 w-full`}
            style={{
                width: `${rect.width}px`,
                height: `${rect.height}px`,
            }}
        >
            This list has the List Limits Power-up
        </div>
    );
};
