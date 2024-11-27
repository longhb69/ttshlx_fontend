import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
import { MoveRight } from "lucide-react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { arrayUnion } from "firebase/firestore/lite";

const idle = { type: "idle" };
const isCarOver = { type: "is-car-over" };

const encodeKey = (key) => key.replace(/\./g, "_DOT_");
const decodeKey = (key) => key.replace(/_DOT_/g, ".");

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
                    AddCarToCourse(source.data.car.plate).then(() => {
                        console.log("update car");
                        updateCarSlot(source.data.car.plate, 8, source.data.car.current_slot, source.data.car.available_slot);
                    });
                },
            })
        );
    }, []);

    const AddCarToCourse = async (plate, number_of_students = 8, note = "") => {
        try {
            const courseDocRef = doc(db, "courses", id);
            const carDocRef = doc(db, "cars", plate);
            const carDocSnap = await getDoc(carDocRef);

            await updateDoc(courseDocRef, {
                [`cars.${encodeKey(plate)}`]: {
                    note: note,
                    number_of_students: number_of_students,
                },
            });

            if (carDocSnap.exists()) {
                const carData = carDocSnap.data();
                const currentCourses = carData.courses || []; 

                console.log("Current Courses:", currentCourses);

                const updatedCourses = [...currentCourses, ...[id]]; 
                const uniqueCourses = [...new Set(updatedCourses)]; 

                console.log("Updated Courses:", uniqueCourses);

            await updateDoc(carDocRef, {
                courses: uniqueCourses,
            });

                console.log("Courses updated successfully!");
            } else {
                console.error("Document does not exist!");
            }
        } catch (error) {
            console.error("Error updating document:", error);
        }
    };

    const updateCarSlot = async (plate, slot_number, current_slot, available_slot) => {
        try {
            const newSlotNumber = (current_slot += slot_number);
            const carDocRef = doc(db, "cars", plate);
            await updateDoc(carDocRef, {
                current_slot: newSlotNumber <= available_slot ? newSlotNumber : available_slot,
            });
        } catch (error) {
            console.error("Error updating document:", error);
        }
    };

    useEffect(() => {
        //console.log("drag over", id);
    }, [colState]);

    return (
        <div className={`border-2 rounded-xl ${colState.type === "is-car-over" ? "border-[#4B0082]" : "border-transparent"}`}>
            <div
                className={`flex flex-col relate border-box md:w-[200px] lg:w-[280px] max-h-full pb-[8px] rounded-xl bg-[#FAF7F5] align-top whitespace-normal scroll-m-[8px]`}
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
                <div className="p-2">
                    <table className="min-w-full border-collapse bg-[#FAF7F5]">
                        <thead className="bg-[#002933] text-[11px] text-white">
                            <tr>
                                <th className="border px-1 py-0.5 text-center text-sm w-[40%]">Biển số</th>
                                <th className="border px-1 py-0.5 text-center text-sm w-[30%]">Học Viên</th>
                                <th className="border px-1 py-0.5 text-center text-sm">Note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(cars).map(([key, value]) => (
                                <tr className="hover:text-[#fe3e64] hover:border-[#fe3e64]" key={key}>
                                    <td className="text-[#808080]  px-2 pr-0.5 pl-0.1 text-left w-1/3">{decodeKey(key)}</td>
                                    <td className="text-[#808080] px-1 py-0.5 text-center w-1/4">{value.number_of_students}</td>
                                    <td className="text-[#808080] px-1 py-0.5 text-center">{value.note}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
