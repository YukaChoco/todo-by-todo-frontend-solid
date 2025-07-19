import { JSX, createMemo } from "solid-js";
import HanddrawnPieChart from "./HanddrawnPieChart";
import HanddrawnLargeNumber from "./HanddrawnLargeNumber";
import HanddrawnIconButton from "./HanddrawnIconButton";
import styles from "./HanddrawnProgressDisplay.module.css";

interface HanddrawnProgressDisplayProps {
  totalTasks: number;
  completedTasks: number;
  onClose?: () => void;
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