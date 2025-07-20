import { onMount, onCleanup, createSignal, createEffect, For } from "solid-js";
import { render } from "solid-js/web";
import { JSX } from "solid-js/jsx-runtime";
import * as THREE from "three";
import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer.js";
import CubeFace from "./CubeFace";
import { useTodosFace } from "../../hooks/useTodosFace";
import HanddrawnProgressDisplay from "../progress/HanddrawnProgressDisplay";
import HanddrawnTaskDetail from "../task/HanddrawnTaskDetail";
import { runCowInterpreter } from "../../cowInterpreter";
import { cowPrograms } from "../../cowPrograms";
import styles from "./CubeScene.module.css";

export default function CubeScene(): JSX.Element {
  let containerRef: HTMLDivElement | undefined;
  let renderer: CSS3DRenderer;
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let cube: THREE.Group;
  let faceElements: HTMLDivElement[] = [];
  
  const [isRotating, setIsRotating] = createSignal(false);
  const [showProgress, setShowProgress] = createSignal(true);
  const [selectedTaskId, setSelectedTaskId] = createSignal<number | null>(null);
  
  // フローティングボタン用の状態
  const [showInput, setShowInput] = createSignal(false);
  const [newItem, setNewItem] = createSignal<string>("");
  const [newItemDetail, setNewItemDetail] = createSignal<string>("");
  const [error, setError] = createSignal<string>("");

  // Todo管理フック
  const {
    allItems,
    getItemsByFace,
    loading,
    fetchData,
    addItem,
    toggleItem,
    deleteItem,
  } = useTodosFace();

  // 進捗計算
  const totalTasks = () => allItems().length;
  const completedTasks = () => allItems().filter((item) => item.completed).length;

  // 選択されたタスクを取得
  const selectedTask = () => {
    const taskId = selectedTaskId();
    return taskId ? allItems().find((item) => item.id === taskId) || null : null;
  };

  // CubeFace用の拡張されたハンドラー
  const handleTaskClick = (taskId: number) => {
    setSelectedTaskId(taskId);
  };

  // タスク追加処理
  const handleAddTask = async () => {
    const result = runCowInterpreter(cowPrograms, newItem());

    if (!newItem().trim()) {
      setError("タスク名を入力してください");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // APIを通じてアイテムを追加（ページは自動判定）
    await addItem(newItem(), newItemDetail());
    
    // フォームをリセット
    setNewItem("");
    setNewItemDetail("");
    setShowInput(false);
    setError("");
  };

  // キーボードイベントハンドラー
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAddTask();
    }
  };

  // 立方体の面のラベル
  const faceLabels = [
    "1", // 前面
    "2", // 右面  
    "3", // 後面
    "4", // 左面
    "5", // 上面
    "6", // 下面
  ];



  onMount(() => {
    if (!containerRef) return;

    // シーンの初期化
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    camera.position.set(0, 0, 1500);

    // CSS3Dレンダラーの設定
    renderer = new CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.appendChild(renderer.domElement);

    // 立方体グループの作成
    cube = new THREE.Group();
    scene.add(cube);

    // 各面にCubeFaceコンポーネントを配置
    createCubeFaces();

    // 初期データの取得
    fetchData();

    // レンダリングループ
    animate();

    // ウィンドウリサイズ対応
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // マウスドラッグ操作
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (event: MouseEvent) => {
      // コマンドキーが押されている場合は立方体の回転を無効にする
      if (isRotating() || event.metaKey || event.ctrlKey) return;
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
      renderer.domElement.style.cursor = 'grabbing';
    };

    const handleMouseMove = (event: MouseEvent) => {
      // コマンドキーが押されている場合は立方体の回転を無効にする
      if (!isDragging || isRotating() || event.metaKey || event.ctrlKey) return;

      const deltaX = event.clientX - previousMousePosition.x;
      const deltaY = event.clientY - previousMousePosition.y;
      
      // ドラッグの感度を調整
      const sensitivity = 0.005;
      
      // Y軸回転（水平ドラッグ）
      cube.rotation.y += deltaX * sensitivity;
      
      // X軸回転（垂直ドラッグ）
      cube.rotation.x += deltaY * sensitivity;
      
      // X軸回転を制限（立方体が完全に上下逆さまにならないように）
      cube.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cube.rotation.x));

      previousMousePosition = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    };

    // マウスイベントをrenderer.domElementに追加
    renderer.domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    
    // 初期カーソルスタイル
    renderer.domElement.style.cursor = 'grab';

    onCleanup(() => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      if (renderer?.domElement) {
        renderer.domElement.removeEventListener("mousedown", handleMouseDown);
      }
      if (containerRef && renderer?.domElement) {
        containerRef.removeChild(renderer.domElement);
      }
    });
  });

  const createCubeFaces = () => {
    const faceSize = 600;
    const halfSize = faceSize / 2;
    const positions = [
      [0, 0, halfSize],        // 前面
      [halfSize, 0, 0],        // 右面
      [0, 0, -halfSize],       // 後面
      [-halfSize, 0, 0],       // 左面
      [0, halfSize, 0],        // 上面
      [0, -halfSize, 0],       // 下面
    ];

    const rotations = [
      [0, 0, 0],                   // 前面
      [0, Math.PI / 2, 0],         // 右面
      [0, Math.PI, 0],             // 後面
      [0, -Math.PI / 2, 0],        // 左面
      [Math.PI / 2, 0, 0],         // 上面
      [-Math.PI / 2, 0, 0],        // 下面
    ];

    positions.forEach((position, index) => {
      // DOMエレメントの作成
      const element = document.createElement("div");
      element.style.width = "600px";
      element.style.height = "600px";
      element.id = `cube-face-${index}`;

      // SolidJSコンポーネントをマウント
      render(() => (
        <CubeFace
          faceId={index}
          faceLabel={faceLabels[index]}
          items={getItemsByFace(index)}
          loading={loading()}
          onToggleItem={toggleItem}
          onDeleteItem={deleteItem}
          onTaskClick={handleTaskClick}
        />
      ), element);

      // CSS3Dオブジェクトの作成
      const object = new CSS3DObject(element);
      object.position.set(position[0], position[1], position[2]);
      object.rotation.set(rotations[index][0], rotations[index][1], rotations[index][2]);
      
      cube.add(object);
      faceElements[index] = element;
    });
  };



  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  return (
    <div class={styles.cubeContainer}>
      <div ref={containerRef} class={styles.threeContainer}></div>
      
      {/* 進捗表示 */}
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

      {/* フローティングアクションボタン */}
      {!showInput() && (
        <button 
          class={`${styles.fab} ${styles.globalFab}`}
          onClick={() => setShowInput(true)}
          title="新しいタスクを追加"
        >
          +
        </button>
      )}

      {/* タスク追加フォーム */}
      {showInput() && (
        <div class={styles.fabInputOverlay} onClick={() => setShowInput(false)}>
          <div
            class={styles.fabInputPopup}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="タスクを入力..."
              value={newItem()}
              onInput={(e) => setNewItem(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <input
              type="text"
              placeholder="詳細 (任意)"
              value={newItemDetail()}
              onInput={(e) => setNewItemDetail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              onClick={handleAddTask} 
              disabled={loading()}
            >
              {loading() ? "追加中..." : "追加 (Cmd+Enter)"}
            </button>
            {error() && (
              <p style={{
                "color": "#e74c3c",
                "margin": "8px 0 0 0",
                "font-size": "0.9rem"
              }}>
                {error()}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 