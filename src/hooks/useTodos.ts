import { createSignal } from "solid-js";

interface Item {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

// TODO: レスポンスが治ったらもどす
interface ItemResponse {
  id: number;
  title: string;
  description: {
    String: string;
  };
  completed: {
    Bool: boolean;
  };
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
      console.log("data:", data);
      setItems([
        ...data.map((item: ItemResponse) => ({
          id: item.id,
          title: item.title,
          description: item.description.String,
          completed: item.completed.Bool,
        })),
      ]);
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (inputText: string) => {
    setLoading(true);
    try {
      const response = await fetch("/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userID,
          title: inputText,
          description: inputText,
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // ローカル状態を更新（refetchしない）
      fetchData();
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

      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      console.error("Error:", error);
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
