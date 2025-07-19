import { onMount, createEffect, createSignal } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import rough from "roughjs/bundled/rough.esm.js";
import styles from "./HanddrawnTaskCard.module.css";

interface HanddrawnTaskCardProps {
  name: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  children: JSX.Element[];
  onDragStart?: (e: MouseEvent) => void;
  onDragEnd?: () => void;
  onClick?: () => void;
}

export default function HanddrawnTaskCard(props: HanddrawnTaskCardProps): JSX.Element {
  let svgRef: SVGSVGElement | undefined;
  let underlineRef: SVGSVGElement | undefined;
  let highlightRef: SVGSVGElement | undefined;
  const [isHovered, setIsHovered] = createSignal(false);
  const [isDragging, setIsDragging] = createSignal(false);

  // 枠線・背景
  const drawBackground = () => {
    if (svgRef) {
      svgRef.innerHTML = "";
      const rc = rough.svg(svgRef);
      // 付箋紙風の四角形
      const rect = rc.rectangle(2, 2, 146, 146, {
        stroke: isDragging() ? "#e67e22" : "#b59b5b",
        strokeWidth: isDragging() ? 3.5 : 2.5,
        fill: isDragging() ? "#ffe5b4" : "#fff9c4", // 淡い黄色
        fillStyle: "solid",
        roughness: 2.2,
        bowing: 2.5,
      });
      svgRef.appendChild(rect);
    }
  };

  onMount(drawBackground);
  createEffect(drawBackground); // ドラッグ状態の変化に応じて再描画

  // 重要度アンダーライン
  createEffect(() => {
    if (underlineRef) {
      underlineRef.innerHTML = "";
      const rc = rough.svg(underlineRef);
      let color = "#e67e22";
      let strokeWidth = 2.5;
      if (props.priority === "high") {
        color = "#e74c3c";
        strokeWidth = 4.5;
      } else if (props.priority === "low") {
        color = "#3498db";
        strokeWidth = 2;
      }
      // 手書き風アンダーライン
      const line = rc.linearPath([
        [15, 14], [135, 14]
      ], {
        stroke: color,
        strokeWidth,
        roughness: 2.5,
        bowing: 2.5,
      });
      underlineRef.appendChild(line);
    }
  });

  // ホバー時のハイライト効果
  const drawHighlight = () => {
    if (highlightRef) {
      highlightRef.innerHTML = "";
      if (isHovered() && !isDragging()) {
        const rc = rough.svg(highlightRef);
        // 手書き風のハイライト効果
        const highlight = rc.rectangle(0, 0, 150, 150, {
          stroke: "#e67e22",
          strokeWidth: 1.5,
          fill: "none",
          roughness: 3,
          bowing: 4,
        });
        highlightRef.appendChild(highlight);
        
        // 小さな星印のような装飾
        const star1 = rc.linearPath([
          [140, 10], [145, 15], [140, 20]
        ], {
          stroke: "#e67e22",
          strokeWidth: 2,
          roughness: 2,
        });
        const star2 = rc.linearPath([
          [142, 12], [142, 18]
        ], {
          stroke: "#e67e22",
          strokeWidth: 2,
          roughness: 2,
        });
        highlightRef.appendChild(star1);
        highlightRef.appendChild(star2);
      }
    }
  };

  createEffect(drawHighlight);

  // ドラッグ&ドロップのハンドラー
  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    props.onDragStart?.(e);
    
    const handleMouseUp = () => {
      setIsDragging(false);
      props.onDragEnd?.();
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mouseup', handleMouseUp);
  };

  // カードクリックハンドラー
  const handleCardClick = (e: MouseEvent) => {
    // ボタン要素のクリックは除外
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]')) {
      return;
    }
    props.onClick?.();
  };

  return (
    <div 
      class={styles.container}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
      onClick={handleCardClick}
      style={{ cursor: isDragging() ? 'grabbing' : 'grab' }}
    >
      <svg ref={el => svgRef = el!} width={150} height={150} class={styles.backgroundSvg} />
      <svg ref={el => highlightRef = el!} width={150} height={150} class={styles.highlightSvg} />
      {/* チェックボックスを左上に配置 */}
      <div class={styles.checkbox}>
        {props.children[0]}
      </div>
      {/* バツボタンを右上に配置 */}
      <div class={styles.deleteButton}>
        {props.children[1]}
      </div>
      <div class={styles.content}>
        <div class={props.completed ? styles.taskNameCompleted : styles.taskNameActive}>{props.name}</div>
      </div>
      <svg ref={el => underlineRef = el!} width={150} height={24} class={styles.underlineSvg} />
    </div>
  );
} 