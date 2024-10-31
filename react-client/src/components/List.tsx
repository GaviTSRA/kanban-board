import { List as ListType } from "../types";

export default function List({ list }: { list: ListType }) {
  return (
    <div className="bg-list rounded">
      <p className="p-2 text-lg">{list.title}</p>
      <div className="p-2">
        <input
          className="rounded bg-card outline-none px-2 py-1 w-full"
          placeholder="Add a card..."
        />
      </div>
    </div>
  );
}
