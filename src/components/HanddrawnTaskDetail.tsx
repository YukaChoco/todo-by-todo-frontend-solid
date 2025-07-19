import { createEffect, onMount, createSignal } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import rough from "roughjs/bundled/rough.esm.js";
import HanddrawnIconButton from "./HanddrawnIconButton";
import styles from "./HanddrawnTaskDetail.module.css";

interface TaskDetailProps {
  id: number;
  name: string;
  detail: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  onClose: () => void;
}

export default function HanddrawnTaskDetail(props: TaskDetailProps): JSX.Element {
  let svgRef: SVGSVGElement | undefined;

  const drawBackground = () => {
    if (svgRef) {
      svgRef.innerHTML = "";
      const rc = rough.svg(svgRef);
      const rect = rc.rectangle(5, 5, 350, 390, {
        stroke: "#222",
        strokeWidth: 2.5,
        fill: "#fffbe7",
        fillStyle: "solid",
        roughness: 2.2,
        bowing: 2.5,
      });
      svgRef.appendChild(rect);
    }
  };

  onMount(drawBackground);
  createEffect(drawBackground);

  return (
    <div class={styles.container}>
      <svg
        ref={el => svgRef = el}
        width={360}
        height={400}
        class={styles.backgroundSvg}
      />
      <div class={styles.content}>
        <div class={styles.header}>
          <h3 class={styles.title}>タスク詳細</h3>
          <HanddrawnIconButton 
            icon="x" 
            onClick={props.onClose} 
            title="閉じる"
            size={28}
          />
        </div>
        
        <div class={styles.detailSection}>
          <div class={styles.field}>
            <label class={styles.label}>タスク名:</label>
            <div class={styles.taskName}>{props.name}</div>
          </div>
          
          <div class={styles.field}>
            <label class={styles.label}>ステータス:</label>
            <span class={`${styles.status} ${props.completed ? styles.completed : styles.incomplete}`}>
              {props.completed ? "✓ 完了" : "○ 未完了"}
            </span>
          </div>
          
          <div class={styles.field}>
            <label class={styles.label}>詳細:</label>
            <div class={styles.detailText}>
              {props.detail || "詳細が設定されていません"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 