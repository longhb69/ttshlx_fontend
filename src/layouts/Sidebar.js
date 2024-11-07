import { Link } from "react-router-dom" 
export default function SideBar() {
    return (
        <div className='flex flex-col w-full h-full'>
            <div className="w-full h-[50px]">
                <Link to="/ketoan">
                    ke toan
                </Link>
            </div>
            <div className="w-full h-[50px]">
                <Link to="/daotao">
                    dao tao
                </Link>
            </div>
		</div>
    )
}
