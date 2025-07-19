export function runCowInterpreter(code: string, input: string = ""): string {
  const memory: number[] = Array(30000).fill(0);
  let pointer = 0;
  let output = "";
  const inputArray = input.split("");
  let inputPointer = 0;

  console.log("code:", code);
  console.log("input:", input);

  // Tokenize the code
  const regex = /(?:moO|mOo|MoO|MOo|oom|OOM|MOO|moo|mOO|OOO|MMM|Moo)/g;
  const commands = code.match(regex) || [];
  console.log("Tokenized commands:", commands);
  console.log("Total commands:", commands.length);
  console.log("Raw code:", code);

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

  console.log("Jump map:", jumpMap);
  console.log("Starting execution...");
  console.log("Total commands:", commands.length);
  let outputCount = 0;

  // Execute commands
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    if (cmd === "Moo" || cmd === "OOM") {
      console.log(
        `Command ${i}: ${cmd}, Pointer: ${pointer}, Memory[${pointer}]: ${memory[pointer]}, Output count: ${outputCount}`
      );
    }

    switch (cmd) {
      case "moO": // ポインタをインクリメント
        pointer++;
        break;
      case "mOo": // ポインタをデクリメント
        pointer--;
        break;
      case "MoO": // ポインタの指す値をインクリメント
        memory[pointer] = (memory[pointer] + 1) % 256;
        break;
      case "MOo": // ポインタの指す値をデクリメント
        memory[pointer] = (memory[pointer] - 1 + 256) % 256;
        break;
      case "oom": // 入力から1バイトをポインタの指す値に代入
        if (inputPointer < inputArray.length) {
          memory[pointer] = inputArray[inputPointer++].charCodeAt(0) % 256;
        } else {
          memory[pointer] = 0;
        }
        break;
      case "OOM": // ポインタの指す値をASCII文字として出力
        const char = String.fromCharCode(memory[pointer]);
        output += char;
        outputCount++;
        console.log(
          `OOM: Output: ${char} (ASCII: ${memory[pointer]}, hex: 0x${memory[
            pointer
          ].toString(16)})`
        );
        break;
      case "MOO": // ポインタの指す値が0なら、対応する「moo」にジャンプ
        if (memory[pointer] === 0) {
          i = jumpMap[i];
        }
        break;
      case "moo": // ポインタの指す値が非0なら、対応する「MOO」にジャンプ
        if (memory[pointer] !== 0) {
          i = jumpMap[i];
        }
        break;
      case "mOO": // ポインタの指す値を特定の命令として実行（3は無効）
        break;
      case "OOO": // ポインタの指す値に0を代入
        memory[pointer] = 0;
        break;
      case "MMM": // レジスタに現在の値がない場合には現在のポインタの指す値をコピー。レジスタに値がある場合は、その値を現在のポインタの指す値に代入し、レジスタをクリアする
        memory[pointer] = memory[pointer];
        break;
      case "Moo": // ポインタの指す値が0なら「oom」、非0ならば「OOM」を実行
        if (memory[pointer] === 0) {
          if (inputPointer < inputArray.length) {
            memory[pointer] = inputArray[inputPointer++].charCodeAt(0) % 256;
            console.log(
              `Moo: Input read, memory[${pointer}] = ${memory[pointer]}`
            );
          } else {
            memory[pointer] = 0;
            console.log(`Moo: No input available, memory[${pointer}] = 0`);
          }
        } else {
          const char = String.fromCharCode(memory[pointer]);
          output += char;
          outputCount++;
          console.log(
            `Moo: Output: ${char} (ASCII: ${memory[pointer]}, hex: 0x${memory[
              pointer
            ].toString(16)})`
          );
        }
        break;
      default:
        break;
    }
  }

  console.log("Execution completed. Final output:", output);
  console.log("Final memory state (first 20 cells):", memory.slice(0, 20));
  return output;
}
