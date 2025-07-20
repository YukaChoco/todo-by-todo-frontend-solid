import { Component, createSignal, onMount, onCleanup } from "solid-js";

interface ScratchToRevealProps {
  children: any;
  width: number;
  height: number;
  minScratchPercentage?: number;
  className?: string;
  onComplete?: () => void;
  gradientColors?: [string, string, string];
}

export const ScratchToReveal: Component<ScratchToRevealProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  const [isScratching, setIsScratching] = createSignal(false);
  const [isComplete, setIsComplete] = createSignal(false);

  onMount(() => {
    const canvas = canvasRef;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.fillStyle = "#ccc";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      const colors = props.gradientColors || ["#A97CF8", "#F38CB8", "#FDCC92"];
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.5, colors[1]);
      gradient.addColorStop(1, colors[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  });

  const handleDocumentMouseMove = (event: MouseEvent) => {
    if (!isScratching()) return;
    scratch(event.clientX, event.clientY);
  };

  const handleDocumentTouchMove = (event: TouchEvent) => {
    if (!isScratching()) return;
    const touch = event.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleDocumentMouseUp = () => {
    setIsScratching(false);
    checkCompletion();
  };

  const handleDocumentTouchEnd = () => {
    setIsScratching(false);
    checkCompletion();
  };

  onMount(() => {
    document.addEventListener("mousedown", handleDocumentMouseMove);
    document.addEventListener("mousemove", handleDocumentMouseMove);
    document.addEventListener("touchstart", handleDocumentTouchMove);
    document.addEventListener("touchmove", handleDocumentTouchMove);
    document.addEventListener("mouseup", handleDocumentMouseUp);
    document.addEventListener("touchend", handleDocumentTouchEnd);
    document.addEventListener("touchcancel", handleDocumentTouchEnd);
  });

  onCleanup(() => {
    document.removeEventListener("mousedown", handleDocumentMouseMove);
    document.removeEventListener("mousemove", handleDocumentMouseMove);
    document.removeEventListener("touchstart", handleDocumentTouchMove);
    document.removeEventListener("touchmove", handleDocumentTouchMove);
    document.removeEventListener("mouseup", handleDocumentMouseUp);
    document.removeEventListener("touchend", handleDocumentTouchEnd);
    document.removeEventListener("touchcancel", handleDocumentTouchEnd);
  });

  const handleMouseDown = () => {
    setIsScratching(true);
    isDrawing = false;
  };

  const handleTouchStart = () => {
    setIsScratching(true);
    isDrawing = false;
  };

  let lastX = 0;
  let lastY = 0;
  let isDrawing = false;

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left + 16;
      const y = clientY - rect.top + 16;

      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 60;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (isDrawing) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();

      lastX = x;
      lastY = y;
      isDrawing = true;
    }
  };

  const startAnimation = async () => {
    // Simple animation using CSS transitions
    const element = canvasRef?.parentElement;
    if (element) {
      element.style.transition = "transform 0.5s ease-in-out";
      element.style.transform = "scale(1.5) rotate(10deg)";

      setTimeout(() => {
        element.style.transform = "scale(1) rotate(0deg)";
        if (props.onComplete) {
          props.onComplete();
        }
      }, 1500);
    }
  };

  const checkCompletion = () => {
    if (isComplete()) return;

    const canvas = canvasRef;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const totalPixels = pixels.length / 4;
      let clearPixels = 0;

      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) clearPixels++;
      }

      const percentage = (clearPixels / totalPixels) * 100;
      const minPercentage = props.minScratchPercentage || 50;

      if (percentage >= minPercentage) {
        setIsComplete(true);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        startAnimation();
      }
    }
  };

  return (
    <div
      class={`relative select-none ${props.className || ""}`}
      style={{
        width: `${props.width}px`,
        height: `${props.height}px`,
        cursor:
          "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNSIgc3R5bGU9ImZpbGw6I2ZmZjtzdHJva2U6IzAwMDtzdHJva2Utd2lkdGg6MXB4OyIgLz4KPC9zdmc+'), auto",
      }}
    >
      <canvas
        ref={canvasRef}
        width={props.width}
        height={props.height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          "z-index": 10,
          "pointer-events": "auto",
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      />
      {props.children}
    </div>
  );
};
