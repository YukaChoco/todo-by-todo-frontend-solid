import { createEffect, onCleanup } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import rough from "roughjs/bundled/rough.esm.js";

interface HanddrawnIconButtonProps {
  icon: "x" | "plus";
  onClick: () => void;
  disabled?: boolean;
  size?: number;
  title?: string;
  class?: string;
}

export default function HanddrawnIconButton(props: HanddrawnIconButtonProps): JSX.Element {
  let svgRef: SVGSVGElement | undefined;
  const size = props.size || 32;

  // ボタン描画
  const draw = () => {
    if (!svgRef) return;
    svgRef.innerHTML = "";
    const rc = rough.svg(svgRef);
    // 円形枠
    const circle = rc.circle(size / 2, size / 2, size - 4, {
      stroke: props.disabled ? "#aaa" : "#e67e22",
      strokeWidth: 2.5,
      fill: props.disabled ? "#eee" : "#fffbe7",
      fillStyle: "solid",
      roughness: 2.2,
      bowing: 2.5,
    });
    svgRef.appendChild(circle);
    // アイコン
    if (props.icon === "x") {
      const x1 = rc.linearPath([
        [size * 0.32, size * 0.32],
        [size * 0.68, size * 0.68],
      ], { stroke: "#e67e22", strokeWidth: 3.2, roughness: 1.5 });
      const x2 = rc.linearPath([
        [size * 0.68, size * 0.32],
        [size * 0.32, size * 0.68],
      ], { stroke: "#e67e22", strokeWidth: 3.2, roughness: 1.5 });
      svgRef.appendChild(x1);
      svgRef.appendChild(x2);
    } else if (props.icon === "plus") {
      const h = rc.linearPath([
        [size * 0.5, size * 0.28],
        [size * 0.5, size * 0.72],
      ], { stroke: "#e67e22", strokeWidth: 3.2, roughness: 1.5 });
      const v = rc.linearPath([
        [size * 0.28, size * 0.5],
        [size * 0.72, size * 0.5],
      ], { stroke: "#e67e22", strokeWidth: 3.2, roughness: 1.5 });
      svgRef.appendChild(h);
      svgRef.appendChild(v);
    }
  };

  createEffect(draw);
  onCleanup(() => { if (svgRef) svgRef.innerHTML = ""; });

  return (
    <button
      type="button"
      class={props.class}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        margin: 0,
        cursor: props.disabled ? "not-allowed" : "pointer",
        outline: "none",
        'vertical-align': "middle",
        display: "inline-block",
      }}
      onClick={() => !props.disabled && props.onClick()}
      disabled={props.disabled}
      title={props.title}
      tabIndex={props.disabled ? -1 : 0}
    >
      <svg
        ref={el => (svgRef = el)}
        width={size}
        height={size}
        style={{ display: "block" }}
      />
    </button>
  );
} 