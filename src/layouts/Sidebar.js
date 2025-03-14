import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function SideBar() {
    const [collapse, setCollapse] = useState(true);
    //transition-width-fast this make expand slow
    return (
        <div
            className={`${
                collapse ? "relative w-[16px] z-[5]" : "relative w-[150px]"
            } h-full min-h-full font-[14px] leading-5 bg-[#67879D]/[0.9] `}
        >
            <div className="absolute top-0 bottom-0 right-0 left-0 transition">
                <div className={`${collapse ? "hidden" : ""} flex flex-col items-center min-h-full h-full overflow-x-hidden backdrop-blur-[6px]`}>
                    <div className="flex justify-center item-center  py-[8px] px-[12px] border-b-1 border-[#dfe1e6]">
                        <button
                            className="flex h-[32px] w-[32px] items-center justify-center p-[2px] rounded bg-transparent cursor-pointer text-[#172B4D] hover:bg-[#091E4224]"
                            onClick={() => setCollapse(true)}
                        >
                            <div>
                                <ChevronLeft className="w-[30px] h-[30px]" />
                            </div>
                        </button>
                    </div>
                    <Link   to="/phanxe/C" className="mr-[4px] w-full hover:bg-[#ffff]/[.1] ml-[8px] cursor-pointer text-left justify-center">
                        <div className="p-2 text-base text-white">
                            <span className="w-full h-full">Phân xe</span>
                        </div>
                    </Link>
                    <Link to="/dat" className="mr-[4px] w-full hover:bg-[#ffff]/[.1] ml-[8px] cursor-pointer text-left justify-center">
                        <div className="p-2 text-base text-white">
                             <span>DAT</span>
                        </div>
                    </Link>
                    <Link to="/dsa1" className="mr-[4px] w-full hover:bg-[#ffff]/[.1] ml-[8px] cursor-pointer text-left justify-center">
                        <div className="p-2 text-base text-white">
                             <span>DSA1</span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="absolute top-0 bottom-0 left-0 transition w-[16px]">
                <div className={`${collapse ? "" : "hidden"} flex flex-col items-center h-full min-h-full bg-[#67879D]/[0.9] hover:bg-[#67879D]/[1]`}>
                    <button 
                        className="bg-[#67879D]/[.7] hover:bg-[#67879D]/[1] 
                                 flex flex-col justify-between w-full h-full m-0 p-0 
                                 transition-all duration-300 ease-in-out
                                 hover:shadow-lg hover:shadow-[#67879D]/[1]
                                 group" 
                        onClick={() => setCollapse(false)}
                    >
                        <span className="bg-[#67879D]/[0.9] flex items-center justify-center 
                                     w-[24px] h-[24px] mt-[15px] ml-[9px] 
                                     border-[1px] border-[#00000029] rounded-full
                                     transition-all duration-300
                                     group-hover:bg-[#67879D]
                                     group-hover:scale-110"
                                    >
                            <ChevronRight className="w-full h-full" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
