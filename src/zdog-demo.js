// Zdog 3D Animation Demo
document.addEventListener("DOMContentLoaded", function () {
  // canvas要素を取得
  const canvas = document.querySelector(".zdog-canvas");

  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }

  // Zdog Illustrationを作成
  const illo = new Zdog.Illustration({
    element: canvas,
    zoom: 1,
    dragRotate: true,
  });

  // 簡単な3Dオブジェクトを作成（例：立方体）
  const box = new Zdog.Box({
    addTo: illo,
    width: 80,
    height: 80,
    depth: 80,
    stroke: false,
    color: "#636",
    leftFace: "#c25",
    rightFace: "#e62",
    topFace: "#ea0",
    bottomFace: "#a0c",
  });

  // アニメーションループ
  function animate() {
    illo.rotate.y += 0.01;
    illo.rotate.x += 0.005;
    illo.updateRenderGraph();
    requestAnimationFrame(animate);
  }

  // アニメーション開始
  animate();
});
