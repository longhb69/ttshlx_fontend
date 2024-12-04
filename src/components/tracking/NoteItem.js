import { Ellipsis, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useOnClickOutside } from "usehooks-ts";

export default function NoteItems({ note, editMode, setEditMode, filterByNote, currentNoteId }) {
    const [isOption, setIsOption] = useState(false);
    const optionRef = useRef();

    const handleDelete = async () => {
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
            className={`${
                note.id === currentNoteId ? "bg-[#2E282A] text-white" : "bg-[#111111]/[.1] hover:bg-transparent"
            } flex justify-between items-center bg-[#111111]/[.1] mb-2  cursor-pointer p-1 rounded-md relative`}
        >
            <div>{note.content}</div>
            {editMode ? (
                <div className="w-[12%] h-[12%] relative" ref={optionRef}>
                    <Ellipsis className="w-full h-full" onClick={() => setIsOption(!isOption)} />
                    {isOption ? (
                        <div className="absolute bg-white border text-sm rounded z-[100] shadow-lg top-full p-2 -right-8 option-container">
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
