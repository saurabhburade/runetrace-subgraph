// Code generated by protoc-gen-as. DO NOT EDIT.
// Versions:
//   protoc-gen-as v1.3.0
//   protoc        v5.26.1

import { Writer, Reader } from "as-proto/assembly";
import { ScriptSig } from "./ScriptSig";

export class Vin {
  static encode(message: Vin, writer: Writer): void {
    writer.uint32(10);
    writer.string(message.txid);

    writer.uint32(16);
    writer.uint32(message.vout);

    const scriptSig = message.scriptSig;
    if (scriptSig !== null) {
      writer.uint32(26);
      writer.fork();
      ScriptSig.encode(scriptSig, writer);
      writer.ldelim();
    }

    writer.uint32(32);
    writer.uint32(message.sequence);

    const txinwitness = message.txinwitness;
    if (txinwitness.length !== 0) {
      for (let i: i32 = 0; i < txinwitness.length; ++i) {
        writer.uint32(42);
        writer.string(txinwitness[i]);
      }
    }

    writer.uint32(50);
    writer.string(message.coinbase);

    writer.uint32(58);
    writer.string(message.address);
  }

  static decode(reader: Reader, length: i32): Vin {
    const end: usize = length < 0 ? reader.end : reader.ptr + length;
    const message = new Vin();

    while (reader.ptr < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.txid = reader.string();
          break;

        case 2:
          message.vout = reader.uint32();
          break;

        case 3:
          message.scriptSig = ScriptSig.decode(reader, reader.uint32());
          break;

        case 4:
          message.sequence = reader.uint32();
          break;

        case 5:
          message.txinwitness.push(reader.string());
          break;

        case 6:
          message.coinbase = reader.string();
          break;

        case 7:
          message.address = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  }

  txid: string;
  vout: u32;
  scriptSig: ScriptSig | null;
  sequence: u32;
  txinwitness: Array<string>;
  coinbase: string;
  address: string;

  constructor(
    txid: string = "",
    vout: u32 = 0,
    scriptSig: ScriptSig | null = null,
    sequence: u32 = 0,
    txinwitness: Array<string> = [],
    coinbase: string = "",
    address: string = ""
  ) {
    this.txid = txid;
    this.vout = vout;
    this.scriptSig = scriptSig;
    this.sequence = sequence;
    this.txinwitness = txinwitness;
    this.coinbase = coinbase;
    this.address = address;
  }
}
