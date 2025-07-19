import { createSignal, onMount, type Component } from "solid-js";
import { createStore } from "solid-js/store";
import rough from "roughjs/bundled/rough.esm.js";
import HanddrawnTabs from "./components/HanddrawnTabs";
import HanddrawnSpeechBubble from "./components/HanddrawnSpeechBubble";
import HanddrawnCheckbox from "./components/HanddrawnCheckbox";
import HanddrawnIconButton from "./components/HanddrawnIconButton";
import HanddrawnTaskCard from "./components/HanddrawnTaskCard";

import styles from "./App.module.css";

interface Item {
  id: number;
  name: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

const App: Component = () => {
  const [items, setItems] = createSignal<Item[]>([]);
  const [newItem, setNewItem] = createSignal<string>("");
  const [category, setCategory] = createSignal<string>("すべて");
  const [error, setError] = createSignal<string>("");
  const [showInput, setShowInput] = createSignal(false);
  let svgRef: SVGSVGElement | undefined;
  // タスクIDごとのランダム座標を保持
  const [positions, setPositions] = createStore<Record<number, {top: number, left: number}>>({});

  onMount(() => {
    if (svgRef) {
      const rc = rough.svg(svgRef);
      // ノート風の枠線を描画
      const node = rc.rectangle(5, 5, 590, 790, {
        stroke: "#222",
        strokeWidth: 2,
        fill: "#fffbe7",
        fillStyle: "solid",
        roughness: 2.2,
        bowing: 2.5,
      });
      svgRef.appendChild(node);
    }
  });

  const addItem = () => {
    if (!newItem().trim()) {
      setError("タスク名を入力してください");
      setTimeout(() => setError(""), 3000);
      return;
    }
    setItems((prev) => {
      const id = prev.length + 1;
      // 位置を新規生成
      if (!positions[id]) {
        setPositions(id, {
          top: Math.floor(Math.random() * 300),
          left: Math.floor(Math.random() * 500),
        });
      }
      return [
        ...prev,
        { id, name: newItem(), completed: false, priority: "medium" },
      ];
    });
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

  // カテゴリでフィルタリング
  const filteredItems = () => {
    if (category() === "未完了") return items().filter((item) => !item.completed);
    if (category() === "完了") return items().filter((item) => item.completed);
    return items();
  };

  return (
    <div style={{ position: "relative", width: "600px", height: "800px", margin: "40px auto" }}>
      <svg
        ref={el => svgRef = el}
        width={600}
        height={800}
        style={{ position: "absolute", top: 0, left: 0, 'z-index': 0 }}
      />
      <div style={{ position: "relative", 'z-index': 1 }}>
        <HanddrawnSpeechBubble message={error()} visible={!!error()} onClose={() => setError("")} />
        <HanddrawnTabs
          tabs={["すべて", "未完了", "完了"]}
          selected={category()}
          onSelect={setCategory}
        />
        <header class={styles.header} style={{ position: "relative", width: "100%", height: "400px" }}>
          <h1>Todo List</h1>
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            {filteredItems().map((item) => {
              // 既存の位置を参照、なければ初期化
              let pos = positions[item.id];
              if (!pos) {
                pos = {
                  top: Math.floor(Math.random() * 300),
                  left: Math.floor(Math.random() * 500),
                };
                setPositions(item.id, pos);
              }
              return (
                <div style={{ position: "absolute", top: `${pos.top}px`, left: `${pos.left}px` }}>
                  <HanddrawnTaskCard
                    name={item.name}
                    completed={item.completed}
                    priority={item.priority}
                  >
                    {[
                      <HanddrawnCheckbox
                        checked={item.completed}
                        onChange={() => toggleItem(item.id)}
                      />,
                      <HanddrawnIconButton icon="x" onClick={() => deleteItem(item.id)} title="削除" />
                    ]}
                  </HanddrawnTaskCard>
                </div>
              );
            })}
          </div>
        </header>
        {/* フローティングボタンと入力欄 */}
        <HanddrawnIconButton icon="plus" onClick={() => setShowInput(true)} title="追加" size={48} class={styles.fab} />
        {showInput() && (
          <div class={styles.fabInputOverlay} onClick={() => setShowInput(false)}>
            <div class={styles.fabInputPopup} onClick={e => e.stopPropagation()}>
              <input
                type="text"
                value={newItem()}
                onInput={(e) => setNewItem(e.target.value)}
                placeholder="新しいタスクを入力"
              />
              <button onClick={() => { addItem(); setShowInput(false); }}>追加</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
