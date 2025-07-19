import { createEffect, onCleanup } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import rough from "roughjs/bundled/rough.esm.js";
import styles from "./HanddrawnPieChart.module.css";

interface HanddrawnPieChartProps {
  progress: number; // 0-100の進捗率
  size?: number;
  showLabel?: boolean;
}

export default function HanddrawnPieChart(props: HanddrawnPieChartProps): JSX.Element {
  let svgRef: SVGSVGElement | undefined;
  const size = props.size || 120;
  const radius = (size - 20) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  const draw = () => {
    if (!svgRef) return;
    svgRef.innerHTML = "";
    const rc = rough.svg(svgRef);
    
    // 進捗率を0-1にクランプ
    const progressRatio = Math.max(0, Math.min(100, props.progress)) / 100;
    
    // 背景の円
    const backgroundCircle = rc.circle(centerX, centerY, radius * 2, {
      stroke: "#222",
      strokeWidth: 2.5,
      fill: "#fffbe7",
      fillStyle: "solid",
      roughness: 2.2,
      bowing: 2.5,
    });
    svgRef.appendChild(backgroundCircle);
    
    // 進捗部分（円弧）
    if (progressRatio > 0) {
      if (progressRatio >= 1) {
        // 100%の場合は完全な円を描画
        const fullCircle = rc.circle(centerX, centerY, radius * 2, {
          stroke: "#e67e22",
          strokeWidth: 2,
          fill: "#ffe5b4",
          fillStyle: "solid",
          roughness: 2.2,
          bowing: 2.5,
        });
        svgRef.appendChild(fullCircle);
      } else {
        // 100%未満の場合は円弧を描画
        const angle = progressRatio * 2 * Math.PI;
        const largeArcFlag = angle > Math.PI ? 1 : 0;
        
        // 円弧の終点を計算
        const endX = centerX + radius * Math.sin(angle);
        const endY = centerY - radius * Math.cos(angle);
        
        // パスデータを作成（12時方向から時計回り）
        const pathData = [
          `M ${centerX} ${centerY}`, // 中心点に移動
          `L ${centerX} ${centerY - radius}`, // 12時方向に線を引く
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`, // 円弧を描画
          `Z` // パスを閉じる
        ].join(' ');
        
        // Rough.jsでスタイルを適用
        const roughPath = rc.path(pathData, {
          stroke: "#e67e22",
          strokeWidth: 2,
          fill: "#ffe5b4",
          fillStyle: "solid",
          roughness: 2.2,
          bowing: 2.5,
        });
        svgRef.appendChild(roughPath);
      }
    }
    
    // 中央のラベル
    if (props.showLabel !== false) {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", centerX.toString());
      text.setAttribute("y", (centerY + 6).toString());
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("fill", "#222");
      text.setAttribute("font-size", "16");
      text.setAttribute("font-weight", "bold");
      text.setAttribute("font-family", "dartsfont");
      text.textContent = `${Math.round(props.progress)}%`;
      svgRef.appendChild(text);
    }
  };

  createEffect(draw);
  onCleanup(() => { if (svgRef) svgRef.innerHTML = ""; });

  return (
    <div class={styles.container}>
      <svg
        ref={el => (svgRef = el)}
        width={size}
        height={size}
        class={styles.svg}
      />
    </div>
  );
} 