import Button from "@atlaskit/button/new";
import { Filter } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useOnClickOutside } from "usehooks-ts";
import { Plus } from "lucide-react";
import CarModal from "../modal/CarModal.tsx";
import Tag from "@atlaskit/tag";
import TagGroup from "@atlaskit/tag-group";
import { Link, useParams } from "react-router-dom";

export default function ToolBar({ handleSearch, coursesName, filterClass, tags, setTags, resetNote }) {
    const { param1 } = useParams();
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
        resetNote();
        if (!tags.includes(name)) {
            setTags([...tags, name]);
        }
        setIsOpen(false);
    };

    useEffect(() => {
        filterClass(tags);
        console.log("current tags", tags);
    }, [tags]);

    const handleClearFilter = () => {
        handleSearch("");
        setTags([]);
    };

    const handleRemoveTag = (tag) => {
        console.log("Remove tag", tag);
        setTags((prevTags) => prevTags.filter((currentTag) => currentTag !== tag));
    };

    useOnClickOutside(ref, handleClickOutside);

    return (
        <div className="h-full min-h-full flex items-center gap-5">
            <div className="flex h-full w-[15%] items-center justify-center font-semibold rounded-md bg-[#E5E6E6] shadow">
                <Link to="/tracking/B11" className={`w-[100px] px-1 flex items-center justify-center h-full cursor-pointer rounded-l transition ${param1 === "B11" ? "bg-[#4A0FFF] text-white" : "hover:bg-[#111111]/[.1] text-[#111111]/[.8]"}`}>B11</Link>
                <Link to="/tracking/B1+B2" className={`w-[100px] px-1 transition flex items-center justify-center h-full cursor-pointer  ${param1 === "B1+B2" ? "bg-[#4A0FFF] text-white" : "hover:bg-[#111111]/[.1] text-[#111111]/[.8]"} `}>B1+B2</Link>
                <Link to="/tracking/C" className={`w-[100px] px-1 transition flex items-center justify-center h-full cursor-pointer rounded-r ${param1 === "C" ? "bg-[#4A0FFF] text-white" : "hover:bg-[#111111]/[.1] text-[#111111]/[.8]"} `}>C</Link>
            </div>
            <div className=" flex items-center p-2 justify-center rounded-md gap-2 " ref={ref}>
                <input
                    type="text"
                    placeholder="Tìm kiếm xe..."
                    className="p-2 border rounded-lg w-[220px] h-[35px] focus:outline-none focus:ring-2 focus:ring-[#00D8BF]"
                    onChange={(e) => handleSearch(e.target.value)}
                />
                <div className="flex gap-1 relative">
                    <div className="flex relative items-center">
                        <Button className="w-[8px] h-[8px]" onClick={toggleDropdown}>
                            <span cassName="w-[8px] h-[8px]">
                                <Filter />
                            </span>
                        </Button>
                        {isOpen && (
                            <div className="absolute bg-white top-full rounded shadow-lg z-[2] cursor-pointer">
                                <ul className="p-2">
                                    {coursesName.map((name) => {
                                        return (
                                            <li className="p-2 rounded hover:bg-[#111111]/[.2]" onClick={() => handleSelectOption(name)}>
                                                {name}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                        <div className="hover:bg-[#111111]/[.1] w-full text-center cursor-pointer">
                            {tags.length > 0 ? (
                                <button className="w-full h-full" onClick={() => handleClearFilter()}>
                                    X
                                </button>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex flex-wrap">
                        <TagGroup label="Removable tags">
                            <div className="flex flex-wrap">
                                {tags.length > 0 &&
                                    tags.map((tag) => {
                                        return (
                                            <div key={tag} onClick={() => handleRemoveTag(tag)}>
                                                <Tag text={`${tag}`} color="orange" removeButtonLabel="Remove" />
                                            </div>
                                        );
                                    })}
                            </div>
                        </TagGroup>
                    </div>
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
