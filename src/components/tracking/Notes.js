import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import NoteItems from "./NoteItem";

export default function Notes({ notes, filterByNote, currentNoteId }) {
    const [editMode, setEditMode] = useState(false);
    const [isOption, setIsOption] = useState(false);

    return (
        <div className="w-[10%] bg-[#E4D8B4] p-2 text-ellipsis text-[14px] font-semibold rounded">
            <div className="flex p-[6px] justify-between mb-2">
                <span>Ghi Chú</span>
                <div className="flex items-center gap-3">
                    <div className="cursor-pointer w-[22px] h-[22px] bg-[#111111]/[.1] rounded-full transition duration-75 hover:bg-[#2E282A] hover:text-white">
                        <Plus className="w-full h-full" />
                    </div>
                    <div className="w-[20px] h-[20px] cursor-pointer hover:text-[#EF9995] rounded relative" onClick={() => setEditMode(!editMode)}>
                        {editMode ? <Check className="w-full h-full" /> : <Pencil className="w-full h-full" />}
                    </div>
                </div>
            </div>
            {notes.map((note) => {
                return (
                    <NoteItems note={note} editMode={editMode} setEditMode={setEditMode} filterByNote={filterByNote} currentNoteId={currentNoteId} />
                );
            })}
        </div>
    );
}
