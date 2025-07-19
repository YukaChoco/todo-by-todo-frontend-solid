import { onMount, createEffect } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import rough from "roughjs/bundled/rough.esm.js";

interface HanddrawnTaskCardProps {
  name: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  children?: JSX.Element;
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
      const rect = rc.rectangle(2, 2, 340, 54, {
        stroke: "#b59b5b",
        strokeWidth: 2.5,
        fill: "#fffbe7",
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
        [20, 18], [320, 18]
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
    <div style={{ position: "relative", width: "344px", height: "58px", margin: "12px 0" }}>
      <svg ref={el => svgRef = el!} width={344} height={58} style={{ position: "absolute", top: 0, left: 0, 'z-index': 0 }} />
      <div style={{ position: "relative", 'z-index': 1, padding: "10px 24px 8px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
        {props.children}
        <div style={{ flex: 1, 'font-size': "1.1rem", 'text-decoration': props.completed ? "line-through" : "none", color: props.completed ? "#aaa" : "#222" }}>{props.name}</div>
      </div>
      <svg ref={el => underlineRef = el!} width={344} height={22} style={{ position: "absolute", left: 0, bottom: 0, 'z-index': 2 }} />
    </div>
  );
} 