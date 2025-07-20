import { createSignal } from "solid-js";
import { cowPrograms } from "../cowPrograms";
import { runCowInterpreter } from "../cowInterpreter";

interface Item {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  hue: number;
  faceId: number; // 面のID (0-5)
}

interface ItemResponse {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  face_id: number;
}

export function useTodosFace() {
  const [allItems, setAllItems] = createSignal<Item[]>([]);
  const [loading, setLoading] = createSignal<boolean>(false);
  const userID = 2;

  // 特定の面のアイテムを取得
  const getItemsByFace = (faceId: number) => {
    return allItems().filter(item => item.faceId === faceId);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/todos");
      const data = await response.json();
      
      setAllItems(
        data
          .map((item: ItemResponse) => {
            const description = item.description || "";
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
              faceId: page || 0, // デフォルトは面0
            };
          })
          .reverse()
      );
    } catch (error) {
      console.error("Error fetching todos:", error);
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

      await fetchData();
    } catch (error) {
      console.error("Error:", error);
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
          face_id: item.faceId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setAllItems((prev) =>
        prev.map((prevItem) =>
          prevItem.id === item.id
            ? { ...prevItem, completed: !prevItem.completed }
            : prevItem
        )
      );
    } catch (error) {
      console.error("Error:", error);
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

      setAllItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    allItems,
    getItemsByFace,
    loading,
    fetchData,
    addItem,
    toggleItem,
    deleteItem,
  };
} 