import { createEffect, onCleanup } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import rough from "roughjs/bundled/rough.esm.js";
import styles from "./HanddrawnProgressBar.module.css";

interface HanddrawnProgressBarProps {
  progress: number; // 0-100の進捗率
  width?: number;
  height?: number;
  label?: string;
}

export default function HanddrawnProgressBar(props: HanddrawnProgressBarProps): JSX.Element {
  let svgRef: SVGSVGElement | undefined;
  const width = props.width || 200;
  const height = props.height || 30;

  const draw = () => {
    if (!svgRef) return;
    svgRef.innerHTML = "";
    const rc = rough.svg(svgRef);
    
    // 進捗率を0-1にクランプ
    const progressRatio = Math.max(0, Math.min(100, props.progress)) / 100;
    
    // 背景の枠
    const background = rc.rectangle(2, 2, width - 4, height - 4, {
      stroke: "#222",
      strokeWidth: 2.5,
      fill: "#fffbe7",
      fillStyle: "solid",
      roughness: 2.2,
      bowing: 2.5,
    });
    svgRef.appendChild(background);
    
    // 進捗部分（完了している部分）
    if (progressRatio > 0) {
      const progressWidth = (width - 8) * progressRatio;
      const progressBar = rc.rectangle(4, 4, progressWidth, height - 8, {
        stroke: "#e67e22",
        strokeWidth: 2,
        fill: "#ffe5b4",
        fillStyle: "solid",
        roughness: 2.2,
        bowing: 2.5,
      });
      svgRef.appendChild(progressBar);
    }
  };

  createEffect(draw);
  onCleanup(() => { if (svgRef) svgRef.innerHTML = ""; });

  return (
    <div class={styles.container}>
      {props.label && <div class={styles.label}>{props.label}</div>}
      <svg
        ref={el => (svgRef = el)}
        width={width}
        height={height}
        class={styles.svg}
      />
      <div class={styles.percentage}>{Math.round(props.progress)}%</div>
    </div>
  );
} 