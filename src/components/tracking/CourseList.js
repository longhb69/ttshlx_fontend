import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
import { MoveRight } from "lucide-react";
import {doc, updateDoc} from 'firebase/firestore'
import {db} from "../../config/firebase"

const idle = { type: "idle" };
const isCarOver = { type: "is-car-over" };

export default function CourseList({ course }) {
    const { id, state, start_date, end_date, cars } = course;
    const columnRef = useRef(null);
    const [colState, setColState] = useState(idle);

    useEffect(() => {
        if (!columnRef.current) return;

        return combine(
            dropTargetForElements({
                element: columnRef.current,
                onDragEnter: () => setColState(isCarOver),
                onDragLeave: () => setColState(idle),
                onDragStart: () => setColState(isCarOver),
                onDrop: ({ source, self }) => {
                    //self.data.id get this columnRef id
                    setColState(idle);
                    console.log(source.data);
                    AddCarToCourse(source.data.car.plate)
                },
            })
        );
    }, []);

    const AddCarToCourse = async (plate, number_of_students = 8, note = "") => {
        try {
            const courseDocRef = doc(db, 'courses', id)
            await updateDoc(courseDocRef, {
                [`cars.${plate}`] : {
                    note: note,
                    number_of_students: number_of_students
                },
            })
        } catch(error) {
            console.error('Error updating document:', error);
        }
    } 

    useEffect(() => {
        console.log("drag over", id);
    }, [colState]);

    return (
        <div className={`border-2 rounded-xl ${colState.type === "is-car-over" ? "border-[#4B0082]" : "border-transparent"}`}>
            <div
                className={`flex flex-col relate border-box md:w-[200px] lg:w-[280px] max-h-full pb-[8px] rounded-xl bg-[#F1F2F4] align-top whitespace-normal scroll-m-[8px]`}
                ref={columnRef}
            >
                <div className="flex relative grow flex-wrap items-start justify-between px-[8px] pt-[8px]">
                    <div className="relative  flex items-start grow pt-[8px] px-[8px] shrink min-h-[35px] text-[#172b4d]">
                        <h2 className="block px-[6px] pr-[8px] bg-transparent text-[25px] font-semibold whitespace-normal leading-5">{id}</h2>
                    </div>
                    <div className="inline-block text-base pt-[3px] pr-[8px]">
                        <div className="bg-green-300 text-green-800 px-2 py-1 rounded-full">{state}</div>
                    </div>
                    <div className="w-[15px] h-[15px] mt-[10px] cursor-pointer">
                        <Pencil className="w-full h-full" />
                    </div>
                    <div className="mx-auto mt-5 flex items-center gap-2">
                        <div>{formatFirebaseTimestamp(start_date.seconds)}</div>
                        <div>
                            <MoveRight />
                        </div>
                        <div>{formatFirebaseTimestamp(end_date.seconds)}</div>
                    </div>
                </div>
                <div>
                    {Object.entries(cars).map(([key, value]) => (
                        <div className="flex gap-5">
                            <div>{key}</div>
                            <div></div>
                            <div>{value.number_of_students} hv</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
