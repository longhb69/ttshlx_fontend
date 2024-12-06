import React, {createContext, useState, useEffect} from 'react'
import { db } from '../config/firebase'
import { doc, updateDoc, getDoc, increment } from "firebase/firestore";


export const UpdateCarContext = createContext()
const decodeKey = (key) => key.replace(/_DOT_/g, ".");


export const UpdateCarProvider = ({children}) => {
    //update car current_slot and find course in course that mach course name and update number_of_students for that cousre
    const UpdateInfoToCar = async(plate, course_name, number_to_add) => {
        try {
            const carDocRef = doc(db, "cars", plate)
            const DocSnap = await getDoc(carDocRef)
            if(DocSnap.exists()) {
                const courses = DocSnap.data().courses

                const updatedCoursesInCar = courses.map(c => 
                    c.name === course_name ? {...c, number_of_students: number_to_add} : c
                )

                await updateDoc(carDocRef, {
                    current_slot: number_to_add,
                    courses: updatedCoursesInCar
                })

            } else {
                console.log("No such document for car ", plate);
            }
        } catch (error) {
            console.error("Error updating document:", error);
        }
    }
    return (
        <UpdateCarContext.Provider value={{UpdateInfoToCar}}>
            {children}
        </UpdateCarContext.Provider>
    )
}