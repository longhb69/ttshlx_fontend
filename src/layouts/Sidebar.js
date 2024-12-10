import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function SideBar() {
    const [collapse, setCollapse] = useState(true);

    return (
        <div
            className={`${
                collapse ? "relative w-[16px] z-[5]" : "relative w-[150px]"
            } h-full min-h-full transition-width-fast font-[14px] leading-5 bg-[#67879D]/[0.9]`}
        >
            <div className="absolute top-0 bottom-0 right-0 left-0 transition">
                <div className={`${collapse ? "hidden" : ""} flex flex-col items-center min-h-full h-full overflow-auto backdrop-blur-[6px]`}>
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
                    <Link   to="/phanxe/C" className="mr-[4px] w-full hover:bg-[#111111]/[.1] ml-[8px] cursor-pointer text-left justify-center">
                        <div className="p-2 text-base text-white">
                            <span className="w-full h-full">Phân xe</span>
                        </div>
                    </Link>
                    <Link to="/dat" className="mr-[4px] w-full hover:bg-[#111111]/[.1] ml-[8px] cursor-pointer text-left justify-center">
                        <div className="p-2 text-base text-white">
                             <span>DAT</span>
                        </div>
                    </Link>
                </div>
            </div>
            <div className="absolute top-0 bottom-0 left-0 transition w-[16px]">
                <div className={`${collapse ? "" : "hidden"} flex flex-col items-center h-full min-h-full bg-[#67879D]/[0.9]`}>
                    <button className="bg-[#67879D]/[0.9] flex flex-col justify-between w-full h-full m-0 p-0" onClick={() => setCollapse(false)}>
                        <span className="bg-[#67879D]/[0.9] flex items-center justify-center w-[24px] h-[24px] mt-[15px] ml-[9px] border-[1px] border-[#00000029] rounded-full">
                            <ChevronRight className="w-full h-full" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
