import { createSignal, onMount, type Component } from "solid-js";
import { createStore } from "solid-js/store";
import rough from "roughjs/bundled/rough.esm.js";
// UI components
import HanddrawnTabs from "./components/ui/HanddrawnTabs";
import HanddrawnSpeechBubble from "./components/ui/HanddrawnSpeechBubble";
import HanddrawnCheckbox from "./components/ui/HanddrawnCheckbox";
import HanddrawnIconButton from "./components/ui/HanddrawnIconButton";
// Task components
import HanddrawnTaskCard from "./components/task/HanddrawnTaskCard";
import HanddrawnTaskDetail from "./components/task/HanddrawnTaskDetail";
// Progress components
import HanddrawnProgressDisplay from "./components/progress/HanddrawnProgressDisplay";
// Animation components
import DragArrowTrail from "./components/animation/DragArrowTrail";
import DrawingAnimation from "./components/animation/DrawingAnimation";
import { useTodos } from "./hooks/useTodos";
import styles from "./App.module.css";
import { runCowInterpreter } from "./cowInterpreter";
import { cowPrograms } from "./cowPrograms";
import { ScratchToReveal } from "./components/magicui/scratch-to-reveal";

const App: Component = () => {
  const [newItem, setNewItem] = createSignal<string>("");
  const [newItemDetail, setNewItemDetail] = createSignal<string>("");
  const [category, setCategory] = createSignal<string>("すべて");
  const [error, setError] = createSignal<string>("");
  const [showInput, setShowInput] = createSignal(false);
  const [showProgress, setShowProgress] = createSignal(true);
  const [selectedTaskId, setSelectedTaskId] = createSignal<number | null>(null);
  const [backgroundColor, setBackgroundColor] = createSignal<string>("#282c34");
  let svgRef: SVGSVGElement | undefined;

  // useTodosフックから基本的なCRUD操作を取得
  const {
    items: baseItems,
    loading,
    fetchData,
    addItem: baseAddItem,
    toggleItem: baseToggleItem,
    deleteItem: baseDeleteItem,
  } = useTodos();

  // 基本アイテムをそのまま使用（priorityフィールドを削除）
  const items = () => baseItems();

  // タスクIDごとのランダム座標を保持
  const [positions, setPositions] = createStore<
    Record<number, { top: number; left: number }>
  >({});
  // ドラッグ&ドロップ状態
  const [dragState, setDragState] = createSignal<{
    isActive: boolean;
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
    taskId?: number;
    offset?: { x: number; y: number };
  }>({ isActive: false, startPoint: { x: 0, y: 0 }, endPoint: { x: 0, y: 0 } });
  // アニメーション状態
  const [animationState, setAnimationState] = createSignal<{
    isActive: boolean;
    targetPosition: { x: number; y: number };
  }>({ isActive: false, targetPosition: { x: 0, y: 0 } });

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
    fetchData();
  });

  const addItem = async () => {
    const result = runCowInterpreter(cowPrograms, newItem());
    // console.log("Cow Interpreter Output:", result);
    // console.log("Cow Interpreter Result length:", result.length);
    // console.log(
    //   "Cow Interpreter Result bytes:",
    //   Array.from(result).map((c: string) => c.charCodeAt(0))
    // );
    // console.log(
    //   "Cow Interpreter Result hex:",
    //   Array.from(result).map((c: string) => "0x" + c.charCodeAt(0).toString(16))
    // );
    const hue = result[0].charCodeAt(0);
    const hsl = `hsl(${result[0].charCodeAt(0)}, 90%, 85%)`;
    console.log(`hsl(${result[0].charCodeAt(0)}, 90%, 85%)`);
    setBackgroundColor(hsl);

    if (!newItem().trim()) {
      setError("タスク名を入力してください");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // アニメーションの準備
    const id = items().length + 1;
    const newPosition = {
      top: Math.floor(Math.random() * 500),
      left: Math.floor(Math.random() * 400),
    };
    setPositions(id, newPosition);

    // アニメーションを開始
    const rect = document
      .querySelector(".main-container")
      ?.getBoundingClientRect();
    const targetX = (rect?.left || 0) + newPosition.left + 75;
    const targetY = (rect?.top || 0) + newPosition.top + 75;

    setAnimationState({
      isActive: true,
      targetPosition: { x: targetX, y: targetY },
    });

    // APIを通じてアイテムを追加（titleとdescriptionを分けて送信）
    await baseAddItem(newItem(), newItemDetail());
  };

  const toggleItem = async (id: number) => {
    const item = baseItems().find((item) => item.id === id);
    if (item) {
      await baseToggleItem(item);
    }
  };

  const deleteItem = async (id: number) => {
    const item = baseItems().find((item) => item.id === id);
    if (item) {
      await baseDeleteItem(item);
    }
  };

  // カテゴリでフィルタリング
  const filteredItems = () => {
    if (category() === "未完了")
      return items().filter((item) => !item.completed);
    if (category() === "完了") return items().filter((item) => item.completed);
    return items();
  };

  // 進捗計算（リアクティブ）
  const totalTasks = () => items().length;
  const completedTasks = () => items().filter((item) => item.completed).length;

  // 選択されたタスクを動的に取得（リアクティブ）
  const selectedTask = () => {
    const taskId = selectedTaskId();
    const task = taskId
      ? items().find((item) => item.id === taskId) || null
      : null;
    if (task) {
      // console.log("Selected task:", task);
      // console.log("Task description:", task.description);
    }
    return task;
  };

  // ドラッグ&ドロップハンドラー
  const handleDragStart = (taskId: number, initialMouseEvent: MouseEvent) => {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    const mainContainer = document.querySelector(".main-container");

    if (taskElement && mainContainer) {
      const taskRect = taskElement.getBoundingClientRect();
      const containerRect = mainContainer.getBoundingClientRect();

      // 現在のタスクの位置（コンテナ相対）を取得
      const currentPosition = positions[taskId];
      if (!currentPosition) return;

      // マウスカーソルとタスクカードの左上角との相対位置を計算（現在の位置ベース）
      const offsetX =
        initialMouseEvent.clientX - (containerRect.left + currentPosition.left);
      const offsetY =
        initialMouseEvent.clientY - (containerRect.top + currentPosition.top);

      setDragState({
        isActive: true,
        startPoint: {
          x: taskRect.left + taskRect.width / 2,
          y: taskRect.top + taskRect.height / 2,
        },
        endPoint: {
          x: initialMouseEvent.clientX,
          y: initialMouseEvent.clientY,
        },
        taskId,
        offset: { x: offsetX, y: offsetY },
      });

      // マウス移動を追跡
      const handleMouseMove = (e: MouseEvent) => {
        setDragState((prev) => ({
          ...prev,
          endPoint: { x: e.clientX, y: e.clientY },
        }));

        // タスクの位置を更新（オフセットを考慮）
        const newLeft = e.clientX - containerRect.left - offsetX;
        const newTop = e.clientY - containerRect.top - offsetY;

        setPositions(taskId, {
          top: Math.max(0, Math.min(500, newTop)),
          left: Math.max(0, Math.min(400, newLeft)),
        });
      };

      const handleMouseUp = () => {
        setDragState((prev) => ({ ...prev, isActive: false }));
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleDragEnd = () => {
    setDragState((prev) => ({ ...prev, isActive: false }));
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        margin: "40px auto",
        "max-width": "1200px",
      }}
    >
      {/* 進捗表示サイドパネル */}
      {showProgress() && (
        <div
          style={{
            position: "fixed",
            left: "20px",
            top: "20px",
            "z-index": 1000,
            background: "rgba(255, 251, 231, 0.95)",
            "border-radius": "12px",
            padding: "10px",
            "box-shadow": "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <HanddrawnProgressDisplay
            totalTasks={totalTasks()}
            completedTasks={completedTasks()}
            onClose={() => setShowProgress(false)}
          />
        </div>
      )}

      {/* メインTodoアプリ */}
      <div
        class="main-container"
        style={{
          position: "relative",
          width: "600px",
          height: "800px",
          margin: "0 auto",
        }}
      >
        <svg
          ref={(el) => (svgRef = el)}
          width={600}
          height={800}
          style={{ position: "absolute", top: 0, left: 0, "z-index": 0 }}
        />
        <div style={{ position: "relative", "z-index": 1, padding: "20px" }}>
          <HanddrawnSpeechBubble
            message={error()}
            visible={!!error()}
            onClose={() => setError("")}
          />

          {/* 進捗表示トグルボタン */}
          {!showProgress() && (
            <button
              style={{
                position: "fixed",
                top: "20px",
                left: "20px",
                background: "#e67e22",
                color: "white",
                border: "none",
                "border-radius": "8px",
                padding: "8px 12px",
                cursor: "pointer",
                "z-index": 1000,
                "font-weight": "bold",
              }}
              onClick={() => setShowProgress(true)}
              title="進捗表示を開く"
            >
              📊 進捗
            </button>
          )}

          <HanddrawnTabs
            tabs={["すべて", "未完了", "完了"]}
            selected={category()}
            onSelect={setCategory}
          />

          <div style={{ position: "relative" }}>
            <h1>Todo List</h1>
          </div>

          {/* タスクカード配置エリア */}
          <div
            style={{
              position: "absolute",
              top: "70px",
              left: "20px",
              width: "560px",
              height: "650px",
            }}
          >
            {filteredItems().map((item) => {
              // 既存の位置を参照、なければ初期化
              let pos = positions[item.id];
              if (!pos) {
                pos = {
                  top: Math.floor(Math.random() * 500),
                  left: Math.floor(Math.random() * 400),
                };
                setPositions(item.id, pos);
              }
              return (
                <div
                  data-task-id={item.id}
                  style={{
                    position: "absolute",
                    top: `${pos.top}px`,
                    left: `${pos.left}px`,
                    "z-index": item.id,
                  }}
                >
                  <HanddrawnTaskCard
                    name={item.title}
                    completed={item.completed}
                    hue={item.hue}
                    priority="medium"
                    onDragStart={(e) => handleDragStart(item.id, e)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedTaskId(item.id)}
                  >
                    {[
                      <HanddrawnCheckbox
                        checked={item.completed}
                        onChange={() => toggleItem(item.id)}
                      />,
                      <HanddrawnIconButton
                        icon="x"
                        onClick={() => deleteItem(item.id)}
                        title="削除"
                      />,
                    ]}
                  </HanddrawnTaskCard>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ドラッグ時の軌跡表示 */}
      <DragArrowTrail
        isVisible={dragState().isActive}
        startPoint={dragState().startPoint}
        endPoint={dragState().endPoint}
      />

      {/* タスク追加時のアニメーション */}
      <DrawingAnimation
        isVisible={animationState().isActive}
        targetPosition={animationState().targetPosition}
        onAnimationComplete={() =>
          setAnimationState((prev) => ({ ...prev, isActive: false }))
        }
      />

      {/* タスク詳細表示 */}
      {selectedTask() && (
        <HanddrawnTaskDetail
          id={selectedTask()!.id}
          name={selectedTask()!.title}
          detail={selectedTask()!.description}
          completed={selectedTask()!.completed}
          priority="medium"
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* フローティングボタンと入力欄 - Rough.js要素の外部に配置 */}
      <HanddrawnIconButton
        icon="plus"
        onClick={() => setShowInput(true)}
        title="追加"
        size={48}
        class={styles.fab}
      />
      {showInput() && (
        <div
          class={styles.fabInputOverlay}
          onClick={() => {
            setShowInput(false);
            setNewItem("");
            setNewItemDetail("");
          }}
        >
          <div
            class={styles.fabInputPopup}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={(el) => setTimeout(() => el?.focus(), 0)}
              type="text"
              value={newItem()}
              onInput={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  addItem();
                  setShowInput(false);
                }
              }}
              placeholder="タスク名を入力"
            />
            <textarea
              value={newItemDetail()}
              onInput={(e) => setNewItemDetail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  addItem();
                  setShowInput(false);
                }
              }}
              placeholder="詳細を入力（任意）"
              style={{
                width: "100%",
                height: "80px",
                "margin-top": "8px",
                padding: "8px",
                border: "2px solid #ddd",
                "border-radius": "4px",
                "font-family": "inherit",
                "font-size": "14px",
                resize: "none",
              }}
            />
            <div
              style={{
                "margin-top": "8px",
                "font-size": "12px",
                color: "#666",
              }}
            >
              Cmd+Enter で追加
            </div>
            <button
              onClick={() => {
                addItem();
                setShowInput(false);
              }}
              disabled={loading()}
            >
              {loading() ? "追加中..." : "追加"}
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
          "z-index": 500,
        }}
      >
        <div
          style={{
            width: "400px",
            height: "600px",
            position: "relative",
            background:
              "radial-gradient(circle, rgba(224, 0, 50, 1) 0%, rgba(253, 2, 52, 1) 78%, rgba(214, 1, 51, 1) 100%)",
            "box-shadow": "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            display: "flex",
            "justify-content": "center",
            "align-items": "center",
            "border-radius": "12px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100%",
              transform: "translate(-50%, -200px)",
              "text-align": "center",
              color: "white",
              "font-weight": "bold",
              "font-size": "24px",
              "z-index": 1000,
              display: "flex",
              "flex-direction": "column",
              "align-items": "center",
              "justify-content": "center",
              "line-height": "1",
              "pointer-events": "none",
            }}
          >
            <span
              style={{
                "font-size": "32px",
                color: "#000",
                "font-weight": "bold",
                "-webkit-text-stroke-width": "12px",
                "-webkit-text-stroke-color": "#000",
                "font-family": "NotoSansJP",
              }}
            >
              ToDo
            </span>
            <span
              style={{
                "font-size": "48px",
                color: "black",
                "font-weight": "bold",
                "-webkit-text-stroke-width": "20px",
                "-webkit-text-stroke-color": "black",
                "font-family": "NotoSansJP",
              }}
            >
              スクラッチ
            </span>
            <span
              style={{
                "font-size": "40px",
                color: "#000",
                "font-weight": "bold",
                "-webkit-text-stroke-width": "12px",
                "-webkit-text-stroke-color": "#000",
                "font-family": "NotoSansJP",
              }}
            >
              くじ
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100%",
              transform: "translate(-50%, -200px)",
              "text-align": "center",
              color: "white",
              "font-weight": "bold",
              "font-size": "24px",
              "z-index": 1000,
              display: "flex",
              "flex-direction": "column",
              "align-items": "center",
              "justify-content": "center",
              "line-height": "1",
              "pointer-events": "none",
            }}
          >
            <span
              style={{
                "font-size": "32px",
                color: "#fff",
                "font-weight": "bold",
                "-webkit-text-stroke-width": "10px",
                "-webkit-text-stroke-color": "#fff",
                "font-family": "NotoSansJP",
              }}
            >
              ToDo
            </span>
            <span
              style={{
                "font-size": "48px",
                color: "black",
                "font-weight": "bold",
                "-webkit-text-stroke-width": "20px",
                "-webkit-text-stroke-color": "black",
                "font-family": "NotoSansJP",
              }}
            >
              スクラッチ
            </span>
            <span
              style={{
                "font-size": "40px",
                color: "#fff",
                "font-weight": "bold",
                "-webkit-text-stroke-width": "10px",
                "-webkit-text-stroke-color": "#fff",
                "font-family": "NotoSansJP",
              }}
            >
              くじ
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100%",
              transform: "translate(-50%, -200px)",
              "text-align": "center",
              color: "white",
              "font-weight": "bold",
              "font-size": "24px",
              "z-index": 1000,
              display: "flex",
              "flex-direction": "column",
              "align-items": "center",
              "justify-content": "center",
              "line-height": "1",
              "pointer-events": "none",
            }}
          >
            <span
              style={{
                "font-size": "32px",
                color: "red",
                "font-weight": "bold",
                "-webkit-text-stroke-width": "2px",
                "-webkit-text-stroke-color": "red",
                "font-family": "NotoSansJP",
              }}
            >
              ToDo
            </span>
            <span
              style={{
                "font-size": "48px",
                color: "white",
                "-webkit-text-stroke-width": "3px",
                "-webkit-text-stroke-color": "white",
                "font-family": "NotoSansJP",
              }}
            >
              スクラッチ
            </span>
            <span
              style={{
                "font-size": "40px",
                color: "red",
                "font-weight": "bold",
                "-webkit-text-stroke-width": "2px",
                "-webkit-text-stroke-color": "red",
                "font-family": "NotoSansJP",
              }}
            >
              くじ
            </span>
          </div>
          <div
            style={{
              width: "300px",
              height: "300px",
              position: "relative",
              "clip-path": `
                polygon(
                  50% 0%,  57% 15%,  70% 0%,  76% 18%,
                  92% 8%,  85% 26%, 100% 30%, 88% 42%,
                  100% 50%, 88% 58%, 100% 70%, 85% 74%,
                  92% 92%, 76% 82%, 70% 100%, 57% 85%,
                  50% 100%, 43% 85%, 30% 100%, 24% 82%,
                  8% 92%, 15% 74%, 0% 70%, 12% 58%,
                  0% 50%, 12% 42%, 0% 30%, 15% 26%,
                  8% 8%, 24% 18%, 30% 0%, 43% 15%
                )
              `,
            }}
          >
            <ScratchToReveal
              width={300}
              height={300}
              minScratchPercentage={30}
              gradientColors={["#B8B8B8", "#E1DEE2", "#B8B8B8"]}
            >
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  "justify-content": "center",
                  "align-items": "center",
                  "font-size": "60px",
                  background: "white",
                }}
              >
                2等
                <br />
                あたり
              </div>
            </ScratchToReveal>
          </div>
        </div>
      </div>
      <canvas
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          "z-index": 1,
          "pointer-events": "auto",
        }}
        width={window.innerWidth}
        height={window.innerHeight}
        class="zdog-canvas"
      ></canvas>
    </div>
  );
};

export default App;
