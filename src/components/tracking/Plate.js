import { useEffect, useRef, useState } from "react";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { createPortal } from "react-dom";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";

const idleState = { type: "idle" };
const draggingState = { type: "dragging" };

const PlatePrimitive = ({ car }) => {
    const { plate, expiry_date, owner_name, car_class, available_slot, current_slot } = car;
    return (
        <>
            <div className="w-full rounded">
                <div className="bg-yellow-400 border-black border-t-2 border-l-2 border-b-2 px-2 py-1 rounded-tl  text-sm w-full h-[35px] text-center">
                    <span className="font-mono font-bold">{plate}</span>
                </div>
                <div className="bg-slate-200 p-1 rounded-bl border-b-2 border-l-2 border-r-2 border-[#244855]">
                    <div className="text-xs">
                        <span>NHĐK: </span>
                        <span>{formatFirebaseTimestamp(expiry_date.seconds)}</span>
                    </div>
                    <div>{owner_name}</div>
                </div>
            </div>
            <div className="h-full">
                <div className="w-[35px] h-[35px] bg-white flex items-center justify-center border-t-2 border-r-2 border-b-2 border-black rounded-tr  text-lg font-bold">
                    <span className="text-[#003135]">{car_class}</span>
                </div>
                <div className="w-[35px] h-[35px] bg-slate-300 flex items-center justify-center border-r-2 border-b-2 border-[#244855] rounded-br text-sm font-medium">
                    <span className="text-[#244855]">
                        {current_slot}/{available_slot}
                    </span>
                </div>
            </div>
        </>
    );
};

export default function Plate({ car }) {
    const ref = useRef(null);
    const [state, setState] = useState(idleState);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        return combine(
            draggable({
                element: el,
                onGenerateDragPreview: ({ location, source, nativeSetDragImage }) => {
                    const rect = source.element.getBoundingClientRect();

                    setCustomNativeDragPreview({
                        nativeSetDragImage,
                        getOffset: preserveOffsetOnSource({
                            element: el,
                            input: location.current.input,
                        }),
                        render({ container }) {
                            setState({ type: "preview", container, rect });
                            return () => setState(draggingState);
                        },
                    });
                },
                onDragStart: () => setState(draggingState),
                onDrop: () => setState(idleState),
            })
        );
    }, []);

    return (
        <div className={`flex max-w-[145px] cursor-pointer ${state.type === "dragging" ? "opacity-40" : ""}`} ref={ref}>
            <PlatePrimitive car={car} />
            {state.type === "preview" && createPortal(<PlatePreview rect={state.rect} car={car} />, state.container)}
        </div>
    );
}

const PlatePreview = ({ rect, car }) => {
    return (
        <div
            className="flex max-w-[145px]"
            style={{
                width: `${rect.width}px`,
                height: `${rect.height}px`,
            }}
        >
            <PlatePrimitive car={car} />
        </div>
    );
};
