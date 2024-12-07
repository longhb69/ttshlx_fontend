import React, {createContext, useState, useEffect, Children} from 'react'

export const CarsContext = createContext()

export const CarsProvider = ({children}) => {
    const [gobalCars, setGobalCars] = useState([])
    const [gobalCourse, setGobalCourse] = useState([])

    const value = {
        gobalCars,
        setGobalCars,
        gobalCourse,
        setGobalCourse
    }
    return (
        <CarsContext.Provider value={value}>
            {children}
        </CarsContext.Provider>
    )
}