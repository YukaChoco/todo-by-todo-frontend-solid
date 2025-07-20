import { JSX, createMemo, For } from "solid-js";
import HanddrawnPieChart from "./HanddrawnPieChart";
import HanddrawnLargeNumber from "./HanddrawnLargeNumber";
import HanddrawnIconButton from "../ui/HanddrawnIconButton";
import styles from "./HanddrawnProgressDisplay.module.css";

interface HanddrawnProgressDisplayProps {
  totalTasks: number;
  completedTasks: number;
  currentPage: number;
  pageLabels: string[];
  onClose?: () => void;
  onPageSelect?: (pageId: number) => void;
}

export default function HanddrawnProgressDisplay(props: HanddrawnProgressDisplayProps): JSX.Element {
  const progress = createMemo(() => props.totalTasks > 0 ? (props.completedTasks / props.totalTasks) * 100 : 0);
  const incompleteTasks = createMemo(() => props.totalTasks - props.completedTasks);

  return (
    <div class={styles.container}>
      <div class={styles.title}>
        進捗状況
        {props.onClose && (
          <div style={{ 
            position: "absolute", 
            top: "8px", 
            right: "8px" 
          }}>
            <HanddrawnIconButton 
              icon="x" 
              onClick={props.onClose} 
              title="進捗表示を閉じる"
              size={24}
            />
          </div>
        )}
      </div>
      
      {/* ページ選択ドロップダウン */}
      <div class={styles.pageSelector}>
        <select 
          value={props.currentPage}
          onChange={(e) => props.onPageSelect?.(parseInt(e.target.value))}
          style={{
            "font-size": "1rem",
            "padding": "6px 8px",
            "border": "2px solid #ffb300",
            "border-radius": "8px",
            "outline": "none",
            "background": "#fffbe7",
            "color": "#333",
            "cursor": "pointer"
          }}
        >
          <For each={props.pageLabels}>
            {(label, index) => (
              <option value={index()}>ページ {label}</option>
            )}
          </For>
        </select>
      </div>
      
      <div class={styles.content}>
        {/* 円グラフ */}
        <div class={styles.chartSection}>
          <HanddrawnPieChart 
            progress={progress()} 
            size={120}
            showLabel={true}
          />
        </div>
        
        {/* 数値表示 */}
        <div class={styles.numbersRow}>
          <HanddrawnLargeNumber 
            value={props.completedTasks} 
            label="完了" 
            width={90}
            height={60}
          />
          <HanddrawnLargeNumber 
            value={incompleteTasks()} 
            label="未完了" 
            width={90}
            height={60}
          />
        </div>
      </div>
    </div>
  );
} 