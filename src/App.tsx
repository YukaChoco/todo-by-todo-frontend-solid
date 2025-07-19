import { createSignal, onMount, type Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";

interface Item {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const App: Component = () => {
  const [items, setItems] = createSignal<Item[]>([]);
  const [newItem, setNewItem] = createSignal<string>("");
  const [loading, setLoading] = createSignal<boolean>(false);
  const userID = 2;

  onMount(() => {
    const fetchData = async () => {
      setLoading(true);
      // APIからデータを取得し、itemsに追加
      await fetch("/todos")
        .then((response) => response.json())
        .then((data) => {
          setItems([...data]);
        });
      setLoading(false);
    };
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
    }).then((response) => {
      console.log("response:", response);
      // TODO: refetch
      setItems((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          title: inputText,
          description: inputText,
          completed: false,
        },
      ]);
      setNewItem("");
      setLoading(false);
    });
  };

  const deleteItem = (id: number) => {
    setItems(items().filter((item) => item.id !== id));
  };

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
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
                onChange={() => toggleItem(item.id)}
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
