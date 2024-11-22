import { useEffect } from "react";
import formatFirebaseTimestamp from "../../utils/formatFirebaseTimestamp";
export default function Plate({ plate, expiry_date, owner_name, owner_id, car_class }) {
    
    return (
        <div className="flex max-w-[145px] cursor-pointer">
            <div className="w-full rounded">
                <div className="bg-yellow-400 border-black border-t-2 border-l-2 border-b-2 px-2 py-1 rounded-tl  text-sm w-full h-[35px] text-center">
                    <span className="font-mono font-bold">{plate}</span>
                </div>
                <div className="bg-slate-200 p-1 rounded-bl border-b-2 border-l-2 border-r-2 border-[#244855]">
                    <div className="text-xs">
                        <span>NHĐK: </span>
                        <span>
                            {formatFirebaseTimestamp(expiry_date.seconds)}
                        </span>
                    </div>
                    <div>{owner_name}</div>
                </div>
            </div>
            <div className="h-full">
                <div className="w-[35px] h-[35px] bg-white flex items-center justify-center border-t-2 border-r-2 border-b-2 border-black rounded-tr  text-lg font-bold">
                    <span className="text-[#003135]">{car_class}</span>
                </div>
                <div className="bg-slate-400 flex items-center justify-center border-r-2 border-b-2 border-[#244855] rounded-br">8</div>
            </div>
        </div>
    );
}
