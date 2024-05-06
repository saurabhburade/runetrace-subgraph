import {
  AllRuneData,
  AllRuneDayData,
  Edict,
  Runestone as RunestoneData,
  RunestoneDayData,
  RunestoneTransaction,
} from "../../generated/schema";
import { Transaction as ProtoTransaction } from "../pb/ordinals/v1/Transaction";
import { Block as ProtoBlock } from "../pb/ordinals/v1/Block";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { ONE_BI, ZERO_BD, ZERO_BI } from "../constants";

export function updateRuneDayData(
  runeData: RunestoneData,
  runeTransaction: RunestoneTransaction,
  blockTime: BigInt,
  blockNumber: BigInt,
  txFee: BigDecimal
): void {
  if (runeData !== null) {
    // UPDATE RUNE DAY DATA
    let timestamp = blockTime;
    let dayID = timestamp.div(BigInt.fromI32(86400));
    let pdayID = timestamp
      .minus(BigInt.fromI32(86400))
      .div(BigInt.fromI32(86400));
    let dayStartTimestamp = dayID.times(BigInt.fromI32(86400));
    let prevdayStartTimestamp = pdayID.times(BigInt.fromI32(86400));

    let runeDayID = runeData.id
      .toString()
      .concat("-")
      .concat(dayID.toString());
    let runePrevDayID = runeData.id
      .toString()
      .concat("-")
      .concat(pdayID.toString());
    let runeDayData = RunestoneDayData.load(runeDayID);
    let runePrevDayData = RunestoneDayData.load(runePrevDayID);
    if (runeDayData === null) {
      runeDayData = new RunestoneDayData(runeDayID);
      runeDayData.date = dayStartTimestamp;
      runeDayData.prevDate = prevdayStartTimestamp;
      runeDayData.edictsTxCount = ZERO_BI;
      runeDayData.txCount = ZERO_BI;
      runeDayData.mintsTxCount = ZERO_BI;
      runeDayData.pointerTxCount = ZERO_BI;
      runeDayData.fees = ZERO_BD;
      runeDayData.volume = ZERO_BD;
    }

    if (runeTransaction.type === "MINT") {
      runeDayData.mintsTxCount = runeDayData.mintsTxCount!.plus(ONE_BI);
      if (
        runeDayData !== null &&
        runeDayData.volume !== null &&
        runeData.termAmount !== null
      ) {
        runeDayData.volume = runeDayData.volume!.plus(runeData.termAmount!);
      }
    }
    if (runeTransaction.type === "POINTER") {
      runeDayData.pointerTxCount = runeDayData.pointerTxCount!.plus(ONE_BI);
    }
    if (runeTransaction.type === "EDICT") {
      if (
        runeTransaction.edicts !== null &&
        runeTransaction.edicts!.length > 0
      ) {
        for (let index = 0; index < runeTransaction.edicts!.length; index++) {
          const element = runeTransaction.edicts![index];
          if (element !== null) {
            const edictData = Edict.load(element);
            if (edictData !== null) {
              if (runeDayData.volume !== null) {
                runeDayData.volume = runeDayData.volume!.plus(
                  BigDecimal.fromString(edictData.amount)
                );
              }
            }
          }
        }
      }
      runeDayData.edictsTxCount = runeDayData.edictsTxCount!.plus(ONE_BI);
    }
    runeDayData.txCount = runeDayData.txCount!.plus(ONE_BI);

    runeDayData.lastBlock = blockNumber;
    runeDayData.rune = runeData.id;
    runeDayData.save();

    // ALL RUNE DAY DATA
    let allRuneDayData = AllRuneDayData.load(
      "all-rune-".concat(dayID.toString())
    );
    if (allRuneDayData === null) {
      allRuneDayData = new AllRuneDayData("all-rune-".concat(dayID.toString()));
      allRuneDayData.date = dayStartTimestamp;
      allRuneDayData.prevDate = prevdayStartTimestamp;
      allRuneDayData.edictsTxCount = ZERO_BI;
      allRuneDayData.etchingTxCount = ZERO_BI;
      allRuneDayData.txCount = ZERO_BI;
      allRuneDayData.mintsTxCount = ZERO_BI;
      allRuneDayData.pointerTxCount = ZERO_BI;
      allRuneDayData.fees = ZERO_BD;
    }

    if (runeTransaction.type === "MINT") {
      allRuneDayData.mintsTxCount = allRuneDayData.mintsTxCount!.plus(ONE_BI);
    }
    if (runeTransaction.type === "ETCHING") {
      allRuneDayData.etchingTxCount = allRuneDayData.etchingTxCount!.plus(
        ONE_BI
      );
    }
    if (runeTransaction.type === "POINTER") {
      allRuneDayData.pointerTxCount = allRuneDayData.pointerTxCount!.plus(
        ONE_BI
      );
    }
    if (runeTransaction.type === "EDICT") {
      allRuneDayData.edictsTxCount = allRuneDayData.edictsTxCount!.plus(ONE_BI);
    }
    allRuneDayData.txCount = allRuneDayData.txCount!.plus(ONE_BI);
    allRuneDayData.lastBlock = blockNumber;
    allRuneDayData.save();

    // ALL RUNE  DATA
    let allRuneData = AllRuneData.load("RUNES");
    if (allRuneData === null) {
      allRuneData = new AllRuneData("RUNES");
      allRuneData.edictsTxCount = ZERO_BI;
      allRuneData.txCount = ZERO_BI;
      allRuneData.mintsTxCount = ZERO_BI;
      allRuneData.etchingTxCount = ZERO_BI;
      allRuneData.pointerTxCount = ZERO_BI;
      allRuneData.fees = ZERO_BD;

      // allRuneDayData.date = dayStartTimestamp;
      // allRuneDayData.prevDate = prevdayStartTimestamp;
      // allRuneDayData.edictsTxCount = ZERO_BI;
      // allRuneDayData.txCount = ZERO_BI;
      // allRuneDayData.mintsTxCount = ZERO_BI;
      // allRuneDayData.pointerTxCount = ZERO_BI;
      // allRuneDayData.fees = ZERO_BD;
    }
    if (runeTransaction.type === "ETCHING") {
      allRuneData.etchingTxCount = allRuneData.etchingTxCount!.plus(ONE_BI);
    }
    if (runeTransaction.type === "MINT") {
      allRuneData.mintsTxCount = allRuneData.mintsTxCount!.plus(ONE_BI);
    }
    if (runeTransaction.type === "POINTER") {
      allRuneData.pointerTxCount = allRuneData.pointerTxCount!.plus(ONE_BI);
    }
    if (runeTransaction.type === "EDICT") {
      allRuneData.edictsTxCount = allRuneData.edictsTxCount!.plus(ONE_BI);
    }
    allRuneData.txCount = allRuneData.txCount!.plus(ONE_BI);
    allRuneData.lastBlock = blockNumber;
    allRuneData.save();
  }
}
