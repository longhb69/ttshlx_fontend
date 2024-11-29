import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
import { MoveRight } from "lucide-react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { arrayUnion } from "firebase/firestore/lite";
import ProgressBar from "@atlaskit/progress-bar";
import Button from "@atlaskit/button/new";
import CourseModal from "../modal/CourseModal";

const idle = { type: "idle" };
const isCarOver = { type: "is-car-over" };

const encodeKey = (key) => key.replace(/\./g, "_DOT_");
const decodeKey = (key) => key.replace(/_DOT_/g, ".");

export default function CourseList({ course }) {
    const { id, state, start_date, end_date, cars } = course;
    const [isModalOpen, setIsModalOpen] = useState(false);
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
                        updateCarSlot(source.data.car.plate, 1, source.data.car.current_slot, source.data.car.available_slot);
                    });
                },
            })
        );
    }, []);

    const AddCarToCourse = async (plate, number_of_students = 1, note = "") => {
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

                const newCourseData = { name: id, number_of_students: number_of_students };
                let updatedCourses;
                let existingIndex;

                if (currentCourses.length === 0) {
                    updatedCourses = [...currentCourses, newCourseData];
                } else {
                    console.log("current course is not emty")
                    existingIndex = currentCourses.findIndex(course => course.name === id);
                    if(existingIndex === 1) return

                    
                    updatedCourses = [...currentCourses, newCourseData];
                    console.log("Added new course");
                }

                await updateDoc(carDocRef, {
                    courses: updatedCourses,
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
            console.log("new slot", newSlotNumber)
            const carDocRef = doc(db, "cars", plate);
            await updateDoc(carDocRef, {
                current_slot: newSlotNumber,
            });
        } catch (error) {
            console.error("Error updating document:", error);
        }
    };

    const calculateProcess = () => {
        const currentTimestamp = Date.now();
        const startTimestamp = start_date.seconds * 1000;
        const endTimestamp = end_date.seconds * 1000;

        const totalDuration = endTimestamp - startTimestamp;
        const elapsedTime = currentTimestamp - startTimestamp;

        const progress = Math.max(0, Math.min(1, elapsedTime / totalDuration));
        return progress;
    };

    useEffect(() => {
        //console.log("drag over", id);
    }, [colState]);

    return (
        <div className={`border-2 rounded-xl h-full ${colState.type === "is-car-over" ? "border-[#4B0082]" : "border-transparent"}`}>
            <div
                className={`flex flex-col h-full relate border-box w-[250px] max-h-[100%] pb-[8px] rounded-xl bg-[#FAF7F5] align-top whitespace-normal scroll-m-[8px]`}
                ref={columnRef}
            >
                <div className="flex relative justify-around  flex-wrap items-start px-[8px] pt-[8px]">
                    <div className="relative  flex items-start grow pt-[8px] px-[8px] shrink min-h-[35px] text-[#172b4d]">
                        <h2 className="block px-[6px] pr-[8px] bg-transparent text-[22px] font-semibold whitespace-normal leading-5">{id}</h2>
                    </div>
                    <div className="inline-block text-base pt-[3px] pr-[8px]">
                        <div className="bg-green-300 text-green-800 px-2 py-1 rounded-full">{state}</div>
                    </div>
                    {/* <div className="w-[15px] h-[15px] mt-[10px] cursor-pointer">
                        <Pencil className="w-full h-full" />
                    </div> */}
                    <div className="mx-auto mt-5 flex flex-col items-center gap-2">
                        <div className="flex gap-2">
                            <div>{formatFirebaseTimestamp(start_date.seconds)}</div>
                            <div>
                                <MoveRight />
                            </div>
                            <div>{formatFirebaseTimestamp(end_date.seconds)}</div>
                        </div>
                        <div className={`w-[90%] h-[10px] ${calculateProcess() !== 1 ? "force-bar-color" : "force-bar-complete"}`}>
                            <ProgressBar value={calculateProcess()} />
                        </div>
                    </div>
                    <div className="w-full flex items-center justify-center mt-2">
                        <div>
                            <Button onClick={() => setIsModalOpen(true)}>Search</Button>
                            <Button>Edit</Button>
                        </div>
                    </div>
                </div>
            </div>
            <CourseModal course={course} trigger={isModalOpen} setTrigger={setIsModalOpen}/>
        </div>
    );
}
