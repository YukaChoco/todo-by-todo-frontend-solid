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
  const [currentPage, setCurrentPage] = createSignal<number>(0); // 現在表示中のページ
  
  // フローティングボタン用の状態
  const [showInput, setShowInput] = createSignal(false);
  const [newItem, setNewItem] = createSignal<string>("");
  const [newItemDetail, setNewItemDetail] = createSignal<string>("");
  const [error, setError] = createSignal<string>("");
  const [addTaskMessage, setAddTaskMessage] = createSignal<string>("");

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

  // 進捗計算（全体）
  const totalTasks = () => allItems().length;
  const completedTasks = () => allItems().filter((item) => item.completed).length;

  // ページごとの進捗計算
  const getPageProgress = (pageId: number) => {
    const pageItems = getItemsByFace(pageId);
    const total = pageItems.length;
    const completed = pageItems.filter(item => item.completed).length;
    return { total, completed };
  };

  // 現在のページの進捗
  const currentPageProgress = () => getPageProgress(currentPage());

  // 選択されたタスクを取得
  const selectedTask = () => {
    const taskId = selectedTaskId();
    return taskId ? allItems().find((item) => item.id === taskId) || null : null;
  };

  // 立方体を特定のページに回転させる
  const rotateCubeToPage = (pageId: number) => {
    if (!cube) return;
    
    setIsRotating(true);
    const targetRotations = [
      { x: 0, y: 0 },                    // 前面 (ページ1)
      { x: 0, y: -Math.PI / 2 },         // 右面 (ページ2)
      { x: 0, y: Math.PI },              // 後面 (ページ3)
      { x: 0, y: Math.PI / 2 },          // 左面 (ページ4)
      { x: Math.PI / 2, y: Math.PI },    // 上面 (ページ5) - X軸回転の符号を修正
      { x: -Math.PI / 2, y: Math.PI },   // 下面 (ページ6) - X軸回転の符号を修正
    ];
    
    const target = targetRotations[pageId];
    if (target) {
      // アニメーション付きで回転
      const startRotation = { x: cube.rotation.x, y: cube.rotation.y };
      const duration = 800; // ms
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // イージング関数（ease-out）
        const easeOut = 1 - Math.pow(1 - progress, 3);
        
        cube.rotation.x = startRotation.x + (target.x - startRotation.x) * easeOut;
        cube.rotation.y = startRotation.y + (target.y - startRotation.y) * easeOut;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsRotating(false);
        }
      };
      
      animate();
    }
    
    setCurrentPage(pageId);
  };

  // ページ選択ハンドラー
  const handlePageSelect = (pageId: number) => {
    rotateCubeToPage(pageId);
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

    // タスクのページを事前に計算（useTodosFaceと同じロジック）
    const taskText = newItem() + newItemDetail();
    const cowResult = runCowInterpreter(cowPrograms, taskText);
    const hue = Number(cowResult[0].charCodeAt(0));
    const calculatedPage = Math.floor((hue % 360) / 60);

    // APIを通じてアイテムを追加（ページは自動判定）
    await addItem(newItem(), newItemDetail());
    
    // 計算したページに移動とメッセージ表示
    setAddTaskMessage(`タスクをページ${faceLabels[calculatedPage]}に追加しました`);
    setTimeout(() => setAddTaskMessage(""), 3000);
    
    // そのページに移動
    rotateCubeToPage(calculatedPage);
    
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
      // タスクカード要素をクリックしている場合は立方体の回転を無効にする
      const target = event.target as HTMLElement;
      const isTaskCard = target.closest('.task-card-wrapper') || target.closest('[class*="HanddrawnTaskCard"]');
      
      if (isRotating() || isTaskCard) return;
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
      renderer.domElement.style.cursor = 'grabbing';
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || isRotating()) return;

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
      
      // 上面と下面の左右反転を修正
      if (index === 4 || index === 5) { // 上面(4)と下面(5)
        object.scale.set(-1, 1, 1); // X軸方向を反転
      }
      
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
            totalTasks={currentPageProgress().total}
            completedTasks={currentPageProgress().completed}
            currentPage={currentPage()}
            pageLabels={faceLabels}
            onClose={() => setShowProgress(false)}
            onPageSelect={handlePageSelect}
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

      {/* タスク追加通知メッセージ */}
      {addTaskMessage() && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(255, 179, 0, 0.95)",
            color: "#222",
            padding: "16px 24px",
            "border-radius": "12px",
            "box-shadow": "0 4px 16px rgba(0, 0, 0, 0.2)",
            "z-index": 3000,
            "font-weight": "bold",
            "font-size": "1.1rem",
            animation: "fadeInOut 3s ease-in-out"
          }}
        >
          {addTaskMessage()}
        </div>
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