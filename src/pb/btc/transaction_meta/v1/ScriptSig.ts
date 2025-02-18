// Code generated by protoc-gen-as. DO NOT EDIT.
// Versions:
//   protoc-gen-as v1.3.0
//   protoc        v5.26.1

import { Writer, Reader } from "as-proto/assembly";

export class ScriptSig {
  static encode(message: ScriptSig, writer: Writer): void {
    writer.uint32(10);
    writer.string(message.asm);

    writer.uint32(18);
    writer.string(message.hex);
  }

  static decode(reader: Reader, length: i32): ScriptSig {
    const end: usize = length < 0 ? reader.end : reader.ptr + length;
    const message = new ScriptSig();

    while (reader.ptr < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.asm = reader.string();
          break;

        case 2:
          message.hex = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  }

  asm: string;
  hex: string;

  constructor(asm: string = "", hex: string = "") {
    this.asm = asm;
    this.hex = hex;
  }
}
