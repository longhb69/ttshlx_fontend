import ListHeader from "./ListHeader";

export default function ListItem() {
  return (
    <li className="shrink-0 h-full w-[272px] select-none">
      <div className="w-full rounded-md bg-[#f1f2f4] shadow-md pb-2">
        <ListHeader />
      </div>
    </li>
  );
}
