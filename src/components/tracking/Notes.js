import { Check, Pencil, Plus } from "lucide-react";
import { useRef, useState } from "react";
import NoteItems from "./NoteItem";
import { useOnClickOutside } from "usehooks-ts";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";

export default function Notes({ notes, filterByNote, currentNoteId, currentClass }) {
    const addRef = useRef();
    const [isAdding, setIsAdding] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [textareaValue, setTextareaValue] = useState("");

    const handleClickOutside = (event) => {
        if (textareaValue !== "") {
            console.log(textareaValue);
            AddNote();
        }
        setTextareaValue("");
        setIsAdding(false);
    };

    const handleAddNote = () => {
        if (textareaValue !== "") {
            console.log("Add note");
            AddNote();
        }
        setTextareaValue("");
        setIsAdding(false);
    };

    const AddNote = async () => {
        const NoteRef = collection(db, "notes");
        try {
            await addDoc(NoteRef, {
                cars: [],
                content: textareaValue,
                createdAt: serverTimestamp(),
                note_class: currentClass,
            });
            console.log("Note added to Firestore");
        } catch (error) {
            console.error("Error adding note: ", error);
        }
    };

    useOnClickOutside(addRef, handleClickOutside);

    return (
        <div className="w-full h-[30%] bg-[#EFEAE6] px-2 flex flex-col text-ellipsis relative text-[14px] font-semibold rounded-md scrollbar-hidden">
            <div className="flex p-[6px] justify-between">
                <span className="text-lg">Ghi Chú</span>
                <div className="flex items-center gap-3">
                    <div
                        className="cursor-pointer w-[22px] h-[22px] bg-[#111111]/[.1] rounded-full transition duration-75 hover:bg-[#2E282A] hover:text-white"
                        onClick={() => setIsAdding(!isAdding)}
                    >
                        <Plus className="w-full h-full" />
                    </div>
                    <div className="w-[20px] h-[20px] cursor-pointer hover:text-[#EF9995] rounded relative" onClick={() => setEditMode(!editMode)}>
                        {editMode ? <Check className="w-full h-full" /> : <Pencil className="w-full h-full" />}
                    </div>
                </div>
            </div>
            {isAdding && (
                <form className="block mt-0" ref={addRef}>
                    <textarea
                        className="min-h-[36px] max-h-[100px] m-0 py-[8px] mb-1 px-[12px] w-full overflow-hidden border-none rounded bg-white shadow resize-none break outline-none"
                        style={{ height: "30px" }}
                        placeholder="Nhập nội dung"
                        value={textareaValue}
                        onChange={(e) => {
                            setTextareaValue(e.target.value);
                            e.target.style.height = "30px";
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && isAdding) {
                                e.preventDefault(); // Prevents the default behavior of adding a new line
                                handleAddNote(); // Calls the function to add the note
                            }
                        }}
                    />
                </form>
            )}
            <ul className="overflow-y-scroll h-full scrollbar-hidden">
                {notes.length > 0 &&
                    notes
                        .slice()
                        .reverse()
                        .map((note) => {
                            return (
                                <li className="relative">
                                    <NoteItems
                                        note={note}
                                        editMode={editMode}
                                        setEditMode={setEditMode}
                                        filterByNote={filterByNote}
                                        currentNoteId={currentNoteId}
                                    />
                                </li>
                            );
                        })}
            </ul>
        </div>
    );
}
