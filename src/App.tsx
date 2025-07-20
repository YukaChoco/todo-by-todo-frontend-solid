import { type Component } from "solid-js";
import CubeScene from "./components/cube/CubeScene";

const App: Component = () => {
  return (
    <div>
      <CubeScene />
      <canvas
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          "z-index": 1,
          "pointer-events": "auto",
        }}
        width={window.innerWidth}
        height={window.innerHeight}
        class="zdog-canvas"
      ></canvas>
    </div>
  );
};

export default App;
