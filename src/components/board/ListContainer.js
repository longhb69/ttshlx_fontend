import ListForm from "./ListForm";
import ListItem from "./ListItem";

export default function ListContainer() {
  return (
    <ol className="flex gap-x-3">
      <ListItem />
      <ListForm />
    </ol>
  );
}
