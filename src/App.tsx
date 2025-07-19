import { createSignal, type Component, onMount } from "solid-js";
import { runCowInterpreter } from "./cowInterpreter";
import { cowPrograms } from "./cowPrograms";
import styles from "./App.module.css";

interface Item {
  id: number;
  name: string;
  completed: boolean;
}

const App: Component = () => {
  // Copy on Write (COW) pattern: Create new state objects instead of mutating
  const [items, setItems] = createSignal<Item[]>([]);
  const [newItem, setNewItem] = createSignal<string>("");

  // COW Interpreter for dynamic UI effects
  const [cowOutput, setCowOutput] = createSignal<string>("");
  const [cowPattern, setCowPattern] = createSignal<string>("");
  const [backgroundColor, setBackgroundColor] = createSignal<string>("#282c34");

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: newItem(),
        completed: false,
      },
    ]);
    setNewItem("");

    const result = runCowInterpreter(cowPrograms, ["5", "8"]);
    console.log("Cow Interpreter Output:", result);
    console.log("Cow Interpreter Result length:", result.length);
    console.log(
      "Cow Interpreter Result bytes:",
      Array.from(result).map((c: string) => c.charCodeAt(0))
    );
    console.log(
      "Cow Interpreter Result hex:",
      Array.from(result).map((c: string) => "0x" + c.charCodeAt(0).toString(16))
    );
    setCowOutput(result);
  };

  const deleteItem = (id: number) => {
    // COW: Create new filtered array instead of mutating
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleItem = (id: number) => {
    // COW: Create new array with updated item instead of mutating
    setItems((prev) =>
      prev.map(
        (item) =>
          item.id === id
            ? { ...item, completed: !item.completed } // Create new item object with updated completed state
            : item // Keep existing item unchanged
      )
    );
  };

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <div class={styles.headerContent}>
          <h1>Todo List</h1>
          <div class={styles.headerContentRight}>
            <button onClick={() => setBackgroundColor(backgroundColor)}>
              Default
            </button>
          </div>
        </div>

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

        {/* Cow Interpreter Output */}
        <div class={styles.cowOutput}>
          <h3>Cow Interpreter Output:</h3>
          <pre>{cowOutput() || "No output yet"}</pre>
        </div>
      </header>
    </div>
  );
};

export default App;
