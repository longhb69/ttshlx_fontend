import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useContext, useEffect, useState } from "react";
import { CarsContext } from "../../Context/CarsContext";
import { Minus, Plus } from "lucide-react";
import { UpdateCarContext } from "../../Context/UpdateCarContext";
const decodeKey = (key) => key.replace(/_DOT_/g, ".");

export default function CarItem({ plate, value, cars, decreaseStudent, increaseStudent, courseId, saveChange, setSaveChange, setUpdateQueue, triggerUndo, setTriggerUndo }) {
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
            AddToQueue(value.number_of_students)
            return
        }

        if(Number(number) !== value.number_of_students) {
            setSaveChange(true)
            //const docRef = doc(db, "courses", courseId)
            //updateDoc(docRef, {
            //    [`cars.${plate}.number_of_students`] : number
            //})
            //UpdateInfoToCar(decodeKey(plate), courseId, Number(number))
        }
    }

    const handleIncrease = () => {
        setSaveChange(true)
        setNumber(Number(number) + 1)
        AddToQueue(Number(number) + 1)
    }

    const handleDecrease = () => {
        setSaveChange(true)
        const newValue = number - 1
        if(newValue <= 0) {
            setNumber(0)
        } 
        else {
            setNumber(newValue)
        }
        AddToQueue(newValue)
    }

    const handleChangeNumber = (number) => {
        setSaveChange(true)
        setNumber(number)
        AddToQueue(number)
    }

    const AddToQueue = (updateNumber) => {
        setUpdateQueue((prevQueue) => ({
            ...prevQueue,
            [plate]: Number(updateNumber) 
        }))
    }

    useEffect(() => {
        if(triggerUndo) {
            setNumber(value.number_of_students)
            setTriggerUndo(false)
        }
    }, [triggerUndo])


    useEffect(() => {
        gobalCars.map((car) => {
            if(car.plate === decodeKey(plate)) {
                setJoinCar(car)
            }
        })
    }, [gobalCars])

    return (
        <tr className="hover:bg-[#f0f0f0] transition-colors duration-200" key={plate}>
            <td className="border px-2 text-gray-800 text-[1rem] font-semibold" style={{ width: "20%"}}>
                {decodeKey(plate)}
            </td>
            {joinCar ? 
                <td className="border text-gray-800 text-sm font-semibold text-center" style={{ width: "20%" }}>
                    {joinCar.owner_name}
                </td>
            : <td className="border  text-gray-800 text-center" style={{ width: "20%" }}></td>}
            <td className="border text-gray-800 text-center" style={{ width: "20%" }}>
                <div className="flex items-center justify-evenly">
                    <div className="border">
                        <div className="w-[20px] h-[20px] flex items-center justify-center hover:bg-[#111111]/[.2]  rounded transition-colors duration-200">
                            <button className="w-full h-full flex items-center justify-center" onClick={() => handleDecrease()}>
                                <Minus className="w-[15px] h-[15px]"/>
                            </button>
                        </div>
                    </div>
                    <div className="w-[20px] h-full text-base font-semibold">
                        <input
                            className="w-full text-center border-none outline-none bg-transparent"
                            type="text"
                            value={number}
                            onBlur={handleEdit}
                            onChange={(e) => handleChangeNumber(e.target.value)}
                        />
                    </div>
                    <div className="w-[20px] h-[20px] border flex items-center justify-center hover:bg-[#111111]/[.2]  rounded transition-colors duration-200">
                        <button className="w-full h-full flex items-center justify-center" onClick={() => handleIncrease()}>
                            <Plus className="w-[15px] h-[15px]"/>
                        </button>
                    </div>
                </div>
            </td>
            <td className="border text-gray-800" style={{ width: "50%" }}>
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
