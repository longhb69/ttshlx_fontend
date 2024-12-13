import { useCallback } from "react";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const encodeKey = (key) => key.replace(/\./g, "_DOT_");
const useCarCourse = (courseId) => {
    const AddCarToCourse = useCallback(
        async (plate, number_of_students = 1, note = "") => {
            try {
                const courseDocRef = doc(db, "courses", courseId);
                const carDocRef = doc(db, "cars", plate);
                const carDocSnap = await getDoc(carDocRef);
                const courseDocSnap = await getDoc(courseDocRef);

                console.log("update course ", encodeKey(plate), courseId)
                await updateDoc(courseDocRef, {
                    [`cars.${encodeKey(plate)}`]: {
                        note,
                        number_of_students,
                        add_date: serverTimestamp()
                    },
                });

                if (!carDocSnap.exists()) {
                    console.error("Document does not exist!");
                    return;
                }

                const carData = carDocSnap.data();
                const currentCarCourse = carData.courses || [];
                const newCourseData = { name: courseId, number_of_students };
                let updatedCourses;
                let existingIndex;

                if (currentCarCourse.length === 0) {
                    console.log("Car has no course");
                    updatedCourses = [newCourseData];
                } else {
                    console.log("Car already has some courses");
                    existingIndex = currentCarCourse.findIndex((course) => course.name === courseId);
                    console.log("check", existingIndex);
                    if (existingIndex !== -1) return { status: 400 };

                    updatedCourses = [...currentCarCourse, newCourseData];
                }

                await updateDoc(carDocRef, {
                    courses: updatedCourses,
                });

                return { status: 200 };
            } catch (error) {
                console.error("Error updating document:", error);
            }
        },
        [courseId]
    );

    const updateCarSlot = useCallback(async (plate, slot_number, current_slot) => {
        try {
            const newSlotNumber = current_slot + slot_number;
            const carDocRef = doc(db, "cars", plate);
            await updateDoc(carDocRef, {
                current_slot: newSlotNumber,
            });
            return newSlotNumber;
        } catch (error) {
            console.error("Error updating document:", error);
        }
    }, []);

    return { AddCarToCourse, updateCarSlot };
}

export default useCarCourse;