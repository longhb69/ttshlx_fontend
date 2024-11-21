import { useEffect, useRef, useState } from "react";
import TrackItem from "../components/tracking/TrackItem";
import { db } from "../config/firebase";
import { getDocs, collection, getDoc, doc } from "firebase/firestore";
import Plate from "../components/tracking/Plate";

const tracking = [
    {
        id: 0,
        plate: 0,
        teacher: 0,
        course: 1,
        numberOfStudent: 1,
        courseState: 0,
        startDate: null,
        endDate: null,
        status: 1,
    },
    {
        id: 1,
        plate: 1,
        teacher: 1,
        course: 1,
        numberOfStudent: 2,
        courseState: 0,
        startDate: null,
        endDate: null,
        status: 1,
    },
];

export default function Tracking() {
    const [teacherList, setTeacherList] = useState([]);
    const [cars, setCars] = useState([]);

    const teachersCollectionRef = collection(db, "teachers");
    const carsCollectionRef = collection(db, "cars");

    useEffect(() => {
        const getTeacherList = async () => {
            try {
                const querySnapshot = await getDocs(carsCollectionRef);
                setCars(querySnapshot.docs.map((doc) => doc.data()));
            } catch (err) {
                console.log(err);
            }
        };
        getTeacherList();
    }, []);

    return (
        <div className="p-4">
            <div className="grid grid-rows-4 gap-2">
                {cars.length > 1 &&
                    cars.map((car) => {
                        return (
                            <Plate
                                plate={car.plate}
                                expiry_date={car.expiry_date}
                                owner={car.owner}
                                class={car.class}
                            />
                        );
                    })}
            </div>
        </div>
    );
}
