import { createSignal, type Component } from "solid-js";

import logo from "./logo.svg";
import styles from "./App.module.css";

interface Item {
  id: number;
  name: string;
  completed: boolean;
}

const App: Component = () => {
  const [items, setItems] = createSignal<Item[]>([]);
  const [newItem, setNewItem] = createSignal<string>("");

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: prev.length + 1, name: newItem(), completed: false },
    ]);
    setNewItem("");
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
              <span>{item.name}</span>
              <button onClick={() => deleteItem(item.id)}>Delete</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={newItem()}
          onInput={(e) => setNewItem(e.target.value)}
        />
        <button onClick={addItem}>Add</button>
      </header>
    </div>
  );
};

export default App;
