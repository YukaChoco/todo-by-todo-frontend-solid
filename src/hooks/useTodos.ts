import { createSignal } from "solid-js";
import { cowPrograms } from "../cowPrograms";
import { runCowInterpreter } from "../cowInterpreter";

interface Item {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  hue: number;
  faceId: number;
}

// TODO: レスポンスが治ったらもどす
interface ItemResponse {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export function useTodos() {
  const [items, setItems] = createSignal<Item[]>([]);
  const [loading, setLoading] = createSignal<boolean>(false);
  const userID = 2;

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/todos");
      const data = await response.json();
      // console.log("data:", data);
      setItems([
        ...data
          .map((item: ItemResponse) => {
            // console.log("Processing item:", item);
            // console.log("Description structure:", item.description);
            // console.log("Description value:", item.description);

            // descriptionの安全な取得
            const description = item.description || "";
            // console.log("Final description:", description);
            const result = runCowInterpreter(
              cowPrograms,
              item.title + description
            );
            const hue = Number(result[0].charCodeAt(0));

            const page = Math.floor((hue % 360) / 60);
            console.log("page:", page);

            return {
              id: item.id,
              title: item.title,
              description: description,
              completed: item.completed,
              hue: hue,
              faceId: page,
            };
          })
          .reverse(), // 配列の順序を逆にして古い順に
      ]);
    } catch (error) {
      // console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (title: string, description: string = "") => {
    setLoading(true);
    try {
      const response = await fetch("/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userID,
          title: title,
          description: description,
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // ローカル状態を更新（refetchしない）
      fetchData();
    } catch (error) {
      // console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (item: Item) => {
    setLoading(true);
    try {
      const response = await fetch(`/todos/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...item,
          completed: !item.completed,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // ローカル状態を更新（refetchしない）
      setItems((prev) =>
        prev.map((prevItem) =>
          prevItem.id === item.id
            ? { ...prevItem, completed: !prevItem.completed }
            : prevItem
        )
      );
    } catch (error) {
      // console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (item: Item) => {
    setLoading(true);
    try {
      const response = await fetch(`/todos/${item.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      // console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    fetchData,
    addItem,
    toggleItem,
    deleteItem,
  };
}
