import { createSignal, onMount, type Component } from "solid-js";

import styles from "./App.module.css";

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

const App: Component = () => {
  const [items, setItems] = createSignal<Item[]>([]);
  const [newItem, setNewItem] = createSignal<string>("");
  const [loading, setLoading] = createSignal<boolean>(false);
  const userID = 2;

  const fetchData = async () => {
    setLoading(true);
    // APIからデータを取得し、itemsに追加
    await fetch("/todos")
      .then((response) => response.json())
      .then((data) => {
        console.log("data:", data);
        setItems([
          ...data.map((item: ItemResponse) => ({
            id: item.id,
            title: item.title,
            description: item.description.String,
            completed: item.completed.Bool,
          })),
        ]);
        // TODO: レスポンスが治ったらもどす
        // setItems([...data]);
      });
    setLoading(false);
  };

  onMount(() => {
    fetchData();
  });

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

      const newItemData = await response.json();

      // ローカル状態を更新（refetchしない）
      setItems((prev) => [
        ...prev,
        {
          id: newItemData.id,
          title: newItemData.title,
          description: newItemData.description.String,
          completed: newItemData.completed.Bool,
        },
      ]);
      setNewItem("");
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = (item: Item) => {
    setLoading(true);
    fetch(`/todos/${item.id}`, {
      method: "DELETE",
    })
      .then(() => {
        setItems(items().filter((i) => i.id !== item.id));
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
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

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <h1>Todo List</h1>

        <ul>
          {items().map((item) => (
            <li>
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item)}
              />
              <span>{item.title}</span>
              <span> / </span>
              <span>{item.description}</span>
              <button onClick={() => deleteItem(item)}>Delete</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={newItem()}
          onInput={(e) => setNewItem(e.target.value)}
        />
        <button onClick={() => addItem(newItem())}>Add</button>
      </header>
    </div>
  );
};

export default App;
