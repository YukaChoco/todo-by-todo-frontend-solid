import { createEffect, onCleanup } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import rough from "roughjs/bundled/rough.esm.js";
import styles from "./HanddrawnLargeNumber.module.css";

interface HanddrawnLargeNumberProps {
  value: number;
  label?: string;
  width?: number;
  height?: number;
}

export default function HanddrawnLargeNumber(props: HanddrawnLargeNumberProps): JSX.Element {
  let svgRef: SVGSVGElement | undefined;
  const width = props.width || 120;
  const height = props.height || 80;

  const draw = () => {
    if (!svgRef) return;
    svgRef.innerHTML = "";
    const rc = rough.svg(svgRef);
    
    // 背景の手書き風長方形
    const background = rc.rectangle(2, 2, width - 4, height - 4, {
      stroke: "#e67e22",
      strokeWidth: 3,
      fill: "#ffe5b4",
      fillStyle: "solid",
      roughness: 2.5,
      bowing: 3,
    });
    svgRef.appendChild(background);
    
    // 数字テキスト
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", (width / 2).toString());
    text.setAttribute("y", (height / 2 + 12).toString());
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#222");
    text.setAttribute("font-size", "36");
    text.setAttribute("font-weight", "bold");
    text.setAttribute("font-family", "dartsfont");
    text.textContent = props.value.toString();
    svgRef.appendChild(text);
  };

  createEffect(draw);
  onCleanup(() => { if (svgRef) svgRef.innerHTML = ""; });

  return (
    <div class={styles.container}>
      <svg
        ref={el => (svgRef = el)}
        width={width}
        height={height}
        class={styles.svg}
      />
      {props.label && <div class={styles.label}>{props.label}</div>}
    </div>
  );
} 