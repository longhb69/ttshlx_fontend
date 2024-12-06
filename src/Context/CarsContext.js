import React, {createContext, useState, useEffect, Children} from 'react'

export const CarsContext = createContext()

export const CarsProvider = ({children}) => {
    const [gobalCars, setGobalCars] = useState(["cars context"])

    const value = {
        gobalCars,
        setGobalCars
    }
    return (
        <CarsContext.Provider value={value}>
            {children}
        </CarsContext.Provider>
    )
}