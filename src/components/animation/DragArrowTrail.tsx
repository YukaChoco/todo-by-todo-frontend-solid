import { createSignal, onMount, onCleanup, JSX } from "solid-js";
import rough from "roughjs/bundled/rough.esm.js";

interface DragArrowTrailProps {
  isVisible: boolean;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

export default function DragArrowTrail(props: DragArrowTrailProps): JSX.Element {
  let svgRef: SVGSVGElement | undefined;
  const [animationProgress, setAnimationProgress] = createSignal(0);

  const drawArrow = () => {
    if (!svgRef || !props.isVisible) return;
    
    svgRef.innerHTML = "";
    const rc = rough.svg(svgRef);
    
    const { startPoint, endPoint } = props;
    const progress = animationProgress();
    
    // 線の終点を進行度に応じて計算
    const currentEndX = startPoint.x + (endPoint.x - startPoint.x) * progress;
    const currentEndY = startPoint.y + (endPoint.y - startPoint.y) * progress;
    
    if (progress > 0) {
      // メインの軌跡線
      const line = rc.linearPath([
        [startPoint.x, startPoint.y],
        [currentEndX, currentEndY]
      ], {
        stroke: "#e67e22",
        strokeWidth: 3,
        roughness: 2.5,
        bowing: 3,
        strokeLinecap: "round"
      });
      svgRef.appendChild(line);
      
      // 矢印の頭部分（進行度が80%以上の時に表示）
      if (progress > 0.8) {
        const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        const arrowPoint1X = currentEndX - arrowLength * Math.cos(angle - arrowAngle);
        const arrowPoint1Y = currentEndY - arrowLength * Math.sin(angle - arrowAngle);
        const arrowPoint2X = currentEndX - arrowLength * Math.cos(angle + arrowAngle);
        const arrowPoint2Y = currentEndY - arrowLength * Math.sin(angle + arrowAngle);
        
        const arrowHead1 = rc.linearPath([
          [currentEndX, currentEndY],
          [arrowPoint1X, arrowPoint1Y]
        ], {
          stroke: "#e67e22",
          strokeWidth: 3,
          roughness: 2,
          strokeLinecap: "round"
        });
        
        const arrowHead2 = rc.linearPath([
          [currentEndX, currentEndY],
          [arrowPoint2X, arrowPoint2Y]
        ], {
          stroke: "#e67e22",
          strokeWidth: 3,
          roughness: 2,
          strokeLinecap: "round"
        });
        
        svgRef.appendChild(arrowHead1);
        svgRef.appendChild(arrowHead2);
      }
    }
  };

  // アニメーションの実行
  const animateDrawing = () => {
    if (!props.isVisible) return;
    
    const duration = 800; // 0.8秒
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // イージング関数（ease-out）
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(easedProgress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // propsが変更された時にアニメーションを再実行
  const prevVisible = createSignal(false);
  
  onMount(() => {
    const checkVisibility = () => {
      if (props.isVisible && !prevVisible[0]()) {
        setAnimationProgress(0);
        setTimeout(animateDrawing, 100); // 少し遅延してアニメーション開始
      } else if (!props.isVisible) {
        setAnimationProgress(0);
      }
      prevVisible[1](props.isVisible);
    };
    
    // 初回チェック
    checkVisibility();
    
    // propsの変更を監視（SolidJSの自動追跡）
    const interval = setInterval(checkVisibility, 50);
    onCleanup(() => clearInterval(interval));
  });

  onMount(() => {
    drawArrow();
  });

  // 再描画
  const redraw = () => drawArrow();
  onMount(() => {
    const interval = setInterval(redraw, 16); // 約60fps
    onCleanup(() => clearInterval(interval));
  });

  const containerStyle = {
    position: "fixed" as const,
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    "pointer-events": "none" as const,
    "z-index": "9999",
    opacity: props.isVisible ? "1" : "0",
    transition: "opacity 0.2s ease"
  };

  return (
    <div style={containerStyle}>
      <svg
        ref={(el) => (svgRef = el)}
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: "0",
          left: "0"
        }}
      />
    </div>
  );
} 