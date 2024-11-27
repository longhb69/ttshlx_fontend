import { useEffect, useRef, useState } from "react";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import Tag from "./Tag";
import { createPortal } from "react-dom";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { CalendarClock, User } from 'lucide-react';


const colors = ['#EF9995', '#A4CBB4', '#DC8850', '#D97706']

const idleState = { type: "idle" };
const draggingState = { type: "dragging" };

const PlatePrimitive = ({ car }) => {
    const { plate, expiry_date, owner_name, car_class, available_slot, current_slot, courses } = car;
    return (
        <div className="border border-[#2E282A] text-[#282425] rounded-lg shadow-lg p-3.5 bg-[#E4D8B4] min-w-[140px] max-w-[150px]">
            <h2 className="font-bold text-lg">{plate}</h2>
            <p className="text-sm flex gap-1"><span><CalendarClock className="w-[16px] h-[16px]"/></span> {formatFirebaseTimestamp(expiry_date.seconds)}</p>
            <p className="text-sm flex gap-1 overflow-hidden wrap">
                <span><User className="w-[15px] h-[15px]"/></span>{owner_name}
            </p>
            <p className="text-sm ">Hạng: <span className="font-semibold">{car_class}</span></p>
            <p className="text-sm">Số học viên: <span className="font-semibold">{current_slot}</span></p>
            <div className={`flex flex-wrap max-w-full mt-1 ${courses?.length > 0 ? 'border-t border-[#2E282A] pt-1' : ''}`}>
                {courses?.length > 0 && courses.map((course, index) => {
                    return <Tag key={index} text={`${course}`} background={colors[index % colors.length]} />;
                })}
            </div>
        </div>
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
                getInitialData: () => ({ car: car }),
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
                onDrop: ({source}) => {setState(idleState)},
            })
        );
    }, []);

    return (
        <li className={`flex max-w-[145px] cursor-pointer ${state.type === "dragging" ? "opacity-40" : ""}`} ref={ref}>
            <PlatePrimitive car={car} />
            {state.type === "preview" && createPortal(<PlatePreview rect={state.rect} car={car} />, state.container)}
        </li>
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
