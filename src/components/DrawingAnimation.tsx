import { createSignal, onMount, onCleanup, JSX } from "solid-js";
import rough from "roughjs/bundled/rough.esm.js";

interface DrawingAnimationProps {
  isVisible: boolean;
  targetPosition: { x: number; y: number };
  onAnimationComplete?: () => void;
}

export default function DrawingAnimation(props: DrawingAnimationProps): JSX.Element {
  let svgRef: SVGSVGElement | undefined;
  const [animationProgress, setAnimationProgress] = createSignal(0);
  const [sparkles, setSparkles] = createSignal<{x: number, y: number, delay: number}[]>([]);

  // ランダムな軌跡ポイントを生成
  const generateTrajectoryPoints = () => {
    const { targetPosition } = props;
    const points: [number, number][] = [];
    
    // 中央上部から開始
    const startX = window.innerWidth / 2;
    const startY = 50;
    
    // ベジェ曲線風の軌跡を生成
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const controlX1 = startX + (Math.random() - 0.5) * 200;
      const controlY1 = startY + 100;
      const controlX2 = targetPosition.x + (Math.random() - 0.5) * 100;
      const controlY2 = targetPosition.y - 50;
      
      // 3次ベジェ曲線
      const x = Math.pow(1 - t, 3) * startX +
                3 * Math.pow(1 - t, 2) * t * controlX1 +
                3 * (1 - t) * Math.pow(t, 2) * controlX2 +
                Math.pow(t, 3) * targetPosition.x;
      
      const y = Math.pow(1 - t, 3) * startY +
                3 * Math.pow(1 - t, 2) * t * controlY1 +
                3 * (1 - t) * Math.pow(t, 2) * controlY2 +
                Math.pow(t, 3) * targetPosition.y;
      
      points.push([x, y]);
    }
    
    return points;
  };

  const drawAnimation = () => {
    if (!svgRef || !props.isVisible) return;
    
    svgRef.innerHTML = "";
    const rc = rough.svg(svgRef);
    const progress = animationProgress();
    
    if (progress > 0) {
      const trajectoryPoints = generateTrajectoryPoints();
      const visiblePointCount = Math.floor(trajectoryPoints.length * progress);
      const visiblePoints = trajectoryPoints.slice(0, visiblePointCount);
      
      if (visiblePoints.length > 1) {
        // メインの魔法の軌跡
        const trajectory = rc.linearPath(visiblePoints, {
          stroke: "#e67e22",
          strokeWidth: 4,
          roughness: 2,
          bowing: 3,
          strokeLinecap: "round"
        });
        svgRef.appendChild(trajectory);
        
        // キラキラエフェクト
        sparkles().forEach((sparkle, index) => {
          if (progress * 100 > sparkle.delay) {
            const sparkleProgress = Math.min((progress * 100 - sparkle.delay) / 20, 1);
            const size = 8 * sparkleProgress * (1 - sparkleProgress * 0.5);
            
            if (size > 0) {
              // 星形のキラキラ
              const star = rc.linearPath([
                [sparkle.x - size, sparkle.y],
                [sparkle.x + size, sparkle.y]
              ], {
                stroke: "#f39c12",
                strokeWidth: 2,
                roughness: 1,
              });
              
              const star2 = rc.linearPath([
                [sparkle.x, sparkle.y - size],
                [sparkle.x, sparkle.y + size]
              ], {
                stroke: "#f39c12",
                strokeWidth: 2,
                roughness: 1,
              });
              
                             svgRef!.appendChild(star);
               svgRef!.appendChild(star2);
            }
          }
        });
        
        // 最終地点に到達した時の爆発エフェクト
        if (progress > 0.9) {
          const finalPoint = trajectoryPoints[trajectoryPoints.length - 1];
          const explosionProgress = (progress - 0.9) / 0.1;
          
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const distance = 30 * explosionProgress;
            const endX = finalPoint[0] + Math.cos(angle) * distance;
            const endY = finalPoint[1] + Math.sin(angle) * distance;
            
            const ray = rc.linearPath([
              finalPoint,
              [endX, endY]
            ], {
              stroke: "#e74c3c",
              strokeWidth: 3 - explosionProgress * 2,
              roughness: 2,
              opacity: 1 - explosionProgress
            });
            svgRef.appendChild(ray);
          }
        }
      }
    }
  };

  // アニメーションの実行
  const animateDrawing = () => {
    if (!props.isVisible) return;
    
    // キラキラエフェクトの初期化
    const newSparkles = [];
    for (let i = 0; i < 15; i++) {
      newSparkles.push({
        x: props.targetPosition.x + (Math.random() - 0.5) * 300,
        y: props.targetPosition.y + (Math.random() - 0.5) * 200,
        delay: Math.random() * 80
      });
    }
    setSparkles(newSparkles);
    
    const duration = 1500; // 1.5秒
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // イージング関数（ease-out-back）
      const easedProgress = 1 - Math.pow(1 - progress, 2) * Math.cos(progress * Math.PI * 2);
      setAnimationProgress(Math.max(0, Math.min(1, easedProgress)));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // アニメーション完了
        setTimeout(() => {
          props.onAnimationComplete?.();
        }, 200);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // propsが変更された時にアニメーションを開始
  const prevVisible = createSignal(false);
  
  onMount(() => {
    const checkVisibility = () => {
      if (props.isVisible && !prevVisible[0]()) {
        setAnimationProgress(0);
        setTimeout(animateDrawing, 50);
      } else if (!props.isVisible) {
        setAnimationProgress(0);
        setSparkles([]);
      }
      prevVisible[1](props.isVisible);
    };
    
    checkVisibility();
    const interval = setInterval(checkVisibility, 50);
    onCleanup(() => clearInterval(interval));
  });

  // 再描画
  onMount(() => {
    const redraw = () => drawAnimation();
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
    "z-index": "10000",
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