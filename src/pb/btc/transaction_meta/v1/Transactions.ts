// Code generated by protoc-gen-as. DO NOT EDIT.
// Versions:
//   protoc-gen-as v1.3.0
//   protoc        v5.26.1

import { Writer, Reader } from "as-proto/assembly";
import { Transaction } from "./Transaction";

export class Transactions {
  static encode(message: Transactions, writer: Writer): void {
    const transactions = message.transactions;
    for (let i: i32 = 0; i < transactions.length; ++i) {
      writer.uint32(10);
      writer.fork();
      Transaction.encode(transactions[i], writer);
      writer.ldelim();
    }
  }

  static decode(reader: Reader, length: i32): Transactions {
    const end: usize = length < 0 ? reader.end : reader.ptr + length;
    const message = new Transactions();

    while (reader.ptr < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.transactions.push(
            Transaction.decode(reader, reader.uint32())
          );
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  }

  transactions: Array<Transaction>;

  constructor(transactions: Array<Transaction> = []) {
    this.transactions = transactions;
  }
}
