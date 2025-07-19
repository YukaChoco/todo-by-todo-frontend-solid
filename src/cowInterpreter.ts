export function runCowInterpreter(code: string, input: string = ""): string {
  const memory: number[] = Array(30000).fill(0);
  let pointer = 0;
  let output: string = "";
  const inputArray = input.split("");
  let inputPointer = 0;

  console.log("code:", code);
  console.log("input:", input);

  console.log("first pointer:", pointer, "memory[pointer]:", memory[pointer]);

  // Tokenize the code
  const regex = /(?:moO|mOo|MoO|MOo|oom|OOM|MOO|moo|mOO|OOO|MMM|Moo)/g;
  const commands = code.match(regex) || [];

  // Build jump map
  const jumpMap: Record<number, number> = {};
  const stack: number[] = [];
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (cmd === "MOO") {
      stack.push(i);
    } else if (cmd === "moo") {
      if (stack.length === 0) {
        throw new Error(`Unmatched moo at ${i}`);
      }
      const start = stack.pop()!;
      jumpMap[start] = i;
      jumpMap[i] = start;
    }
  }
  if (stack.length > 0) {
    throw new Error(`Unmatched MOO at ${stack.pop()}`);
  }

  let outputCount = 0;

  // Execute commands
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (cmd === "Moo" || cmd === "OOM") {
      // console.log(
      //   `Command ${i}: ${cmd}, Pointer: ${pointer}, Memory[${pointer}]: ${memory[pointer]}, Output count: ${outputCount}`
      // );
    }

    // console.log(memory.filter((_, index) => index < 10));

    switch (cmd) {
      case "moO": // ポインタをインクリメント
        pointer++;
        // console.log(
        //   "moO pointer incremented / pointer:",
        //   pointer,
        //   "memory[pointer]:",
        //   memory[pointer]
        // );
        if (pointer >= memory.length) {
          console.error("pointer overflow");
          throw new Error("pointer overflow");
        }
        break;
      case "mOo": // ポインタをデクリメント
        if (pointer <= 0) {
          console.error("pointer underflow");
          throw new Error("pointer underflow");
        }
        pointer--;
        // console.log(
        //   "mOo pointer decremented / pointer:",
        //   pointer,
        //   "memory[pointer]:",
        //   memory[pointer]
        // );
        break;
      case "MoO": // ポインタの指す値をインクリメント
        // MEMO: ポインタの指す値が255の場合は0になる方が良かったかも
        memory[pointer] = memory[pointer] + 1;
        // console.log(
        //   "MoO pointer incremented / pointer:",
        //   pointer,
        //   "memory[pointer]:",
        //   memory[pointer]
        // );
        break;
      case "MOo": // ポインタの指す値をデクリメント
        if (memory[pointer] <= 0) {
          console.error("memory[pointer] underflow");
          throw new Error("memory[pointer] underflow");
        }
        // MEMO: ポインタの指す値が0の場合は255になる方が良かったかも
        memory[pointer] = memory[pointer] - 1;
        // console.log(
        //   "MOo pointer decremented / pointer:",
        //   pointer,
        //   "memory[pointer]:",
        //   memory[pointer]
        // );
        break;
      case "oom": // 入力から1バイトをポインタの指す値に代入
        if (inputPointer < inputArray.length) {
          memory[pointer] = inputArray[inputPointer++].charCodeAt(0) % 256;
        } else {
          memory[pointer] = 0;
        }
        // console.log(
        //   "oom input read / pointer:",
        //   pointer,
        //   "memory[pointer]:",
        //   memory[pointer]
        // );
        break;
      case "OOM": // ポインタの指す値をASCII文字として出力
        const char = String.fromCharCode(memory[pointer]);
        output += char;
        outputCount++;
        console.log(
          "OOM output / pointer:",
          pointer,
          "memory[pointer]:",
          memory[pointer],
          "char:",
          char,
          "output:",
          output
        );
        break;
      case "MOO": // ポインタの指す値が0なら、対応する「moo」にジャンプ
        if (memory[pointer] === 0) {
          i = jumpMap[i];
        }
        // console.log(
        //   "MOO jump / pointer:",
        //   pointer,
        //   "memory[pointer]:",
        //   memory[pointer]
        // );
        break;
      case "moo": // ポインタの指す値が非0なら、対応する「MOO」にジャンプ
        if (memory[pointer] !== 0) {
          i = jumpMap[i];
        }
        // console.log(
        //   "moo jump / pointer:",
        //   pointer,
        //   "memory[pointer]:",
        //   memory[pointer]
        // );
        break;
      case "mOO": // ポインタの指す値を特定の命令として実行（3は無効）
        break;
      case "OOO": // ポインタの指す値に0を代入
        memory[pointer] = 0;
        // console.log(
        //   "OOO memory[pointer] set to 0 / pointer:",
        //   pointer,
        //   "memory[pointer]:",
        //   memory[pointer]
        // );
        break;
      case "MMM": // レジスタに現在の値がない場合には現在のポインタの指す値をコピー。レジスタに値がある場合は、その値を現在のポインタの指す値に代入し、レジスタをクリアする
        memory[pointer] = memory[pointer];
        // console.log(
        //   "MMM memory[pointer] set to memory[pointer] / pointer:",
        //   pointer,
        //   "memory[pointer]:",
        //   memory[pointer]
        // );
        break;
      case "Moo": // ポインタの指す値が0なら「oom」、非0ならば「OOM」を実行
        if (memory[pointer] === 0) {
          if (inputPointer < inputArray.length) {
            const inputStr = inputArray[inputPointer++];
            if (inputStr >= "0" && inputStr <= "9") {
              memory[pointer] = parseInt(inputStr);
            } else {
              memory[pointer] = inputStr.charCodeAt(0) % 256;
            }
          } else {
            memory[pointer] = 0;
          }
        } else {
          const char = String.fromCharCode(memory[pointer]);
          output += char;
          outputCount++;
        }
        // console.log(
        //   "Moo output / pointer:",
        //   pointer,
        //   "memory[pointer]:",
        //   memory[pointer],
        //   "output:",
        //   output
        // );
        break;
      default:
        break;
    }
  }

  console.log("Execution completed. Final output:", output);
  console.log("Final memory state (first 20 cells):", memory.slice(0, 20));
  return output;
}
