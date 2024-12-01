import Button from "@atlaskit/button/new";
import { Filter } from "lucide-react";
import { useState, useRef } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { Plus } from "lucide-react";
import CarModal from "../modal/CarModal.tsx";

export default function ToolBar({ handleSearch, coursesName, filterClass }) {
    const ref = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleClickOutside = () => {
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleSelectOption = (name) => {
        filterClass(name);
        setIsOpen(false);
    };

    useOnClickOutside(ref, handleClickOutside);

    return (
        <div className="h-full flex flex-col">
            <div className="h-[10%] bg-[#E4D8B4] shadow">
                <Button>B11</Button>
                <Button>B1+B2</Button>
                <Button>C</Button>
            </div>
            <div className=" flex flex-col h-[90%] p-2 mt-5 rounded-md gap-2 bg-[#E4D8B4] shadow" ref={ref}>
                <input
                    type="text"
                    placeholder="Tìm kiếm xe..."
                    className="mb-2 p-2 border rounded-lg w-[180px] h-[35px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => handleSearch(e.target.value)}
                />
                <div className="relative">
                    <Button className="w-[8px] h-[8px]" onClick={toggleDropdown}>
                        <span className="w-[8px] h-[8px]">
                            <Filter />
                        </span>
                    </Button>
                    {isOpen && (
                        <div className="absolute bg-[#E4D8B4] border-[#282425] border rounded shadow-lg z-[2] cursor-pointer">
                            <ul>
                                {coursesName.map((name) => {
                                    return (
                                        <li className="p-2 hover:bg-[#111111]/[.2]" onClick={() => handleSelectOption(name)}>
                                            {name}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </div>
                <div>
                    <button onClick={() => handleSearch("")}>reset</button>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center m-0 p-[2px] rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                >
                    <span className="ml-[2px] mr-[5px] leading-1">
                        <Plus className="w-[20px] h-[20px]" />
                    </span>
                    <span className="pr-2">Thêm xe</span>
                </button>
            </div>
            <CarModal trigger={isModalOpen} setTrigger={setIsModalOpen} />
        </div>
    );
}
