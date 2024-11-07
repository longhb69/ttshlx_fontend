import ListWrapper from "./ListWrapper";
import { Plus } from "lucide-react";

export default function ListForm() {
  return (
    <div>
      <ListWrapper>
        <button className="w-full rounded-md bg-white/80 hover:bg-white/50 transition p-3 flex items-center font-medium text-sm">
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh sách khác
        </button>
      </ListWrapper>
    </div>
  );
}
