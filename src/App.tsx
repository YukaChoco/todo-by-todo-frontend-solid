import { createSignal, onMount, type Component } from "solid-js";

import styles from "./App.module.css";

interface Item {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

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

  const addItem = (inputText: string) => {
    setLoading(true);
    fetch("/todos", {
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
    })
      .then((response) => {
        console.log("response:", response);
        fetchData();
        setNewItem("");
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
  };

  const deleteItem = (id: number) => {
    setItems(items().filter((item) => item.id !== id));
  };

  const toggleItem = (item: Item) => {
    setLoading(true);
    fetch(`/todos/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...item,
        completed: !item.completed,
      }),
    })
      .then(() => {
        fetchData();
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false);
      });
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
              <button onClick={() => deleteItem(item.id)}>Delete</button>
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
