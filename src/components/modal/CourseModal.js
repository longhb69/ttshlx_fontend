import Blanket from "@atlaskit/blanket";
import { X, Plus, Minus, Undo2, Trash2 } from "lucide-react";
import {useEffect, useRef, useState } from "react";
import formatFirebaseTimestampV2 from "../../utils/formatFirebaseTimestampV2";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
import { getFirestore, doc, increment, getDoc, updateDoc, deleteField, deleteDoc, Timestamp } from "firebase/firestore";
import Button from "../Button"
import CarItem from "../tracking/CarItem";
import Calendar from '@atlaskit/calendar';
import { useHover, useOnClickOutside } from "usehooks-ts";
import DeleteCourseModal from "./DeleteCourseModal";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import useCarCourse from "../../hooks/useCarCourse"
import loadingAnimation from "../../animation/loadingAnimation.json"
import Lottie from "lottie-react";

const decodeKey = (key) => key.replace(/_DOT_/g, ".");
const NUMBER_TO_INCREASE = 1;

const idle = { type: "idle" };
const isCarOver = { type: "is-car-over" };

export default function CourseModal(props) {
    const [isClosing, setIsClosing] = useState(false);
    const [optionSate, setOptionState] = useState(false);
    const [saveChange, setSaveChange] = useState(false)
    const [updateQueue, setUpdateQueue] = useState({})
    const [triggerUndo, setTriggerUndo] = useState(false)
    const [courseState, setCourseState] = useState(props.course.state)
    const [editStartDate, setEditStartDate] = useState(false)
    const [editEndDate, setEditEndDate] = useState(false)
    const [isDelete, setIsDelete] = useState(false)
    const [colState, setColState] = useState(idle);

    const courseRef = useRef()
    const deleteHover = useRef()
    const isDeleteHover = useHover(deleteHover)
    const ref = useRef()

    const handleClickOutside = () => {
        setEditEndDate(false)
        setEditStartDate(false)
    }


    useOnClickOutside(ref, handleClickOutside)

    const db = getFirestore();
    const docRef = doc(db, "courses", props.course.id);
    const { AddCarToCourse, updateCarSlot } = useCarCourse(props.course.id);

    //lister to any update that happen in date, state
    const [stateChange, setStateChange] = useState(false)

    const stateColors = {
        "Chưa bắt đầu": "bg-gray-300 text-gray-800",
        "Đang thực hiện": "bg-yellow-300 text-yellow-800",
        "Tiếp tục": "bg-blue-300 text-blue-800",
        "Đã hoàn thành": "bg-green-300 text-green-800",
    };

    const handleClose = () => {
        // setIsClosing(true);
        // setSaveChange(false)
        // setUpdateQueue({})
        // setTimeout(() => {
        //     props.setTrigger(false);
        //     setIsClosing(false);
        // }, 200);
        props.setFullCarMode(true)
        props.setCourseFocus(null)
    };

    const handleUpdate = async () => {
        props.setLoading(true)
        if(stateChange) {
            await updateDoc(docRef, {
                state: courseState
            })
            setStateChange(false)
        }
        for(const [key, value] of Object.entries(updateQueue)) {
            const CarDocRef = doc(db, "cars", decodeKey(key))
            const CarDocSnap = await getDoc(CarDocRef)
            const carData = CarDocSnap.data()
            const courses = carData.courses || []

            if(value <= 0) {
                let deleteNumber = 0
                const updatedCourses = courses.filter((course) => {
                    if(course.name === props.course.id) {
                        deleteNumber = course.number_of_students
                        return false
                    } 
                    else {
                        return true
                    }
                })
                await updateDoc(CarDocRef, {current_slot: increment(-deleteNumber), courses: updatedCourses})
                await updateDoc(docRef, {
                    [`cars.${key}`]: deleteField(),
                });
                console.log(`Key "${decodeKey(key)}" removed successfully!`);
                setUpdateQueue({})
                setSaveChange(false)
                continue
            }
            try {
                const CarDocSnap = await getDoc(CarDocRef)

                if(CarDocSnap.exists()) {
                    let updateCurrentSlot = 0
                    const updatedCourses = courses.map((course) => {
                        if(course.name === props.course.id) {
                            updateCurrentSlot += value
                            return {
                                ...course,
                                number_of_students: value
                            }
                        } else {
                            updateCurrentSlot += course.number_of_students
                            return course
                        }
                    })

                    await updateDoc(CarDocRef, { current_slot: updateCurrentSlot, courses: updatedCourses})
                    await updateDoc(docRef, {
                        [`cars.${key}.number_of_students`] : value
                    })
                    console.log(`Updated number_of_students for course: ${decodeKey(key)}`);
                    
                }

            } catch (error) {
                console.log("Document does not exist!");
            }
        }
        //clost at the end
        setUpdateQueue({})
        setSaveChange(false)
        props.setLoading(false)
    }

    const deleteCourseInCar = async (key) => {
        const docRef = doc(db, "cars", decodeKey(key));
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const courses = data.courses || [];

            const updatedCourses = courses
                .map((course) => {
                    if (course.name === props.course.id) {
                        console.log("Found course name", decodeKey(key));
                        return null;
                    } else {
                        return course;
                    }
                })
                .filter((course) => course !== null);

            await updateDoc(docRef, { current_slot: 0, courses: updatedCourses });
        }
    };

    const decreaseStudent = async (key) => {
        const CardocRef = doc(db, "cars", decodeKey(key));
        const docCarSnap = await getDoc(CardocRef);

        try {
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const currentValue = data["cars"][key]["number_of_students"] || 0;
                if (currentValue - 1 > 0) {
                    const dynamicPath = `cars.${key}.number_of_students`;
                    await updateDoc(docRef, {
                        [dynamicPath]: increment(-1),
                    });
                    if (docCarSnap.exists()) {
                        const data = docCarSnap.data();
                        const courses = data.courses || [];
                        const updatedCourses = courses.map((course) => {
                            if (course.name === props.course.id) {
                                return {
                                    ...course,
                                    number_of_students: (course.number_of_students || 0) - 1,
                                };
                            } else {
                                return course;
                            }
                        });
                        await updateDoc(CardocRef, {
                            current_slot: increment(-1),
                            courses: updatedCourses,
                        });
                    }
                    console.log(`Decrement successful: number_of_students is now updated.`);
                } else {
                    await updateDoc(docRef, {
                        [`cars.${key}`]: deleteField(),
                    });
                    console.log(`Key "${decodeKey(key)}" removed successfully!`);
                    deleteCourseInCar(key);
                }
            }
        } catch (error) {
            console.log("Document does not exist!");
        }
    };

    const increaseStudent = async (key) => {
        const docRef = doc(db, "courses", props.course.id);
        updateDoc(docRef, {
            [`cars.${key}.number_of_students`]: increment(NUMBER_TO_INCREASE),
        });

        try {
            const docRef = doc(db, "cars", decodeKey(key));
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const courses = data.courses || [];

                const updatedCourses = courses.map((course) => {
                    if (course.name === props.course.id) {
                        return {
                            ...course,
                            number_of_students: (course.number_of_students || 0) + NUMBER_TO_INCREASE,
                        };
                    } else {
                        return course;
                    }
                });

                console.log(updatedCourses);

                await updateDoc(docRef, { current_slot: increment(1), courses: updatedCourses });
                console.log(`Updated number_of_students for course: ${decodeKey(key)}`);
            } else {
                console.log(`NOT FOUND course: ${decodeKey(key)}`);
            }
        } catch (error) {
            console.log("Document does not exist!");
        }
    };

    const handleSelectState = async (state) => {
        if(props.course.id !== state) {
            console.log("Change state", state);
            setCourseState(state)
            setSaveChange(true)
            setStateChange(true)
        }
    };

    useEffect(() => {
        setCourseState(props.course.state)
    }, [props.course.state])

    const handleReverse = () => {
        //setSaveChange(false)
        setCourseState(props.course.state)
        setUpdateQueue({})
        setTriggerUndo(true)
        setSaveChange(false)
    }

    const handleStartDateSelecet = async (date) => {
        await updateDoc(docRef, {
            start_date: Timestamp.fromDate(new Date(date.iso))
        })
        setEditStartDate(false)
    }

    const handleEndDateSelecet = async (date) => {
        await updateDoc(docRef, {
            end_date: Timestamp.fromDate(new Date(date.iso))
        })
        setEditEndDate(false)
    }

    useEffect(() => {
        //console.log("Update Queue", updateQueue)
    }, [updateQueue])

    useEffect(() => {
        handleReverse()
    }, [props.course])

    useEffect(() => {
        if (!courseRef.current) return;

        return combine(
            dropTargetForElements({
                element: courseRef.current,
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
    }, [])  
    
    const deleteCourse = async () => {
        try {
            // const docSnap = await getDoc(docRef);
            // if (docSnap.exists()) {
            //     const cars = docSnap.data().cars || [];
            //     for(const [key, value] of Object.entries(cars)) {
                    
            //     }
            // }
            await deleteDoc(docRef)
            handleClose()
        } catch (error) {
            console.error('Error deleting course: ', error);
        }
    }

    const handleAddCar = async (plate, current_slot) => {
        const response = await AddCarToCourse(plate);
        if (response?.status === 200) {
            updateCarSlot(plate, 1, current_slot);
        }
    };

    return (
        <>
            <div ref={courseRef} className={`relative w-full cursor-default h-full ${isClosing ? "closing" : ""}`}>
                <section className="w-full h-full pb-4 shadow-md rounded-lg bg-[#E4D8B4] border-[#2E282A] border">
                    <div className="flex h-[20%] relative items-center justify-between px-3 pt-3">
                        <div className="flex items-center gap-10 w-full">
                            <div className="basis-[30%]">
                                <div className="flex border-box justify-start">
                                    <h1 className="text-[#172B4D] text-2xl font-semibold">{props.course.id}</h1>
                                </div>
                                <div ref={ref} className="flex gap-5">
                                    <div className="cursor-pointer relative">
                                        <span className="text-sm">Từ Ngày: </span>
                                        <span className="text-sm font-semibold" onClick={() => setEditStartDate(!editStartDate)}>{formatFirebaseTimestamp(props.course.start_date.seconds)}</span>
                                        <div className="absolute z-[10] bg-white">
                                            {editStartDate ?
                                                <Calendar 
                                                    locale="vi-VN" 
                                                    defaultSelected={formatFirebaseTimestampV2(props.course.start_date)}
                                                    onSelect={handleStartDateSelecet}
                                                />
                                            : null}
                                        </div>
                                    </div>
                                    <div className="cursor-pointer relative">
                                        <span className="text-sm">Đến Ngày: </span>
                                        <span className="text-sm font-semibold" onClick={() => setEditEndDate(!editEndDate)}>{formatFirebaseTimestamp(props.course.end_date.seconds)}</span>
                                        <div className="absolute z-[10] bg-white">
                                            {editEndDate ?
                                                <Calendar 
                                                    locale="vi-VN" 
                                                    defaultSelected={formatFirebaseTimestampV2(props.course.end_date)}
                                                    onSelect={handleEndDateSelecet}
                                                />
                                            : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 basis-[20%] items-center justify-center">
                                {saveChange ? 
                                    <>
                                        <Button className="text-sm" onClick={() => handleUpdate()}>
                                            Lưu thay đổi
                                        </Button>
                                        <div 
                                            className="flex items-center p-2 hover:bg-[#111111]/[.1] rounded cursor-pointer"
                                            onClick={() => handleReverse()}
                                        >
                                            <Undo2/>
                                        </div>
                                    </>
                                : null }
                            </div> 
                            <div className="basis-[15%] inline-block text-base pt-[3px] pr-[8px] relative" onClick={() => setOptionState(!optionSate)}>
                                <div className={`px-2 py-1 min-w-[120px] text-center cursor-pointer rounded-full select-none ${stateColors[courseState] || "bg-gray-300 text-gray-800"}`}>
                                    {courseState}
                                </div>
                                {optionSate ? (
                                    <div className="absolute flex flex-col gap-1 select-none bg-white border text-sm rounded z-[100] shadow-lg p-2 w-[140px] option-container">
                                        <div
                                            className={`cursor-pointer rounded-md p-2 flex items-center bg-gray-200`}
                                            onClick={() => handleSelectState("Chưa bắt đầu")}
                                        >
                                            <span className="font-semibold">Chưa bắt đầu</span>
                                        </div>
                                        <div
                                            className={`cursor-pointer rounded-md p-2 flex items-center bg-yellow-200`}
                                            onClick={() => handleSelectState("Đang thực hiện")}
                                        >
                                            <span className="font-semibold">Đang thực hiện</span>
                                        </div>
                                        <div
                                            className={`cursor-pointer rounded-md p-2 flex items-center bg-blue-200`}
                                            onClick={() => handleSelectState("Tiếp tục")}
                                        >
                                            <span className="font-semibold">Tiếp tục</span>
                                        </div>
                                        <div
                                            className={`cursor-pointer rounded-md p-2 flex items-center bg-green-200`}
                                            onClick={() => handleSelectState("Đã hoàn thành")}
                                        >
                                            <span className="font-semibold">Đã hoàn thành</span>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                            <div className="basis-[30%] inline-block text-base pt-[3px] pr-[8px] relative">
                                <div 
                                    className={`bg-red-500 hover:bg-red-600 max-w-fit flex items-center transition-width justify-center text-slate-200 cursor-pointer rounded px-2 gap-2 h-[30px] ${isDeleteHover ? "w-fit" : ""}`}
                                    onClick={() => setIsDelete(true)}
                                    ref={deleteHover}
                                >
                                    <Trash2/>
                                    {isDeleteHover ? <span className="">Xoá khoá học</span> : null}
                                </div>
                                {/*<Button variant="danger" className="rounded text-white text-sm cursor-pointer" onClick={() => setIsDelete(true)}>Xoá khoá học</Button>*/}
                            </div>
                        </div>
                        <div className="flex border-box justify-end">
                            <button
                                className="w-[2rem] h-[2rem] my-auto transition hover:bg-[#111111]/[.2] flex justify-center rounded"
                                onClick={() => handleClose()}
                            >
                                <span className="self-center">
                                    <X />
                                </span>
                            </button>
                        </div>
                    </div>
                    <div className="px-2 pt-2 h-[80%]">
                        <div className="h-full overflow-y-scroll custom-scrollbar">
                            <table className="min-w-full border-collapse bg-white shadow-md rounded-lg relative text-sm">
                                <thead className="bg-[#002933] text-white text-xs uppercase sticky top-0">
                                    <tr>
                                        <th className="border px-2 py-2 text-left">Biển số</th>
                                        <th className="border px-2 py-1 text-center">Thầy giáo</th>
                                        <th className="border px-2 py-1 text-center">Học viên</th>
                                        <th className="border px-2 py-1 text-left">Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.course.cars &&
                                        Object.entries(props.course.cars)
                                            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
                                            .map(([key, value]) => (
                                                <CarItem
                                                    plate={key}
                                                    value={value}
                                                    decreaseStudent={decreaseStudent}
                                                    increaseStudent={increaseStudent}
                                                    courseId={props.course.id}
                                                    saveChange={saveChange}
                                                    setSaveChange={setSaveChange}
                                                    setUpdateQueue={setUpdateQueue}
                                                    triggerUndo={triggerUndo}
                                                    setTriggerUndo={setTriggerUndo}
                                                />
                                            ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
                <DeleteCourseModal trigger={isDelete} setTrigger={setIsDelete} course={props.course} deleteCourse={deleteCourse}/>
                {colState.type === "is-car-over" ? 
                    <div className="absolute bg-[#1D7AFC]/[.3] rounded-md border-[3px] transition border-[#1D7AFC] border-dashed flex items-center justify-center top-0 bottom-0 right-0 left-0">
                        <Plus className="w-[20%] h-[20%] text-[#4A0FFF]"/>
                    </div>
                : null}
                {props.loading ? 
                    <div className="absolute bg-[#fff]/[.9] flex items-center justify-center top-0 bottom-0 right-0 left-0">
                        <div className="w-[20%] h-[20%] flex items-center">
                            <Lottie animationData={loadingAnimation} speed={3}/>
                        </div>
                    </div> 
                : null}
            </div>
        </>
    ) 
}
