import { For } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import rough from "roughjs/bundled/rough.esm.js";
import styles from "./HanddrawnTabs.module.css";

interface HanddrawnTabsProps {
  tabs: string[];
  selected: string;
  onSelect: (tab: string) => void;
}

export default function HanddrawnTabs(props: HanddrawnTabsProps): JSX.Element {
  let svgRefs: SVGSVGElement[] = [];

  // タブの描画
  const drawTabs = () => {
    props.tabs.forEach((tab, i) => {
      const svg = svgRefs[i];
      if (svg) {
        svg.innerHTML = "";
        const rc = rough.svg(svg);
        const isSelected = props.selected === tab;
        const node = rc.rectangle(2, 2, 98, 38, {
          stroke: isSelected ? "#e67e22" : "#222",
          strokeWidth: isSelected ? 3 : 2,
          fill: isSelected ? "#ffe5b4" : "#fffbe7",
          fillStyle: "solid",
          roughness: 2.2,
          bowing: 2.5,
        });
        svg.appendChild(node);
      }
    });
  };

  // 再描画
  setTimeout(drawTabs, 0);

  return (
    <div class={styles.container}>
      <For each={props.tabs}>{(tab, i) => (
        <div class={styles.tab} onClick={() => props.onSelect(tab)}>
          <svg
            ref={el => (svgRefs[i()] = el)}
            width={102}
            height={42}
            class={styles.svg}
          />
          <span
            class={props.selected === tab ? styles.labelSelected : styles.labelUnselected}
          >
            {tab}
          </span>
        </div>
      )}</For>
    </div>
  );
} 