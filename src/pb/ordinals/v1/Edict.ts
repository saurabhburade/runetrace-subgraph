// Code generated by protoc-gen-as. DO NOT EDIT.
// Versions:
//   protoc-gen-as v1.3.0
//   protoc        v5.26.1

import { Writer, Reader } from "as-proto/assembly";
import { RuneId } from "./RuneId";

export class Edict {
  static encode(message: Edict, writer: Writer): void {
    const id = message.id;
    if (id !== null) {
      writer.uint32(10);
      writer.fork();
      RuneId.encode(id, writer);
      writer.ldelim();
    }

    writer.uint32(18);
    writer.string(message.amount);

    writer.uint32(26);
    writer.string(message.output);
  }

  static decode(reader: Reader, length: i32): Edict {
    const end: usize = length < 0 ? reader.end : reader.ptr + length;
    const message = new Edict();

    while (reader.ptr < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = RuneId.decode(reader, reader.uint32());
          break;

        case 2:
          message.amount = reader.string();
          break;

        case 3:
          message.output = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  }

  id: RuneId | null;
  amount: string;
  output: string;

  constructor(
    id: RuneId | null = null,
    amount: string = "",
    output: string = ""
  ) {
    this.id = id;
    this.amount = amount;
    this.output = output;
  }
}
