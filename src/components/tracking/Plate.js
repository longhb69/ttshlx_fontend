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

const PlatePrimitive = ({ car, courseColorMap }) => {
    const { plate, expiry_date, owner_name, car_class, available_slot, current_slot, courses } = car;
    const [isOption, setIsOption] = useState(false);
    const optionRef = useRef(null);
    const [editTrigger, setEditTrigger] = useState(false);
    const [isExpired, setIsExpired] = useState(expiry_date.seconds * 1000 < Date.now());

    
    const handleClickOutside = (event) => {
        if (optionRef.current && !optionRef.current.contains(event.target)) {
            setIsOption(false);
        }
    };

    useOnClickOutside(optionRef, handleClickOutside);

 
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
 
    return (
        <>
        
            <div className="flex gap-2 items-center w-full">
                <div className="basis-[10%]">
                    <h2 className="text-[0.9rem] font-semibold ">{plate}</h2>
                </div>
                <div className="basis-[13%] flex gap-1 overflow-hidden wrap text-[0.8rem] font-semibold">
                    <p className="">
                        <span>
                            <User className="w-[15px] h-[15px]" />
                        </span>
                    </p>
                    <p>
                        {owner_name}
                    </p>
                </div>
                <div className="basis-[20%]">
                    <p className="text-[0.8rem] flex  items-center gap-1 ">
                        <span className={isExpired ? "text-red-500" : ""}>
                            {/* <CalendarClock className="w-[16px] h-[16px]" /> */}
                            <span>Ngày hết đăng kiểm: </span>
                        </span>
                        <span className={`${isExpired ? "text-red-500" : ""} font-semibold`}>{formatFirebaseTimestamp(expiry_date.seconds)}</span>
                    </p>
                </div>
                <div className="basis-[5%] text-[0.8rem] ">
                    <p>
                        Hạng: <span className="font-semibold">{car_class}</span>
                    </p>
                </div>
                <div className="basis-[10%] text-[0.8rem] ">
                    <p>
                        Số học viên: <span className="font-semibold">{current_slot}</span>
                    </p>
                </div>
                <div className={`flex gap-x-2 text-[0.8rem] max-w-full mt-1 ${courses?.length > 0 ? "" : ""} basis-[35%]`}>
                    <div>Khoá học: </div>
                    <div className="flex flex-wrap gap-2">
                        {courses?.length > 0 &&
                            courses.map((course, index) => {
                                return (
                                    <Tag
                                        key={index}
                                        text={`${course.name}`}
                                        number_of_students={course.number_of_students}
                                        background={courseColorMap[course.name]}
                                    />
                                );
                            })}
                    </div>
                </div>
                {editTrigger ? <EditCarModal trigger={editTrigger} setTrigger={setEditTrigger} car={car} /> : null}
            </div>
            <div className="flex mr-6 items-center h-full justify-center cursor-pointer relative" onClick={() => setIsOption(!isOption)} ref={optionRef}>
                <Ellipsis />
                {isOption ? (
                    <div className="absolute select-none text-[0.7rem] bg-white border text-sm rounded z-[100] shadow-lg top-full -right-full p-1 w-[130px] option-container">
                        <div className="hover:bg-[#111111]/[.1] p-2 rounded flex items-center" onClick={() => handleEdit()}>
                            <span className="w-[18px] h-[18px] mr-2">
                                <Pencil className="w-full h-full" />
                            </span>
                            <span className="   text-[0.8rem] font-semibold">Chỉnh sửa</span>
                        </div>
                        <div className="hover:bg-[#111111]/[.1] p-2 rounded flex items-center " onClick={() => handleDelete()}>
                            <span className="w-[18px] h-[18px] mr-2">
                                <Trash2 className="w-full h-full" />
                            </span>
                            <div className="flex justify-start">
                                <span className="text-start text-[0.8rem] font-semibold">Xoá</span>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </>
    );
};

export default function Plate({ car, noteMode = false, currentNoteId, deleteFromNote , courseColorMap}) {
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


    if (!isVisible) return null;

    // const DeleteFromNote = async () => {
    //     setIsDeleting(true);
    //     const docRef = doc(db, "notes", currentNoteId);
    //     const docSnap = await getDoc(docRef);
    //     if (docSnap.exists()) {
    //         const updateCars = docSnap.data().cars.filter((c) => c !== car.plate);
    //         await updateDoc(docRef, {
    //             cars: updateCars,
    //         });
    //         setIsVisible(false);
            
    //     }
    // };


    return (
        <li className={`flex w-full cursor-auto ${state.type === "dragging" ? "opacity-40" : ""} ${isDeleting ? "fade-out" : ""}`}>
            {noteMode ? (
                <div
                    ref={deleteHoverRef}
                    className="flex items-center justify-center bg-red-400 mt-2 p-1 mr-1 cursor-pointer rounded relative hover:bg-red-500"
                    onClick={() => deleteFromNote(car.plate)}
                >
                    <span className="flex items-center w-[11px] h-[15px]">
                        <X />
                    </span>
                    {isHover ? <div className="absolute text-[0.7rem] bg-white rounded w-[50px] z-[9] top-full">Xóa khỏi ghi chú</div> : null}
                </div>
            ) : null}
            <div className="border mt-1.5 gap-2 flex items-center transition-colors duration-75 hover:bg-[#111111]/[.1]  border-[#2E282A] text-[#282425] rounded-lg shadow p-1 w-full">
                <DragHandleButton ref={mergeRefs([dragHandleRef, ref])} />
                <PlatePrimitive car={car} courseColorMap={courseColorMap}/>
                {state.type === "preview" && createPortal(<PlatePreview rect={state.rect} car={car} />, state.container)}
            </div>
        </li>
    );
}

const PlatePreview = ({ rect, car }) => {
    return (
        <div className="border mt-2 flex gap-4 items-center overflow-hidden border-[#2E282A] text-white rounded-lg shadow-lg p-2 bg-[#3F0037] w-[200px] h-full">
            <h2 className="font-semibold text-[0.9rem]">{car.plate}</h2>
            <div className="">{car.owner_name}</div>
        </div>
    );
};
