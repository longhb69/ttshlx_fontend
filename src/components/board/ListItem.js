import CardItem from "./CardItem";
import ListHeader from "./ListHeader";

export default function ListItem() {
  return (
    <li className="shrink-0 h-full w-[272px] select-none">
      <div className="w-full rounded-md bg-[#f1f2f4] shadow-md pb-2">
        <ListHeader />
        <ol className="mx-1 px-1 py-0.5 flex flex-col gap-y-2">
          <CardItem />
          <CardItem />
          <CardItem />
        </ol>
      </div>
    </li>
  );
}
