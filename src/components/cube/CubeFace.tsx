import { createSignal, createEffect, onMount, For } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import rough from "roughjs/bundled/rough.esm.js";
import { runCowInterpreter } from "../../cowInterpreter";
import { cowPrograms } from "../../cowPrograms";
import { useGlobalPositions } from "../../hooks/useGlobalPositions";

// コンポーネントインポート
import HanddrawnTabs from "../ui/HanddrawnTabs";
import HanddrawnTaskCard from "../task/HanddrawnTaskCard";
import HanddrawnCheckbox from "../ui/HanddrawnCheckbox";
import HanddrawnIconButton from "../ui/HanddrawnIconButton";

import styles from "./CubeFace.module.css";

interface Item {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  hue: number;
  faceId: number;
}

interface CubeFaceProps {
  faceId: number;
  faceLabel: string;
  items: Item[];
  loading: boolean;
  onToggleItem: (item: Item) => Promise<void>;
  onDeleteItem: (item: Item) => Promise<void>;
  onTaskClick?: (taskId: number) => void;
}

export default function CubeFace(props: CubeFaceProps): JSX.Element {
  const [category, setCategory] = createSignal<string>("すべて");
  const [backgroundColor, setBackgroundColor] = createSignal<string>("#282c34");
  const [selectedTaskId, setSelectedTaskId] = createSignal<number | null>(null);
  
  // グローバル位置管理を使用
  const { getPosition, setPosition, hasPosition } = useGlobalPositions();

  let svgRef: SVGSVGElement | undefined;

  onMount(() => {
    if (svgRef) {
      const rc = rough.svg(svgRef);
      // ノート風の枠線を描画
      const node = rc.rectangle(5, 5, 590, 590, {
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

  const toggleItem = async (id: number) => {
    const item = props.items.find((item) => item.id === id);
    if (item) {
      await props.onToggleItem(item);
    }
  };

  const deleteItem = async (id: number) => {
    const item = props.items.find((item) => item.id === id);
    if (item) {
      await props.onDeleteItem(item);
    }
  };

  // カテゴリでフィルタリング
  const filteredItems = () => {
    if (category() === "未完了")
      return props.items.filter((item) => !item.completed);
    if (category() === "完了") 
      return props.items.filter((item) => item.completed);
    return props.items;
  };



  // タスクの座標を管理 - 位置を永続化
  createEffect(() => {
    props.items.forEach((item) => {
      // 既にグローバル位置に存在する場合は新しい位置を生成しない
      if (!hasPosition(item.id)) {
        // 最適化後のレイアウト:
        // ヘッダー(約80px) + タブ(約50px) + マージン(20px) = 約150px を上部から除外
        // タスクカードのサイズ(約150px)を考慮
        // 利用可能な高さ: 350px (mainContainerの高さ)
        // 利用可能な幅: 600 - 150(カード幅) - 40(両端マージン) = 410px
        setPosition(item.id, {
          top: Math.floor(Math.random() * 200), // mainContainer内での0-200px
          left: Math.floor(Math.random() * 410), // 0-410px の範囲
        });
      }
    });
  });

  return (
    <div class={styles.cubeFace} style={{ "background-color": backgroundColor() }}>
      {/* 背景SVG */}
      <svg
        ref={svgRef}
        class={styles.backgroundSvg}
        viewBox="0 0 600 600"
        preserveAspectRatio="none"
      />

      {/* タブ */}
      <div class={styles.tabsContainer}>
        <HanddrawnTabs
          tabs={["すべて", "未完了", "完了"]}
          selected={category()}
          onSelect={setCategory}
        />
      </div>

      {/* メインコンテンツエリア */}
      <main class={`${styles.mainContainer} main-container`}>
        <For each={filteredItems()}>
          {(item) => {
            const position = () => getPosition(item.id) || { top: 0, left: 0 };
            
            return (
              <div
                class={styles.taskCardWrapper}
                style={{
                  position: "absolute",
                  top: `${position().top}px`,
                  left: `${position().left}px`,
                }}
                onClick={() => {
                  setSelectedTaskId(item.id);
                  props.onTaskClick?.(item.id);
                }}
              >
                <HanddrawnTaskCard
                  name={item.title}
                  completed={item.completed}
                  hue={item.hue}
                  priority="medium"
                >
                  <HanddrawnCheckbox
                    checked={item.completed}
                    onChange={() => toggleItem(item.id)}
                  />
                  <HanddrawnIconButton
                    icon="x"
                    onClick={() => deleteItem(item.id)}
                  />
                </HanddrawnTaskCard>
              </div>
            );
          }}
        </For>
      </main>

      {/* ページ番号 - 右下に配置 */}
      <div class={styles.pageNumber}>
        {props.faceLabel}
      </div>
    </div>
  );
} 