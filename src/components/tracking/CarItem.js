import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useEffect, useState } from "react";
const decodeKey = (key) => key.replace(/_DOT_/g, ".");

export default function CarItem({ plate, value, cars, decreaseStudent, increaseStudent, courseId }) {
    const [text, setText] = useState(value.note);
    const [carData, setCarData] = useState();

    const handleBlur = () => {
        if (text !== value.note) {
            const docRef = doc(db, "courses", courseId);
            updateDoc(docRef, {
                [`cars.${plate}.note`]: text,
            });
        }
    };

    return (
        <tr className="hover:bg-[#f0f0f0] transition-colors duration-200" key={plate}>
            <td className="border px-2 py-1 text-gray-800 text-base" style={{ width: "20%" }}>
                {decodeKey(plate)}
            </td>
            {carData && (
                <td className="border px-2 py-1 text-gray-800 text-center" style={{ width: "20%" }}>
                    {carData.car.owner_name}
                </td>
            )}
            <td className="border px-2 py-1 text-gray-800 text-center" style={{ width: "20%" }}>
                <div className="flex items-center justify-evenly">
                    <div>
                        <div className="w-[30px] h-[30px] flex items-center justify-center hover:bg-[#111111]/[.2]  rounded transition-colors duration-200">
                            <button onClick={() => decreaseStudent(plate)} className="w-full h-full">
                                <span className="text-lg">-</span>
                            </button>
                        </div>
                    </div>
                    <div>
                        <span className="text-lg font-semibold">{value.number_of_students}</span>
                    </div>
                    <div className="w-[30px] h-[30px] flex items-center justify-center hover:bg-[#111111]/[.2]  rounded transition-colors duration-200">
                        <button className="w-full h-full" onClick={() => increaseStudent(plate)}>
                            +
                        </button>
                    </div>
                </div>
            </td>
            <td className="border px-2 py-1 text-gray-800" style={{ width: "50%" }}>
                <textarea
                    className="m-0 w-full overflow-hidden border-none rounded bg-white resize-none break outline-none"
                    value={text}
                    onBlur={handleBlur}
                    onChange={(e) => setText(e.target.value)}
                />
            </td>
        </tr>
    );
}
