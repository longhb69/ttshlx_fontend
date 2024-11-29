import Blanket from "@atlaskit/blanket";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
import { MoveRight, MoveLeft } from "lucide-react";
import Button from "@atlaskit/button/new";
import { getFirestore, doc, increment, updateDoc } from "firebase/firestore";

const encodeKey = (key) => key.replace(/\./g, "_DOT_");
const decodeKey = (key) => key.replace(/_DOT_/g, ".");

const NUMBER_TO_INCREASE = 1;

export default function CourseModal(props) {
    const [isClosing, setIsClosing] = useState(false);
    const db = getFirestore();

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            props.setTrigger(false);
            setIsClosing(false);
        }, 200);
    };

    const decreaseStudent = () => {};

    const increaseStudent = (key) => {
        const docRef = doc(db, "courses", props.course.id);
        updateDoc(docRef, {
            [`cars.${key}.number_of_students`]: increment(NUMBER_TO_INCREASE),
        });
    };

    useEffect(() => {}, [props.course]);

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
                                    <div className="flex gap-2">
                                        <div>{formatFirebaseTimestamp(props.course.start_date.seconds)}</div>
                                        <div>
                                            <MoveRight />
                                        </div>
                                        <div>{formatFirebaseTimestamp(props.course.end_date.seconds)}</div>
                                    </div>
                                </div>
                                <div className="inline-block text-base pt-[3px] pr-[8px]">
                                    <div className="bg-green-300 text-green-800 px-2 py-1 cursor-pointer rounded-full">{props.course.state}</div>
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
                                            <th className="border px-2 py-1 text-center">Học Viên</th>
                                            <th className="border px-2 py-1 text-left">Note</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(props.course.cars).map(([key, value]) => (
                                            <tr className="hover:bg-[#f0f0f0] transition-colors duration-200" key={key}>
                                                <td className="border px-2 py-1 text-gray-800 text-base" style={{ width: "20%" }}>
                                                    {decodeKey(key)}
                                                </td>
                                                <td className="border px-2 py-1 text-gray-800 text-center" style={{ width: "20%" }}>
                                                    <div className="flex items-center justify-evenly">
                                                        <div>
                                                            <div className="w-[30px] h-[30px] flex items-center justify-center hover:bg-[#111111]/[.2]  rounded transition-colors duration-200">
                                                                <button onClick={() => decreaseStudent()} className="w-full h-full">
                                                                    <span className="text-lg">-</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-lg font-semibold">{value.number_of_students}</span>
                                                        </div>
                                                        <div className="w-[30px] h-[30px] flex items-center justify-center hover:bg-[#111111]/[.2]  rounded transition-colors duration-200">
                                                            <button className="w-full h-full" onClick={() => increaseStudent(key)}>
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="border px-2 py-1 text-gray-800" style={{ width: "50%" }}>
                                                    {value.note}
                                                </td>
                                            </tr>
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
