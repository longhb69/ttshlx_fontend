import Blanket from "@atlaskit/blanket";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
import { MoveRight } from "lucide-react";


const encodeKey = (key) => key.replace(/\./g, "_DOT_");
const decodeKey = (key) => key.replace(/_DOT_/g, ".");

export default function CourseModal(props) {
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            props.setTrigger(false);
            setIsClosing(false);
        }, 200);
    };

    const handleStudentChange = () => {
        
    }

    useEffect(() => {
        
    }, [props.course ])

    return props.trigger ? (
        <>
            <Blanket isTinted={true}>
                <div className={`modal-container w-[80%] min-w-[80%] ${isClosing ? "closing" : ""}`}>
                    <section className="w-full modal bg-[#FAF7F5]">
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
                                <div className="bg-green-300 text-green-800 px-2 py-1 cursor-pointer rounded-full">
                                    {props.course.state}
                                    
                                </div>
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
                    <div className="p-2">
                        <div className="max-h-[200px] overflow-y-scroll">
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
                                            <td className="border px-2 py-1 text-gray-800 text-base">{decodeKey(key)}</td>
                                            <td className="border px-2 py-1 text-gray-800 text-center">
                                                <button onClick={() => handleStudentChange(key, value.number_of_students - 1)} className="mr-2">◀</button>
                                                    <span className="text-lg font-semibold">{value.number_of_students}</span>
                                                <button onClick={() => handleStudentChange(key, value.number_of_students + 1)} className="ml-2">▶</button>
                                            </td>
                                            <td className="border px-2 py-1 text-gray-800">{value.note}</td>
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
    ) : null
}