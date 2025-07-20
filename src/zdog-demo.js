// Zdog 3D Animation Demo - Hedgehog
document.addEventListener("DOMContentLoaded", function () {
  // canvas要素を取得
  const canvas = document.querySelector(".zdog-canvas");

  if (!canvas) {
    console.error("Canvas element not found");
    return;
  }

  // Made with Zdog

  var bodyColor = "#F0DFCD";
  var noseColor = "#EED6BA";
  var blueGrayColor = "#44484B";
  var lightBlueGrayColor = "#5A5C5B";
  var darkBrown = "#654321";
  var lightBrown = "#D2691E";
  var cream = "#F5DEB3";
  var black = "#000000";

  var illo = new Zdog.Illustration({
    element: ".zdog-canvas",
    dragRotate: true,
  });

  var hedgehog = new Zdog.Anchor({
    addTo: illo,
    translate: { y: 0 },
  });

  // ハリネズミの体
  var body = new Zdog.Cone({
    addTo: hedgehog,
    diameter: 20,
    length: 40,
    stroke: 90,
    color: bodyColor,
    fill: true,
    rotate: { x: Zdog.TAU / 4, y: 0, z: 0 },
    translate: { y: 50, z: 25 },
  });

  // アーモンド
  //   var almond = new Zdog.Shape({
  //     addTo: body,
  //     path: [
  //       { x: 0, y: 0 },
  //       { x: 0, y: 20 },
  //     ],
  //     stroke: 50,
  //     color: lightBrown,
  //     translate: { z: 50, y: -20 },
  //   });

  // 頭（小さめの楕円）
  var head = new Zdog.Shape({
    addTo: hedgehog,
    path: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
    stroke: 90,
    color: bodyColor,
    translate: { z: 30, y: -60 },
  });

  // 鼻
  var nose = new Zdog.Shape({
    addTo: head,
    path: [{ z: 0 }, { z: 10 }],
    stroke: 30,
    color: noseColor,
    translate: { z: 40, y: 10 },
  });

  //   鼻の頭の部分
  new Zdog.Shape({
    addTo: nose,
    path: [{ x: 2 }, { x: -2 }],
    stroke: 10,
    color: blueGrayColor,
    translate: { z: 20, y: -5 },
  });

  // 目
  //   new Zdog.Shape({
  //     addTo: head,
  //     path: [
  //       { x: 0, y: 0 },
  //       { x: 0, y: 4 },
  //     ],
  //     stroke: 4,
  //     color: black,
  //     translate: { z: 20, x: -15, y: -10 },
  //   });

  //   new Zdog.Shape({
  //     addTo: head,
  //     path: [
  //       { x: 0, y: 0 },
  //       { x: 0, y: 4 },
  //     ],
  //     stroke: 4,
  //     color: black,
  //     translate: { z: 20, x: 15, y: -10 },
  //   });

  // 耳
  //   new Zdog.Ellipse({
  //     addTo: head,
  //     diameter: 20,
  //     stroke: 10,
  //     color: cream,
  //     fill: true,
  //     translate: { z: 15, x: -20, y: -25 },
  //   });

  //   new Zdog.Ellipse({
  //     addTo: head,
  //     diameter: 20,
  //     stroke: 10,
  //     color: cream,
  //     fill: true,
  //     translate: { z: 15, x: 20, y: -25 },
  //   });

  // 足（4本）
  var legPositions = [
    { x: 30, y: 70, z: 65 }, // 前足左
    { x: 30, y: 0, z: 50 }, // 前足右
    { x: -30, y: 70, z: 50 }, // 後足左
    { x: -30, y: 0, z: 65 }, // 後足右
  ];

  legPositions.forEach((pos) => {
    // z方向への30,それ以外に10の円錐
    new Zdog.Cone({
      addTo: hedgehog,
      diameter: 10,
      length: 30,
      stroke: 30,
      color: bodyColor,
      translate: pos,
    });
  });

  // スコップ
  new Zdog.Cone({
    addTo: hedgehog,
    diameter: 5,
    length: 20,
    stroke: 15,
    color: blueGrayColor,
    translate: { x: 30, y: 0, z: 80 }, // 前足左
  });
  new Zdog.Cone({
    addTo: hedgehog,
    diameter: 20,
    length: 30,
    stroke: 15,
    color: lightBlueGrayColor,
    translate: { x: 30, y: 0, z: 100 }, // 前足左
  });

  // 針（背中に複数の小さな円錐）
  //   var spineCount = 15;
  //   for (var i = 0; i < spineCount; i++) {
  //     var angle = i / spineCount;
  //     var radius = 40 + Math.random() * 20;
  //     var x = Math.cos(angle) * radius;
  //     var y = Math.sin(angle) * radius - 30;

  //     new Zdog.Shape({
  //       addTo: hedgehog,
  //       path: [
  //         { x: 0, y: 0 },
  //         { x: 0, y: -15 },
  //       ],
  //       stroke: 8,
  //       color: darkBrown,
  //       translate: { x: x, y: y, z: 25 },
  //       rotate: { x: Math.random() * 0.5 - 0.25, y: Math.random() * 0.5 - 0.25 },
  //     });
  //   }

  // 尻尾
  //   new Zdog.Shape({
  //     addTo: hedgehog,
  //     path: [
  //       { x: 0, y: 0 },
  //       { x: 0, y: 20 },
  //     ],
  //     stroke: 12,
  //     color: cream,
  //     translate: { z: -40, y: -10 },
  //   });

  // アニメーションループ
  function animate() {
    // illo.rotate.y += 0.01;
    // illo.rotate.x += 0.005;
    illo.updateRenderGraph();
    requestAnimationFrame(animate);
  }

  // アニメーション開始
  animate();
});
