// Code generated by protoc-gen-as. DO NOT EDIT.
// Versions:
//   protoc-gen-as v1.3.0
//   protoc        v5.26.1

import { Writer, Reader } from "as-proto/assembly";
import { OrdinalBlock } from "./OrdinalBlock";
import { Inscription } from "./Inscription";
import { RunestoneBuf } from "./RunestoneBuf";

export class Transaction {
  static encode(message: Transaction, writer: Writer): void {
    writer.uint32(10);
    writer.string(message.txid);

    writer.uint32(16);
    writer.uint64(message.idx);

    writer.uint32(24);
    writer.uint64(message.amount);

    const coinbaseOrdinals = message.coinbaseOrdinals;
    for (let i: i32 = 0; i < coinbaseOrdinals.length; ++i) {
      writer.uint32(34);
      writer.fork();
      OrdinalBlock.encode(coinbaseOrdinals[i], writer);
      writer.ldelim();
    }

    const inputUtxos = message.inputUtxos;
    if (inputUtxos.length !== 0) {
      for (let i: i32 = 0; i < inputUtxos.length; ++i) {
        writer.uint32(42);
        writer.string(inputUtxos[i]);
      }
    }

    const relativeOrdinals = message.relativeOrdinals;
    for (let i: i32 = 0; i < relativeOrdinals.length; ++i) {
      writer.uint32(50);
      writer.fork();
      OrdinalBlock.encode(relativeOrdinals[i], writer);
      writer.ldelim();
    }

    const inscriptions = message.inscriptions;
    for (let i: i32 = 0; i < inscriptions.length; ++i) {
      writer.uint32(58);
      writer.fork();
      Inscription.encode(inscriptions[i], writer);
      writer.ldelim();
    }

    const rune = message.rune;
    if (rune !== null) {
      writer.uint32(66);
      writer.fork();
      RunestoneBuf.encode(rune, writer);
      writer.ldelim();
    }
  }

  static decode(reader: Reader, length: i32): Transaction {
    const end: usize = length < 0 ? reader.end : reader.ptr + length;
    const message = new Transaction();

    while (reader.ptr < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.txid = reader.string();
          break;

        case 2:
          message.idx = reader.uint64();
          break;

        case 3:
          message.amount = reader.uint64();
          break;

        case 4:
          message.coinbaseOrdinals.push(
            OrdinalBlock.decode(reader, reader.uint32())
          );
          break;

        case 5:
          message.inputUtxos.push(reader.string());
          break;

        case 6:
          message.relativeOrdinals.push(
            OrdinalBlock.decode(reader, reader.uint32())
          );
          break;

        case 7:
          message.inscriptions.push(
            Inscription.decode(reader, reader.uint32())
          );
          break;

        case 8:
          message.rune = RunestoneBuf.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  }

  txid: string;
  idx: u64;
  amount: u64;
  coinbaseOrdinals: Array<OrdinalBlock>;
  inputUtxos: Array<string>;
  relativeOrdinals: Array<OrdinalBlock>;
  inscriptions: Array<Inscription>;
  rune: RunestoneBuf | null;

  constructor(
    txid: string = "",
    idx: u64 = 0,
    amount: u64 = 0,
    coinbaseOrdinals: Array<OrdinalBlock> = [],
    inputUtxos: Array<string> = [],
    relativeOrdinals: Array<OrdinalBlock> = [],
    inscriptions: Array<Inscription> = [],
    rune: RunestoneBuf | null = null
  ) {
    this.txid = txid;
    this.idx = idx;
    this.amount = amount;
    this.coinbaseOrdinals = coinbaseOrdinals;
    this.inputUtxos = inputUtxos;
    this.relativeOrdinals = relativeOrdinals;
    this.inscriptions = inscriptions;
    this.rune = rune;
  }
}
