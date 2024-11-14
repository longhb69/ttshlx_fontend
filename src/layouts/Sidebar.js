import { Link } from "react-router-dom";
export default function SideBar() {
  return (
    <div className="flex flex-col w-full h-full bg-[#67879D]/[0.9] backdrop-blur-[6px]">
      <div className="w-full h-[50px]">
        <Link to="/ketoan">ke toan</Link>
      </div>
      <div className="w-full h-[50px]">
        <Link to="/daotao">dao tao</Link>
      </div>
      <div className="w-full h-[50px]">
        <Link to="/dat">DAT</Link>
      </div>
    </div>
  );
}
