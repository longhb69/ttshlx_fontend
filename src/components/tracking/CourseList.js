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
import CourseModal from "../modal/CourseModal";
import useCarCourse from "../../hooks/useCarCourse";

const idle = { type: "idle" };
const isCarOver = { type: "is-car-over" };

const encodeKey = (key) => key.replace(/\./g, "_DOT_");
const decodeKey = (key) => key.replace(/_DOT_/g, ".");

const stateColors = {
    "Chưa bắt đầu": "bg-gray-300 text-gray-800",
    "Đang thực hiện": "bg-yellow-300 text-yellow-800",
    "Tiếp tục": "bg-blue-300 text-blue-800",
    "Đã hoàn thành": "bg-green-300 text-green-800",
};

export default function CourseList({ course, currentCars, setCourseFocus, currentCourseFocusId, setCurrentCourseFocusId, fullCarMode, setFullCarMode }) {
    const { id, state, start_date, end_date } = course;
    //const [isModalOpen, setIsModalOpen] = useState(false);
    const columnRef = useRef(null);
    const [colState, setColState] = useState(idle);
    const [carSlot, setCarSlot] = useState(null);
    const [carCount, setCarCount] = useState(0)
    const { AddCarToCourse, updateCarSlot } = useCarCourse(id);

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
                    handleAddCar(source.data.car.plate, source.data.car.current_slot)
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

    useEffect(() => {
        if(currentCourseFocusId === id && !fullCarMode) 
            setCourseFocus(course)
    }, [course])

     const handleAddCar = async (plate, current_slot) => {
        const response = await AddCarToCourse(plate);
        if (response?.status === 200) {
            updateCarSlot(plate, 1, current_slot);
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

    const handleFocus = () => {
        setFullCarMode(false)
        setCourseFocus(course)
        setCurrentCourseFocusId(id)
    }

    return (
        <div
            className={`border-2 rounded-xl w-full cursor-pointer ${colState.type === "is-car-over" ? "border-[#4B0082]" : "border-transparent"}`}
            onClick={() => handleFocus(course)}
        >
            <div
                className={`flex flex-col h-full w-full relate border-box  max-h-[100%] rounded-xl bg-white hover:bg-[#DCDDDF] align-top whitespace-normal scroll-m-[8px]`}
                ref={columnRef}
            >
                <div className="flex relative justify-around  flex-wrap items-start pt-[8px]">
                    <div className="relative  flex items-start grow pt-[7px] px-[8px] shrink min-h-[35px] text-[#172b4d]">
                        <h2 className="block px-[6px] pr-[8px] bg-transparent text-xl font-semibold whitespace-normal leading-5">{id}</h2>
                    </div>
                    <div className="inline-block text-sm font-semibold pt-[3px] pr-[8px] relative">
                        <div className={`px-4 py-1 rounded-full ${stateColors[state] || "bg-gray-300 text-gray-800"}`}>{state}</div>
                    </div>
                    {/* <div className="w-[15px] h-[15px] mt-[10px] cursor-pointer">
                        <Pencil className="w-full h-full" />
                    </div> */}
                    <div className="mx-auto mt-3 flex flex-col items-center gap-2">
                        <div className="flex items-center font-semibold gap-2 text-sm">
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
                    <div className="mt-3 mb-3 w-full text-sm flex justify-evenly items-center gap-2">
                        <div>
                            <span>Số xe: </span>
                            <span className="font-semibold">{Object.keys(course.cars).length}</span>
                        </div>
                        <div>
                            <span>Số học viên: </span>
                            <span className="font-semibold">{carCount}</span>
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
