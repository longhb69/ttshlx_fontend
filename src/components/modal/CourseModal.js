import Blanket from "@atlaskit/blanket";
import { X, Plus, Minus, Undo2 } from "lucide-react";
import {useEffect, useRef, useState } from "react";
import formatFirebaseTimestampV2 from "../../utils/formatFirebaseTimestampV2";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
import { getFirestore, doc, increment, getDoc, updateDoc, deleteField, deleteDoc } from "firebase/firestore";
import Button from "../Button"
import CarItem from "../tracking/CarItem";
import Calendar from '@atlaskit/calendar';
import { useOnClickOutside } from "usehooks-ts";
import DeleteCourseModal from "./DeleteCourseModal";


const decodeKey = (key) => key.replace(/_DOT_/g, ".");

const NUMBER_TO_INCREASE = 1;

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

    const ref = useRef()

    const handleClickOutside = () => {
        setEditEndDate(false)
        setEditStartDate(false)
    }

    useOnClickOutside(ref, handleClickOutside)

    const db = getFirestore();
    const docRef = doc(db, "courses", props.course.id);

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

    useEffect(() => {
        //console.log("Update Queue", updateQueue)
    }, [updateQueue])

    useEffect(() => {
        handleReverse()
    }, [props.course])

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

    return (
        <>
            <div className={`relative w-full cursor-default rounded-lg h-full ${isClosing ? "closing" : ""}`}>
                <section className="w-full h-full pb-4 modal rounded-lg bg-[#EFEAE6]">
                    <div className="flex h-[20%] relative items-center justify-between px-3 pt-3">
                        <div className="flex justify-between w-full">
                            <div>
                                <div className="flex border-box justify-start">
                                    <h1 className="text-[#172B4D] text-xl font-semibold">{props.course.id}</h1>
                                </div>
                                <div ref={ref} className="flex gap-5">
                                    <div className="cursor-pointer relative">
                                        <span className="text-sm">Từ Ngày: </span>
                                        <span onClick={() => setEditStartDate(!editStartDate)}>{formatFirebaseTimestamp(props.course.start_date.seconds)}</span>
                                        <div className="absolute z-[10] bg-white">
                                            {editStartDate ?
                                                <Calendar locale="vi-VN" defaultSelected={formatFirebaseTimestampV2(props.course.start_date)}/>
                                            : null}
                                        </div>
                                    </div>
                                    <div className="cursor-pointer relative">
                                        <span className="text-sm">Đến Ngày: </span>
                                        <span onClick={() => setEditEndDate(!editEndDate)}>{formatFirebaseTimestamp(props.course.end_date.seconds)}</span>
                                        <div className="absolute z-[10] bg-white">
                                            {editEndDate ?
                                                <Calendar locale="vi-VN" defaultSelected={formatFirebaseTimestampV2(props.course.end_date)}/>
                                            : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {saveChange ?
                                <div className="flex gap-2 items-center justify-center">
                                    <Button className="text-sm" onClick={() => handleUpdate()}>
                                        Lưu thay đổi
                                    </Button>
                                    <div 
                                        className="flex items-center p-2 hover:bg-[#111111]/[.1] rounded cursor-pointer"
                                        onClick={() => handleReverse()}
                                    >
                                        <Undo2/>
                                    </div>
                                </div> 
                            : null}
                            <div>
                                {/* <Button>
                                    Thêm xe
                                </Button> */}
                            </div>
                            <div className="inline-block text-base pt-[3px] pr-[8px] relative" onClick={() => setOptionState(!optionSate)}>
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
                            <div className="inline-block text-base pt-[3px] pr-[8px] relative">
                                <Button variant="danger" className="rounded text-white text-sm cursor-pointer" onClick={() => setIsDelete(true)}>Xoá khoá học</Button>
                            </div>
                            <div className="flex border-box justify-end">
                                <button
                                    className="w-[2rem] h-[2rem] my-auto transition hover:bg-gray-200 flex justify-center rounded"
                                    onClick={() => handleClose()}
                                >
                                    <span className="self-center">
                                        <X />
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="px-2 pt-2 h-[80%]">
                        <div className="h-full overflow-y-scroll">
                            <table className="min-w-full border-collapse bg-white shadow-md rounded-lg relative text-sm">
                                <thead className="bg-[#002933] text-white text-xs uppercase sticky top-0">
                                    <tr>
                                        <th className="border px-2 py-1 text-left">Biển số</th>
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
            </div>
        </>
    ) 
}
