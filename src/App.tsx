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

import styles from "./App.module.css";

interface Item {
  id: number;
  name: string;
  detail: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
}

const App: Component = () => {
  const [items, setItems] = createSignal<Item[]>([]);
  const [newItem, setNewItem] = createSignal<string>("");
  const [newItemDetail, setNewItemDetail] = createSignal<string>("");
  const [category, setCategory] = createSignal<string>("すべて");
  const [error, setError] = createSignal<string>("");
  const [showInput, setShowInput] = createSignal(false);
  const [showProgress, setShowProgress] = createSignal(true);
  const [selectedTaskId, setSelectedTaskId] = createSignal<number | null>(null);
  let svgRef: SVGSVGElement | undefined;
  // タスクIDごとのランダム座標を保持
  const [positions, setPositions] = createStore<Record<number, {top: number, left: number}>>({});
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
  });

  const addItem = () => {
    if (!newItem().trim()) {
      setError("タスク名を入力してください");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    const id = items().length + 1;
    // 位置を新規生成（タブ領域を除外）
    const newPosition = {
      top: Math.floor(Math.random() * 500), // タブ領域下から配置
      left: Math.floor(Math.random() * 400),
    };
    setPositions(id, newPosition);
    
    // アニメーションを開始
    const rect = document.querySelector('.main-container')?.getBoundingClientRect();
    const targetX = (rect?.left || 0) + newPosition.left + 75; // カードの中心
    const targetY = (rect?.top || 0) + newPosition.top + 75;
    
    setAnimationState({
      isActive: true,
      targetPosition: { x: targetX, y: targetY }
    });
    
    // アイテムを追加（少し遅延）
    setTimeout(() => {
      setItems((prev) => [
        ...prev,
        { id, name: newItem(), detail: newItemDetail(), completed: false, priority: "medium" },
      ]);
      setNewItem("");
      setNewItemDetail("");
    }, 400);
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

  // 進捗計算（リアクティブ）
  const totalTasks = () => items().length;
  const completedTasks = () => items().filter(item => item.completed).length;
  
  // 選択されたタスクを動的に取得（リアクティブ）
  const selectedTask = () => {
    const taskId = selectedTaskId();
    return taskId ? items().find(item => item.id === taskId) || null : null;
  };

  // ドラッグ&ドロップハンドラー
  const handleDragStart = (taskId: number, initialMouseEvent: MouseEvent) => {
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    const mainContainer = document.querySelector('.main-container');
    
    if (taskElement && mainContainer) {
      const taskRect = taskElement.getBoundingClientRect();
      const containerRect = mainContainer.getBoundingClientRect();
      
      // 現在のタスクの位置（コンテナ相対）を取得
      const currentPosition = positions[taskId];
      if (!currentPosition) return;
      
      // マウスカーソルとタスクカードの左上角との相対位置を計算（現在の位置ベース）
      const offsetX = initialMouseEvent.clientX - (containerRect.left + currentPosition.left);
      const offsetY = initialMouseEvent.clientY - (containerRect.top + currentPosition.top);
      
      setDragState({
        isActive: true,
        startPoint: { x: taskRect.left + taskRect.width / 2, y: taskRect.top + taskRect.height / 2 },
        endPoint: { x: initialMouseEvent.clientX, y: initialMouseEvent.clientY },
        taskId,
        offset: { x: offsetX, y: offsetY }
      });
      
      // マウス移動を追跡
      const handleMouseMove = (e: MouseEvent) => {
        setDragState(prev => ({
          ...prev,
          endPoint: { x: e.clientX, y: e.clientY }
        }));
        
        // タスクの位置を更新（オフセットを考慮）
        const newLeft = e.clientX - containerRect.left - offsetX;
        const newTop = e.clientY - containerRect.top - offsetY;
        
        setPositions(taskId, {
          top: Math.max(0, Math.min(500, newTop)), // タブ領域下に制限
          left: Math.max(0, Math.min(400, newLeft))
        });
      };
      
      const handleMouseUp = () => {
        setDragState(prev => ({ ...prev, isActive: false }));
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleDragEnd = () => {
    setDragState(prev => ({ ...prev, isActive: false }));
  };

  return (
    <div style={{ display: "flex", gap: "20px", margin: "40px auto", "max-width": "1200px" }}>
      {/* 進捗表示サイドパネル */}
      {showProgress() && (
        <div style={{ 
          position: "fixed", 
          left: "20px", 
          top: "20px", 
          'z-index': 1000,
          background: "rgba(255, 251, 231, 0.95)",
          "border-radius": "12px",
          padding: "10px",
          "box-shadow": "0 4px 12px rgba(0, 0, 0, 0.15)"
        }}>
          <HanddrawnProgressDisplay 
            totalTasks={totalTasks()} 
            completedTasks={completedTasks()}
            onClose={() => setShowProgress(false)}
          />
        </div>
      )}
      
      {/* メインTodoアプリ */}
      <div class="main-container" style={{ position: "relative", width: "600px", height: "800px", margin: "0 auto" }}>
        <svg
          ref={el => svgRef = el}
          width={600}
          height={800}
          style={{ position: "absolute", top: 0, left: 0, 'z-index': 0 }}
        />
        <div style={{ position: "relative", 'z-index': 1, padding: "20px" }}>
          <HanddrawnSpeechBubble message={error()} visible={!!error()} onClose={() => setError("")} />
          
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
                'z-index': 1000,
                "font-weight": "bold"
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
        <div style={{ position: "absolute", top: "70px", left: "20px", width: "560px", height: "650px" }}>
            {filteredItems().map((item) => {
              // 既存の位置を参照、なければ初期化
              let pos = positions[item.id];
              if (!pos) {
                pos = {
                  top: Math.floor(Math.random() * 500), // タブ領域下から配置
                  left: Math.floor(Math.random() * 400),
                };
                setPositions(item.id, pos);
              }
              return (
                <div 
                  data-task-id={item.id}
                  style={{ position: "absolute", top: `${pos.top}px`, left: `${pos.left}px`, "z-index": item.id }}
                >
                  <HanddrawnTaskCard
                    name={item.name}
                    completed={item.completed}
                    priority={item.priority}
                    onDragStart={(e) => handleDragStart(item.id, e)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelectedTaskId(item.id)}
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
        onAnimationComplete={() => setAnimationState(prev => ({ ...prev, isActive: false }))}
      />
      
      {/* タスク詳細表示 */}
      {selectedTask() && (
        <HanddrawnTaskDetail
          id={selectedTask()!.id}
          name={selectedTask()!.name}
          detail={selectedTask()!.detail}
          completed={selectedTask()!.completed}
          priority={selectedTask()!.priority}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* フローティングボタンと入力欄 - Rough.js要素の外部に配置 */}
      <HanddrawnIconButton icon="plus" onClick={() => setShowInput(true)} title="追加" size={48} class={styles.fab} />
      {showInput() && (
        <div class={styles.fabInputOverlay} onClick={() => { setShowInput(false); setNewItem(""); setNewItemDetail(""); }}>
          <div class={styles.fabInputPopup} onClick={e => e.stopPropagation()}>
            <input
              ref={el => setTimeout(() => el?.focus(), 0)}
              type="text"
              value={newItem()}
              onInput={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
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
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
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
                resize: "none"
              }}
            />
            <div style={{ "margin-top": "8px", "font-size": "12px", color: "#666" }}>
              Cmd+Enter で追加
            </div>
            <button onClick={() => { addItem(); setShowInput(false); }}>追加</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
