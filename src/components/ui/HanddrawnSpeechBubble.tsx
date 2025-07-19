import { Show, onMount } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import rough from "roughjs/bundled/rough.esm.js";
import styles from "./HanddrawnSpeechBubble.module.css";

interface HanddrawnSpeechBubbleProps {
  message: string;
  visible: boolean;
  onClose?: () => void;
}

export default function HanddrawnSpeechBubble(props: HanddrawnSpeechBubbleProps): JSX.Element {
  let svgRef: SVGSVGElement | undefined;

  onMount(() => {
    if (svgRef) {
      svgRef.innerHTML = "";
      const rc = rough.svg(svgRef);
      // 吹き出し本体（角丸長方形）
      const rect = rc.rectangle(10, 10, 280, 60, {
        stroke: "#e74c3c",
        strokeWidth: 2.5,
        fill: "#fffbe7",
        fillStyle: "solid",
        roughness: 2.2,
        bowing: 2.5,
        // rough.jsはrx/ry未対応なので角丸は表現できない
      });
      svgRef.appendChild(rect);
      // 吹き出しの三角部分
      const triangle = rc.polygon([
        [60, 70], [90, 70], [75, 90]
      ], {
        stroke: "#e74c3c",
        strokeWidth: 2.5,
        fill: "#fffbe7",
        fillStyle: "solid",
        roughness: 2.2,
        bowing: 2.5,
      });
      svgRef.appendChild(triangle);
    }
  });

  return (
    <Show when={props.visible}>
      <div class={styles.container}>
        <svg ref={el => (svgRef = el!)} width={300} height={100} class={styles.svg} />
        <div class={styles.message}>
          {props.message}
        </div>
        {props.onClose && (
          <button
            class={styles.closeButton}
            onClick={props.onClose}
            aria-label="閉じる"
          >×</button>
        )}
      </div>
    </Show>
  );
} 