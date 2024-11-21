import { useEffect } from "react";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
export default function Plate({ plate, expiry_date, owner }) {
    useEffect(() => {
        console.log(owner);
    }, []);
    return (
        <div className="flex">
            <div className="max-w-[120px] rounded">
                <div className="bg-yellow-400 border-black border-2 px-2 py-1 rounded-tl text w-full h-[40px]">
                    <span className="font-mono font-bold">{plate}</span>
                </div>
                <div className="bg-slate-200 p-1 rounded-b border-r-2 border-l-2 border-b-2 border-[#244855]">
                    <div className="text-xs">
                        <span>NHĐK: </span>
                        <span>
                            {formatFirebaseTimestamp(expiry_date.seconds)}
                        </span>
                    </div>
                    <div>{owner}</div>
                </div>
            </div>
            <div>
                <div className="w-[50px] h-[40px] bg-white flex items-center justify-center border-t-2 border-r-2 border-b-2 border-black rounded-tr rounded-br text-lg font-bold">
                    <span className="text-[#003135]">C</span>
                </div>
                <div>test</div>
            </div>
        </div>
    );
}
