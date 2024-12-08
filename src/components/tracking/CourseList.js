import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState, useMemo, useCallback } from "react";
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

export default function CourseList({ course, currentCars }) {
    const { id, state, start_date, end_date } = course;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const columnRef = useRef(null);
    const [colState, setColState] = useState(idle);
    const [carSlot, setCarSlot] = useState(null);
    const [carCount, setCarCount] = useState(0)

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
                    const result = AddCarToCourse(source.data.car.plate).then((response) => {
                        if(response.status === 200)
                        updateCarSlot(source.data.car.plate, 1, source.data.car.current_slot);
                    });
                },
            })
        );
    }, []);

    useEffect(() => {
        let count = 0
        Object.entries(course.cars).forEach(([key, value]) => {
            count += Number(value.number_of_students)
        })
        setCarCount(count)
    }, [course])

    const AddCarToCourse = useCallback(
        async (plate, number_of_students = 1, note = "") => {
            try {
                const courseDocRef = doc(db, "courses", id);
                const carDocRef = doc(db, "cars", plate);
                const carDocSnap = await getDoc(carDocRef);
                const courseDocSnap = await getDoc(courseDocRef);

                await updateDoc(courseDocRef, {
                    [`cars.${encodeKey(plate)}`]: {
                        note: note,
                        number_of_students: number_of_students,
                    },
                });

                if (!carDocSnap.exists()) {
                    console.error("Document does not exist!");
                    return
                } 

                const carData = carDocSnap.data()
                const currentCarCourse = carData.courses || [];
                const newCourseData = { name: id, number_of_students: number_of_students };
                let updatedCourses;
                let existingIndex;

                if(currentCarCourse.length === 0) {
                    console.log("car have no course")
                    updatedCourses = [newCourseData]
                }
                else {
                    console.log("Car already have some course")
                    existingIndex = currentCarCourse.findIndex((course) => course.name === id);
                    console.log("check", existingIndex);
                    if (existingIndex !== -1) return {status: 400};

                    updatedCourses = [...currentCarCourse, newCourseData]
                }

                await updateDoc(carDocRef, {
                    courses: updatedCourses,
                });

                return {status: 200}
             
            } catch (error) {
                console.error("Error updating document:", error);
            }
        },
        [id]
    );

    const updateCarSlot = useCallback(async (plate, slot_number, current_slot) => {
        try {
            console.log(current_slot, slot_number);
            const newSlotNumber = (current_slot += slot_number);
            console.log("new slot", newSlotNumber);
            const carDocRef = doc(db, "cars", plate);
            await updateDoc(carDocRef, {
                current_slot: newSlotNumber,
            });
            return newSlotNumber;
        } catch (error) {
            console.error("Error updating document:", error);
        }
    }, []);

    const calculateProcess = () => {
        const currentTimestamp = Date.now();
        const startTimestamp = start_date.seconds * 1000;
        const endTimestamp = end_date.seconds * 1000;

        const totalDuration = endTimestamp - startTimestamp;
        const elapsedTime = currentTimestamp - startTimestamp;

        const progress = Math.max(0, Math.min(1, elapsedTime / totalDuration));
        return progress;
    };

    return (
        <div
            className={`border-2 rounded-xl w-full cursor-pointer ${colState.type === "is-car-over" ? "border-[#4B0082]" : "border-transparent"}`}
            onClick={() => setIsModalOpen(true)}
        >
            <div
                className={`flex flex-col h-full w-full relate border-box  max-h-[100%] pb-[8px] rounded-xl bg-white align-top whitespace-normal scroll-m-[8px]`}
                ref={columnRef}
            >
                <div className="flex relative justify-around  flex-wrap items-start px-[8px] pt-[8px]">
                    <div className="relative  flex items-start grow pt-[8px] px-[8px] shrink min-h-[35px] text-[#172b4d]">
                        <h2 className="block px-[6px] pr-[8px] bg-transparent text-[22px] font-semibold whitespace-normal leading-5">{id}</h2>
                    </div>
                    <div className="inline-block text-base pt-[3px] pr-[8px] relative">
                        <div className="bg-green-300 text-green-800 px-2 py-1 rounded-full">{state}</div>
                    </div>
                    {/* <div className="w-[15px] h-[15px] mt-[10px] cursor-pointer">
                        <Pencil className="w-full h-full" />
                    </div> */}
                    <div className="mx-auto mt-3 flex flex-col items-center gap-2">
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
                    <div className="mt-3 mb-3 w-full text-base flex justify-evenly items-center gap-2">
                        <div>
                            <span>Số xe: </span>
                            <span>{Object.keys(course.cars).length}</span>
                        </div>
                        <div>
                            <span>Số học viên: </span>
                            <span>{carCount}</span>
                        </div>
                    </div>
                    {/* <div className="w-full flex items-center justify-center mt-2 p-[8px]">
                        {/* {colState.type === "is-car-over" ? <div className="bg-slate-300 w-[70%] rounded h-[30px]"></div> : null} 
                        {carSlot != null ? (
                            <div className="flex gap-2">
                                <span>{carSlot.plate}</span>
                                <span>{carSlot.current_slot}</span>
                            </div>
                        ) : null} 
                    </div>
                    */}
                </div>
            </div>
            {/* <CourseModal course={course} trigger={isModalOpen} setTrigger={setIsModalOpen} /> */}
        </div>
    );
}
