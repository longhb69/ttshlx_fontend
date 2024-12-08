import { Ellipsis, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { deleteDoc, doc, updateDoc,arrayUnion } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useOnClickOutside } from "usehooks-ts";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

export default function NoteItems({ note, editMode, setEditMode, filterByNote, currentNoteId }) {
    const idle = { type: "idle" };
    const isCarOver = { type: "is-car-over" };
    const [isOption, setIsOption] = useState(false);
    const [colState, setColState] = useState(idle);
    const optionRef = useRef();
    const ref = useRef()

    useEffect(() => {
        if(!ref.current) return;

        return combine(
            dropTargetForElements({
                element: ref.current,
                onDragEnter: () => {
                    setColState(isCarOver) 
                    console.log("Car enter")
                },
                onDragLeave: () => setColState(idle),
                onDragStart: () => setColState(isCarOver),
                onDrop: ({ source, self }) => {
                    //self.data.id get this columnRef id
                    setColState(idle);
                    console.log(source.data);
                    AddCarToNote(source.data.car.plate)
                },
            })
        )

    }, [])

    const AddCarToNote = async(plate) => {
        try {
            const docRef = doc(db, "notes", note.id)
            await updateDoc(docRef, {
                cars: arrayUnion(plate)
            })
        } catch (error) {
            console.error("Error adding car to note:", error);
        }
    }

    const handleDelete = async () => {
        setIsOption(false)
        try {
            await deleteDoc(doc(db, "notes", note.id));
            console.log("Document successfully deleted!");
        } catch (error) {
            console.error("Error removing document: ", error);
        }
    };

    const handleClickOutside = (event) => {
        setIsOption(false);
    };

    useOnClickOutside(optionRef, handleClickOutside);

    return (
        <div
            onClick={() => {
                if (!editMode) filterByNote(note.id);
            }}
            ref={ref}
            className={`${note.id === currentNoteId ? "bg-[#EEAF3A]  text-white" : "bg-[#414954] text-slate-200 hover:bg-[#111111]/[.8] static"} 
                ${colState.type === "is-car-over" ? "border-red-400" : "border-transparent"}
                flex justify-between items-center bg-[#111111]/[.1] mb-2 border-2  cursor-pointer p-1 rounded-md select-none relative`
            }
        >
            <div>{note.content}</div>
            {editMode ? (
                <div className="w-[25px] h-[25px] relative" ref={optionRef}>
                    <Ellipsis className="w-full h-full" onClick={() => setIsOption(!isOption)} />
                    {isOption ? (
                        <div className="absolute bg-white border text-sm rounded z-[9999999] shadow-lg top-full p-2 -right-1 option-container">
                            <div className="hover:bg-[#111111]/[.1] text-slate-800 p-2 rounded flex items-center" onClick={() => handleDelete()}>
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
            ) : null}
        </div>
    );
}
