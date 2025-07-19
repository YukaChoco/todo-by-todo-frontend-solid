import { createEffect, onCleanup } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import rough from "roughjs/bundled/rough.esm.js";
import styles from "./HanddrawnCheckbox.module.css";

interface HanddrawnCheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: number;
}

export default function HanddrawnCheckbox(props: HanddrawnCheckboxProps): JSX.Element {
  let svgRef: SVGSVGElement | undefined;
  const size = props.size || 28;

  // チェックボックス描画
  const draw = () => {
    if (!svgRef) return;
    svgRef.innerHTML = "";
    const rc = rough.svg(svgRef);
    // 四角形
    const box = rc.rectangle(2, 2, size - 4, size - 4, {
      stroke: props.disabled ? "#aaa" : props.checked ? "#e67e22" : "#222",
      strokeWidth: props.checked ? 3 : 2,
      fill: props.checked ? "#ffe5b4" : "#fffbe7",
      fillStyle: "solid",
      roughness: 2.2,
      bowing: 2.5,
    });
    svgRef.appendChild(box);
    // チェックマーク
    if (props.checked) {
      const check = rc.linearPath([
        [size * 0.25, size * 0.55],
        [size * 0.45, size * 0.75],
        [size * 0.75, size * 0.25],
      ], {
        stroke: "#e67e22",
        strokeWidth: 3.2,
        roughness: 1.5,
      });
      svgRef.appendChild(check);
    }
  };

  createEffect(draw);
  onCleanup(() => { if (svgRef) svgRef.innerHTML = ""; });

  return (
    <span 
      class={props.disabled ? styles.containerDisabled : styles.containerEnabled}
      onClick={() => !props.disabled && props.onChange()}
      tabIndex={props.disabled ? -1 : 0}
      aria-checked={props.checked}
      role="checkbox"
    >
      <svg
        ref={el => (svgRef = el)}
        width={size}
        height={size}
        class={styles.svg}
      />
    </span>
  );
} 