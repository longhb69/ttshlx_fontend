import Blanket from "@atlaskit/blanket";
import { X, Plus, Minus } from "lucide-react";
import {useState } from "react";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
import { getFirestore, doc, increment, getDoc, updateDoc, deleteField } from "firebase/firestore";
import CarItem from "../tracking/CarItem";

const decodeKey = (key) => key.replace(/_DOT_/g, ".");

const NUMBER_TO_INCREASE = 1;

export default function CourseModal(props) {
    const [isClosing, setIsClosing] = useState(false);
    const [optionSate, setOptionState] = useState(false);
    const db = getFirestore();
    const docRef = doc(db, "courses", props.course.id);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            props.setTrigger(false);
            setIsClosing(false);
        }, 200);
    };

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

    const handleSelectState = async () => {
        console.log("Change state");
    };

    return props.trigger ? (
        <>
            <Blanket isTinted={true}>
                <div className={`modal-container w-[80%] min-w-[80%] h-full ${isClosing ? "closing" : ""}`}>
                    <section className="w-full h-full modal bg-[#FAF7F5]">
                        <div className="flex relative items-center justify-between px-[1.5rem] pb-[1rem] pt-[1.5rem]">
                            <div className="flex justify-between w-full">
                                <div>
                                    <div className="flex border-box justify-start">
                                        <h1 className="text-[#172B4D] text-[25px] font-semibold">{props.course.id}</h1>
                                    </div>
                                    <div className="flex gap-5">
                                        <div>
                                            <span className="text-sm">Từ Ngày: </span>
                                            {formatFirebaseTimestamp(props.course.start_date.seconds)}
                                        </div>
                                        <div>
                                            <span className="text-sm">Đến Ngày: </span>
                                            {formatFirebaseTimestamp(props.course.end_date.seconds)}
                                        </div>
                                    </div>
                                </div>
                                <div className="inline-block text-base pt-[3px] pr-[8px] relative" onClick={() => setOptionState(!optionSate)}>
                                    <div className="bg-green-300 text-green-800 px-2 py-1 cursor-pointer rounded-full select-none">
                                        {props.course.state}
                                    </div>
                                    {optionSate ? (
                                        <div className="absolute select-none bg-white border text-sm rounded z-[100] shadow-lg p-2 w-[140px] option-container">
                                            <div className="hover:bg-[#111111]/[.1] p-2 rounded flex items-center">
                                                <span className="font-semibold">Chưa bắt đầu</span>
                                            </div>
                                            <div className="hover:bg-[#111111]/[.1] p-2 rounded flex items-center ">
                                                <div className="flex justify-start">
                                                    <span className="text-start font-semibold">Đang thực hiện</span>
                                                </div>
                                            </div>
                                            <div className="hover:bg-[#111111]/[.1] p-2 rounded flex items-center ">
                                                <div className="flex justify-start">
                                                    <span className="text-start font-semibold">Tiếp tục</span>
                                                </div>
                                            </div>
                                            <div className="hover:bg-[#111111]/[.1] p-2 rounded flex items-center ">
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
                                                    />
                                                ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>
            </Blanket>
        </>
    ) : null;
}
