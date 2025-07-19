import { createSignal, onMount, type Component } from "solid-js";
import { useTodos } from "./hooks/useTodos";
import styles from "./App.module.css";

interface Item {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

const App: Component = () => {
  const [newItem, setNewItem] = createSignal<string>("");
  const { items, loading, fetchData, addItem, toggleItem, deleteItem } =
    useTodos();

  onMount(() => {
    fetchData();
  });

  const handleAddItem = async () => {
    if (newItem().trim()) {
      await addItem(newItem());
      setNewItem("");
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
        <button onClick={handleAddItem} disabled={loading()}>
          {loading() ? "Adding..." : "Add"}
        </button>
      </header>
    </div>
  );
};

export default App;
