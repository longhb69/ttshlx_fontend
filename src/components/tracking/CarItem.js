import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useContext, useEffect, useState } from "react";
import { CarsContext } from "../../Context/CarsContext";
import { Minus, Plus } from "lucide-react";
import { UpdateCarContext } from "../../Context/UpdateCarContext";
const decodeKey = (key) => key.replace(/_DOT_/g, ".");

export default function CarItem({ plate, value, cars, decreaseStudent, increaseStudent, courseId }) {
    const [text, setText] = useState(value.note);
    const [number, setNumber] = useState(value.number_of_students)
    const [carData, setCarData] = useState();
    const [joinCar, setJoinCar] = useState();
    const {gobalCars} = useContext(CarsContext)
    const {UpdateInfoToCar} = useContext(UpdateCarContext)

    const handleBlur = () => {
        if (text !== value.note) {
            const docRef = doc(db, "courses", courseId);
            updateDoc(docRef, {
                [`cars.${plate}.note`]: text,
            });
        }
    };

    useEffect(() => {
        setNumber(value.number_of_students)
    }, [value])

    const handleEdit = (e) => {
        if(isNaN(number) || number === "") {
            setNumber(value.number_of_students) 
            return
        }

        if(Number(number) !== value.number_of_students) {
            console.log("Update number")
            const docRef = doc(db, "courses", courseId)
            updateDoc(docRef, {
                [`cars.${plate}.number_of_students`] : number
            })
            UpdateInfoToCar(decodeKey(plate), courseId, Number(number))
        }
    }

    useEffect(() => {
        gobalCars.map((car) => {
            if(car.plate === decodeKey(plate)) {
                setJoinCar(car)
            }
        })
    }, [gobalCars])

    return (
        <tr className="hover:bg-[#f0f0f0] transition-colors duration-200" key={plate}>
            <td className="border px-2 py-1 text-gray-800 text-base" style={{ width: "20%" }}>
                {decodeKey(plate)}
            </td>
            {joinCar ? 
                <td className="border px-2 py-1 text-gray-800 text-center" style={{ width: "20%" }}>
                    {joinCar.owner_name}
                </td>
            : <td className="border px-2 py-1 text-gray-800 text-center" style={{ width: "20%" }}></td>}
            <td className="border px-2 py-1 text-gray-800 text-center" style={{ width: "20%" }}>
                <div className="flex items-center justify-evenly">
                    <div className="border">
                        <div className="w-[30px] h-[30px] flex items-center justify-center hover:bg-[#111111]/[.2]  rounded transition-colors duration-200">
                            <button className="w-full h-full flex items-center justify-center" onClick={() => decreaseStudent(plate)()}>
                                <Minus className="w-[15px] h-[15px]"/>
                            </button>
                        </div>
                    </div>
                    <div className="w-[30px] h-full text-lg font-semibold">
                        <input
                            className="w-full text-center border-none outline-none bg-transparent"
                            type="text"
                            value={number}
                            onBlur={handleEdit}
                            onChange={(e) => setNumber(e.target.value)}
                        />
                    </div>
                    <div className="w-[30px] h-[30px] border flex items-center justify-center hover:bg-[#111111]/[.2]  rounded transition-colors duration-200">
                        <button className="w-full h-full flex items-center justify-center" onClick={() => increaseStudent(plate)}>
                            <Plus className="w-[15px] h-[15px]"/>
                        </button>
                    </div>
                </div>
            </td>
            <td className="border px-2 py-1 text-gray-800" style={{ width: "50%" }}>
                <textarea
                    className="m-0 w-full overflow-hidden border-none rounded bg-white break outline-none flex text-start justify-center"
                    value={text}
                    autoCorrect="off"
                    onBlur={handleBlur}
                    onChange={(e) => setText(e.target.value)}
                />
            </td>
        </tr>
    );
}
