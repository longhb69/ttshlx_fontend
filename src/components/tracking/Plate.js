import { useEffect, useRef, useState } from "react";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview";
import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source";
import { DragHandleButton } from "@atlaskit/pragmatic-drag-and-drop-react-accessibility/drag-handle-button";
import mergeRefs from "@atlaskit/ds-lib/merge-refs";
import { Ellipsis, Pencil, Trash2, X } from "lucide-react";
import Tag from "./Tag";
import { createPortal } from "react-dom";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { CalendarClock, User } from "lucide-react";
import { db } from "../../config/firebase";
import { doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { useOnClickOutside } from "usehooks-ts";
import EditCarModal from "../modal/EditCarModal.tsx";
import { useHover } from "usehooks-ts";

const colors = ["#EF9995", "#A4CBB4", "#DC8850", "#D97706"];

const idleState = { type: "idle" };
const draggingState = { type: "dragging" };

const PlatePrimitive = ({ car }) => {
    const { plate, expiry_date, owner_name, car_class, available_slot, current_slot, courses } = car;
    const [isOption, setIsOption] = useState(false);
    const optionRef = useRef(null);
    const [editTrigger, setEditTrigger] = useState(false);
    const [isExpired, setIsExpired] = useState(expiry_date.seconds * 1000 < Date.now());

    //to do delete in course also
    const handleDelete = async () => {
        try {
            const DocRef = doc(db, "cars", plate);
            await deleteDoc(DocRef);
            setIsOption(false);
            console.log("Document successfully deleted");
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const handleEdit = () => {
        setEditTrigger(true);
    };

    const handleClickOutside = (event) => {
        if (optionRef.current && !optionRef.current.contains(event.target)) {
            setIsOption(false);
        }
    };

    useOnClickOutside(optionRef, handleClickOutside);

    return (
        <>
            <h2 className="text-[0.9rem] font-semibold w-[10%]">{plate}</h2>
            <p className="text-[0.8rem] flex flex-col items-center gap-1 w-[25%]">
                <span className={isExpired ? "text-red-500" : ""}>
                    {/* <CalendarClock className="w-[16px] h-[16px]" /> */}
                    <span>Ngày hết đăng kiểm: </span>
                </span>
                <span className={isExpired ? "text-red-500" : ""}>{formatFirebaseTimestamp(expiry_date.seconds)}</span>
            </p>
            <p className="text-[0.8rem] flex gap-1 items-center overflow-hidden wrap w-[10%]">
                <span>
                    <User className="w-[15px] h-[15px]" />
                </span>
                {owner_name}
            </p>
            <div className="text-[0.8rem] w-[5%]">
                <p>
                    Hạng: <span className="font-semibold">{car_class}</span>
                </p>
            </div>
            <div className="text-[0.8rem] w-[10%]">
                <p>
                    Số học viên: <span className="font-semibold">{current_slot}</span>
                </p>
            </div>
            <div className={`flex gap-x-2 text-[0.8rem] max-w-full mt-1 ${courses?.length > 0 ? "" : ""} w-[30%]`}>
                <div>Khoá học: </div>
                <div className="flex gap-2">
                    {courses?.length > 0 &&
                        courses.map((course, index) => {
                            return (
                                <Tag
                                    key={index}
                                    text={`${course.name}`}
                                    number_of_students={course.number_of_students}
                                    background={colors[index % colors.length]}
                                />
                            );
                        })}
                </div>
            </div>
            <div className="flex items-center h-full justify-center cursor-pointer relative" onClick={() => setIsOption(!isOption)} ref={optionRef}>
                <Ellipsis />
                {isOption ? (
                    <div className="absolute bg-white border text-sm rounded z-[100] shadow-lg top-full p-2 w-[140px] option-container">
                        <div className="hover:bg-[#111111]/[.1] p-2 rounded flex items-center" onClick={() => handleEdit()}>
                            <span className="w-[20px] h-[20px] mr-5">
                                <Pencil className="w-full h-full" />
                            </span>
                            <span className="font-semibold">Chỉnh sửa</span>
                        </div>
                        <div className="hover:bg-[#111111]/[.1] p-2 rounded flex items-center " onClick={() => handleDelete()}>
                            <span className="w-[20px] h-[20px] mr-5">
                                <Trash2 className="w-full h-full" />
                            </span>
                            <div className="flex justify-start">
                                <span className="text-start font-semibold">Xoá</span>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
            {editTrigger ? <EditCarModal trigger={editTrigger} setTrigger={setEditTrigger} car={car} /> : null}
        </>
    );
};

export default function Plate({ car, noteMode = false, currentNoteId }) {
    const ref = useRef(null);
    const dragHandleRef = useRef(null);
    const [state, setState] = useState(idleState);
    const deleteHoverRef = useRef(null);
    const isHover = useHover(deleteHoverRef);
    const [isVisible, setIsVisible] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!dragHandleRef) return;

        return combine(
            draggable({
                element: el,
                dragHandle: dragHandleRef.current,
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
                onDrop: ({ source }) => {
                    setState(idleState);
                },
            })
        );
    }, [car]);

    const DeleteFromNote = async () => {
        setIsDeleting(true);
        const docRef = doc(db, "notes", currentNoteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            console.log(docSnap.data());
            const updateCars = docSnap.data().cars.filter((c) => c !== car.plate);
            await updateDoc(docRef, {
                cars: updateCars,
            });
            setIsVisible(false);
        }
    };

    useEffect(() => {
        console.log(noteMode);
    }, []);

    if (!isVisible) return null;

    return (
        <li className={`flex w-full cursor-auto ${state.type === "dragging" ? "opacity-40" : ""} ${isDeleting ? "fade-out" : ""}`}>
            {noteMode ? (
                <div
                    ref={deleteHoverRef}
                    className="flex items-center justify-center bg-red-400 mt-2 p-1 mr-1 cursor-pointer rounded relative hover:bg-red-500"
                    onClick={() => DeleteFromNote()}
                >
                    <span className="flex items-center w-[11px] h-[15px]">
                        <X />
                    </span>
                    {isHover ? <div className="absolute text-[0.7rem] bg-white rounded w-[50px] z-[9] top-full">Xóa khỏi ghi chú</div> : null}
                </div>
            ) : null}
            <div className="border mt-2 flex gap-2 items-center transition-colors duration-75 hover:bg-[#111111]/[.1]  border-[#2E282A] text-[#282425] rounded-lg shadow p-2 bg-[#E4D8B4] w-full">
                <DragHandleButton ref={mergeRefs([dragHandleRef, ref])} />
                <PlatePrimitive car={car} />
                {state.type === "preview" && createPortal(<PlatePreview rect={state.rect} car={car} />, state.container)}
            </div>
        </li>
    );
}

const PlatePreview = ({ rect, car }) => {
    return (
        <div className="border mt-2 flex gap-4 items-center overflow-hidden border-[#2E282A] text-[#282425] rounded-lg shadow-lg p-2 bg-[#E4D8B4] w-[200px] h-full">
            <h2 className="font-semibold text-[0.9rem]">{car.plate}</h2>
            <div className="">{car.owner_name}</div>
        </div>
    );
};
