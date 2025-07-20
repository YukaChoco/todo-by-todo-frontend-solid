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
  var cream = "#F1F0ED";
  var yellow = "#EFB91B";
  var glassColor = "#639BC0";
  var eyeBlowColor = "#856558";

  var illo = new Zdog.Illustration({
    element: ".zdog-canvas",
    dragRotate: true,
  });

  var hedgehog = new Zdog.Anchor({
    addTo: illo,
    translate: { y: 0 },
  });

  // ハリネズミの体
  new Zdog.Cone({
    addTo: hedgehog,
    diameter: 20,
    length: 40,
    stroke: 90,
    color: bodyColor,
    fill: true,
    rotate: { x: Zdog.TAU / 4, y: 0, z: 0 },
    translate: { y: 50, z: 25 },
    backface: true,
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
    backface: true,
  });

  // 鼻
  var nose = new Zdog.Shape({
    addTo: head,
    path: [{ z: 0 }, { z: 10 }],
    stroke: 30,
    color: noseColor,
    translate: { z: 40, y: 10 },
    backface: true,
  });

  //   鼻の頭の部分
  new Zdog.Shape({
    addTo: nose,
    path: [{ x: 2 }, { x: -2 }],
    stroke: 10,
    color: blueGrayColor,
    translate: { z: 20, y: -5 },
    backface: true,
  });

  //
  var eyeGroup = new Zdog.Group({
    addTo: head,
  });
  new Zdog.Shape({
    addTo: eyeGroup,
    path: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
    stroke: 12,
    color: blueGrayColor,
    translate: { z: 30, x: 20, y: 0 },
    backface: true,
  });
  new Zdog.Shape({
    addTo: eyeGroup,
    path: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
    stroke: 5,
    color: cream,
    translate: { z: 30, x: 20, y: -2 },
    front: { z: 2 },
    updateSort: true,
    backface: true,
  });

  new Zdog.Shape({
    addTo: eyeGroup,
    path: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
    stroke: 12,
    color: blueGrayColor,
    translate: { z: 30, x: -20, y: 0 },
    backface: true,
  });
  new Zdog.Shape({
    addTo: eyeGroup,
    path: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
    stroke: 5,
    color: cream,
    translate: { z: 30, x: -20, y: -2 },
    front: { z: 2 },
    updateSort: true,
    backface: true,
  });

  var glassGroup = new Zdog.Group({
    addTo: head,
    translate: { z: 30, x: 0, y: -20 },
  });

  new Zdog.Shape({
    addTo: glassGroup,
    path: [
      { x: 20, y: 0 },
      { x: -20, y: 0 },
    ],
    stroke: 6,
    color: blueGrayColor,
    translate: { z: 0, x: 0, y: 0 },
    backface: true,
  });

  new Zdog.Shape({
    addTo: glassGroup,
    path: [
      { x: 5, y: 0 },
      { x: -5, y: 0 },
    ],
    stroke: 6,
    color: eyeBlowColor,
    translate: { z: 0, x: 20, y: 8 },
    rotate: { x: 0, y: 0, z: 0.2 },
    backface: true,
  });
  new Zdog.Shape({
    addTo: glassGroup,
    path: [
      { x: 5, y: 0 },
      { x: -5, y: 0 },
    ],
    stroke: 6,
    color: eyeBlowColor,
    translate: { z: 0, x: -20, y: 8 },
    rotate: { x: 0, y: 0, z: -0.2 },
    backface: true,
  });

  new Zdog.Shape({
    addTo: glassGroup,
    path: [
      { x: 5, y: 0 },
      { x: -5, y: 0 },
    ],
    stroke: 16,
    color: blueGrayColor,
    translate: { z: 0, x: 20, y: 0 },
    backface: true,
  });
  new Zdog.Shape({
    addTo: glassGroup,
    path: [
      { x: 5, y: 0 },
      { x: -5, y: 0 },
    ],
    stroke: 8,
    color: glassColor,
    translate: { z: 0, x: 20, y: 0 },
    front: { z: 2 },
    updateSort: true,
    backface: true,
  });

  new Zdog.Shape({
    addTo: glassGroup,
    path: [
      { x: 5, y: 0 },
      { x: -5, y: 0 },
    ],
    stroke: 16,
    color: blueGrayColor,
    translate: { z: 0, x: -20, y: 0 },
    backface: true,
  });
  new Zdog.Shape({
    addTo: glassGroup,
    path: [
      { x: 5, y: 0 },
      { x: -5, y: 0 },
    ],
    stroke: 8,
    color: glassColor,
    translate: { z: 0, x: -20, y: 0 },
    front: { z: 2 },
    updateSort: true,
    backface: true,
  });

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
      backface: true,
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
    backface: true,
  });
  new Zdog.Cone({
    addTo: hedgehog,
    diameter: 20,
    length: 30,
    stroke: 15,
    color: lightBlueGrayColor,
    translate: { x: 30, y: 0, z: 100 }, // 前足左
    backface: true,
  });

  // 体の針
  var bodySpineCount = 500;
  for (var i = 0; i < bodySpineCount; i++) {
    var angle = (i / bodySpineCount) * Math.PI * 2;
    var radius = 5 + Math.random() * 30;
    var x = Math.random() * 3.5 - 3;
    var y = Math.random() * 3.5 - 1;
    // 頭の丸みに沿わせる

    new Zdog.Shape({
      addTo: hedgehog,
      path: [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: -40 * Math.random() - 15 },
      ],
      stroke: 15,
      color: yellow,
      translate: { x: x * 5, y: y * 20 + 10, z: 10 },
      rotate: { x: Math.random() * 3.5 - 1.5, y: Math.random() * 3.5 - 1.5 },
      backface: true,
    });
  }

  // 頭の針（少なめ）
  var headSpineCount = 300;
  for (var i = 0; i < headSpineCount; i++) {
    var angle = (i / headSpineCount) * Math.PI * 2;
    var radius = 5 + Math.random() * 30;
    var x = Math.random() * 3.5 - 3;
    var y = Math.random() * 3.5 - 1;
    // 頭の丸みに沿わせる

    new Zdog.Shape({
      addTo: head,
      path: [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: -40 * Math.random() - 15 },
      ],
      stroke: 15,
      color: yellow,
      translate: { x: x * 5, y: y * 20, z: -15 },
      rotate: { x: Math.random() * 3.5 - 1.5, y: Math.random() * 3.5 - 1.5 },
      backface: true,
    });
  }
  //   var headSpineCount = 150;
  //   for (var i = 0; i < headSpineCount; i++) {
  //     var angle = (i / headSpineCount) * Math.PI * 2;
  //     var radius = 5 + Math.random() * 35;
  //     var x = Math.cos(angle) * radius;
  //     var y = Math.sin(angle) * radius;
  //     // 頭の丸みに沿わせる

  //     new Zdog.Shape({
  //       addTo: head,
  //       path: [
  //         { x: 0, y: 0, z: 0 },
  //         { x: 0, y: 0, z: 12 * Math.random() * 2 },
  //       ],
  //       stroke: 15,
  //       color: darkBrown,
  //       translate: { x: x, y: y, z: -35 },
  //       rotate: { x: Math.random() * 0.2 - 0.1, y: Math.random() * 0.2 - 0.1 },
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
