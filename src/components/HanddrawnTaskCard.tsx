import { onMount, createEffect } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import rough from "roughjs/bundled/rough.esm.js";
import styles from "./HanddrawnTaskCard.module.css";

interface HanddrawnTaskCardProps {
  name: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  children: JSX.Element[];
}

export default function HanddrawnTaskCard(props: HanddrawnTaskCardProps): JSX.Element {
  let svgRef: SVGSVGElement | undefined;
  let underlineRef: SVGSVGElement | undefined;

  // 枠線・背景
  onMount(() => {
    if (svgRef) {
      svgRef.innerHTML = "";
      const rc = rough.svg(svgRef);
      // 付箋紙風の四角形
      const rect = rc.rectangle(2, 2, 146, 146, {
        stroke: "#b59b5b",
        strokeWidth: 2.5,
        fill: "#fff9c4", // 淡い黄色
        fillStyle: "solid",
        roughness: 2.2,
        bowing: 2.5,
      });
      svgRef.appendChild(rect);
    }
  });

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

  return (
    <div class={styles.container}>
      <svg ref={el => svgRef = el!} width={150} height={150} class={styles.backgroundSvg} />
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