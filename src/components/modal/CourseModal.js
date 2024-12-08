import Blanket from "@atlaskit/blanket";
import { X, Plus, Minus } from "lucide-react";
import {useEffect, useState } from "react";
import formatFirebaseTimestampV2 from "../../utils/formatFirebaseTimestampV2";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
import { getFirestore, doc, increment, getDoc, updateDoc, deleteField } from "firebase/firestore";
import Button from "../Button"
import CarItem from "../tracking/CarItem";
import Calendar from '@atlaskit/calendar';

const decodeKey = (key) => key.replace(/_DOT_/g, ".");

const NUMBER_TO_INCREASE = 1;

export default function CourseModal(props) {
    const [isClosing, setIsClosing] = useState(false);
    const [optionSate, setOptionState] = useState(false);
    const [saveChange, setSaveChange] = useState(false)
    const [updateQueue, setUpdateQueue] = useState({})
    const [courseState, setCourseState] = useState("props.course.state")
    const db = getFirestore();
    const docRef = doc(db, "courses", "props.course.id");

    //lister to any update that happen in date, state
    const [stateChange, setStateChange] = useState(false)

    const handleClose = () => {
        setIsClosing(true);
        setSaveChange(false)
        setUpdateQueue({})
        setTimeout(() => {
            props.setTrigger(false);
            setIsClosing(false);
        }, 200);
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
                return
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
        //console.log("Update Queue", updateQueue)
    }, [updateQueue])



    return (
        <>
            <div className={`relative w-full cursor-default h-full ${isClosing ? "closing" : ""}`}>
                <section className="w-full h-full modal bg-[#EFEAE6]">
                    <div className="flex relative items-center justify-between px-[1.5rem] pb-[1rem] pt-[1.5rem]">
                        <div className="flex justify-between w-full">
                            <div>
                                <div className="flex border-box justify-start">
                                    <h1 className="text-[#172B4D] text-[25px] font-semibold">{"props.course.id"}</h1>
                                </div>
                                <div className="flex gap-5">
                                    <div className="cursor-pointer relative">
                                        <span className="text-sm">Từ Ngày: </span>
                                        {/* {formatFirebaseTimestamp(props.course.start_date.seconds)} */}
                                        <div className="absolute z-[10] bg-white">
                                            {/*<Calendar locale="vi-VN" defaultSelected={formatFirebaseTimestampV2(props.course.start_date)}/>*/}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-sm">Đến Ngày: </span>
                                        {/* {formatFirebaseTimestamp(props.course.end_date.seconds)} */}
                                    </div>
                                </div>
                            </div>
                            {saveChange ?
                                <div className="flex items-center justify-center">
                                    <Button onClick={() => handleUpdate()}>
                                        Lưu thay đổi
                                    </Button>
                                </div> 
                            : null}
                            <div>
                                <Button>
                                    Thêm xe
                                </Button>
                            </div>
                            <div className="inline-block text-base pt-[3px] pr-[8px] relative" onClick={() => setOptionState(!optionSate)}>
                                <div className="bg-green-300 text-green-800 px-2 py-1 cursor-pointer rounded-full select-none">
                                    {courseState}
                                </div>
                                {optionSate ? (
                                    <div className="absolute select-none bg-white border text-sm rounded z-[100] shadow-lg p-2 w-[140px] option-container">
                                        <div className="hover:bg-[#111111]/[.1] p-2 rounded flex items-center" onClick={() => handleSelectState("Chưa bắt đầu")}>
                                            <span className="font-semibold">Chưa bắt đầu</span>
                                        </div>
                                        <div className="hover:bg-[#111111]/[.1] p-2 rounded flex items-center" onClick={() => handleSelectState("Đang thực hiện")}>
                                            <div className="flex justify-start">
                                                <span className="text-start font-semibold">Đang thực hiện</span>
                                            </div>
                                        </div>
                                        <div className="hover:bg-[#111111]/[.1] p-2 rounded flex items-center" onClick={() => handleSelectState("Tiếp tục")}>
                                            <div className="flex justify-start">
                                                <span className="text-start font-semibold">Tiếp tục</span>
                                            </div>
                                        </div>
                                        <div className="hover:bg-[#111111]/[.1] p-2 rounded flex items-center" onClick={() => handleSelectState("Đã hoàn thành")}>
                                            <div className="flex justify-start">
                                                <span className="text-start font-semibold">Đã hoàn thành</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
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
                    <div className="p-2 h-full">
                        <div className="max-h-[80%] h-full overflow-y-scroll">
                            <table className="min-w-full border-collapse bg-white shadow-md rounded-lg relative text-sm">
                                <thead className="bg-[#002933] text-white uppercase sticky top-0">
                                    <tr>
                                        <th className="border px-2 py-1 text-left">Biển số</th>
                                        <th className="border px-2 py-1 text-center">Thầy giáo</th>
                                        <th className="border px-2 py-1 text-center">Học viên</th>
                                        <th className="border px-2 py-1 text-left">Note</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* {props.course.cars &&
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
                                                />
                                            ))} */}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </div>
        </>
    ) 
}
