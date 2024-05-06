import { BigDecimal, bigDecimal, log, BigInt } from "@graphprotocol/graph-ts";
import { Edict } from "../pb/ordinals/v1/Edict";
import { Etching } from "../pb/ordinals/v1/Etching";
import { RunestoneBuf } from "../pb/ordinals/v1/RunestoneBuf";
import { RuneId } from "../pb/ordinals/v1/RuneId";
import { Transaction as ProtoTransaction } from "../pb/ordinals/v1/Transaction";
import {
  Runestone as RunestoneData,
  RunestoneTransaction,
  Utxo,
  Edict as EdictData,
} from "../../generated/schema";
import { ONE_BI, ZERO_BD, ZERO_BI } from "../constants";
import { updateRuneDayData } from "../entities/updateDatas";

export function handleEtching(
  etching: Etching,
  runestone: RunestoneBuf,
  transaction: ProtoTransaction,
  blockTime: BigInt,
  blockNumber: BigInt
): RunestoneTransaction | null {
  log.info("Processing Rune id:: {} ==  {} == {}", [
    etching.id!.block.toString(),
    etching.id!.tx.toString(),
    etching.rune.toString(),
    etching.symbol.toString(),
  ]);
  if (etching.rune !== null && etching.rune === "MEMEECONOMICS") {
    log.info("Processing Rune MEMEECONOMICS {} == {}", [
      etching.rune.toString(),
      etching.symbol.toString(),
    ]);
    // return null;
  }
  if (etching.id !== null) {
    const newRunestone = new RunestoneData(
      etching
        .id!.block.toString()
        .concat(":")
        .concat(etching.id!.tx.toString())
    );
    newRunestone.runeId =
      etching.id!.block.toString().concat(":") + etching.id!.tx.toString();
    newRunestone.name = etching.rune;
    newRunestone.symbol = etching.symbol;
    if (etching.spacers !== null) {
      newRunestone.spacers = BigDecimal.fromString(etching.spacers);
    }
    newRunestone.divisibility = ZERO_BD;
    if (etching.divisibility >= 0) {
      newRunestone.divisibility = BigDecimal.fromString(
        BigInt.fromI32(etching.divisibility).toString()
      );
    }

    if (etching.premine !== null && etching.premine !== "") {
      newRunestone.premine = BigDecimal.fromString(etching.premine);
    }

    if (etching.supply !== null && etching.supply !== "") {
      newRunestone.supply = BigDecimal.fromString(etching.supply);
    }
    if (etching.turbo) {
      newRunestone.turbo = etching.turbo;
    }
    if (etching.terms !== null) {
      if (etching.terms!.cap !== null && etching.terms!.cap !== "") {
        newRunestone.termCap = BigDecimal.fromString(etching.terms!.cap);
      }

      if (etching.terms!.amount !== null && etching.terms!.amount !== "") {
        newRunestone.termAmount = BigDecimal.fromString(etching.terms!.amount);
      }
    }
    if (transaction.txid !== null) {
      newRunestone.transactions = [];
      if (newRunestone.transactions!.length === 0) {
        newRunestone.transactions!.push(transaction.txid as string);
      }
      newRunestone.etchTx = transaction.txid as string;
    }

    if (transaction.inputUtxos !== null && transaction.inputUtxos.length > 0) {
      const inputUtxo = transaction.inputUtxos[0];
      const utxoData = Utxo.load(inputUtxo);
      if (utxoData !== null) {
        newRunestone.creator = utxoData.address;
      }
    }
    // let inputAmount = ZERO_BI;
    // for (let index = 0; index < transaction.inputUtxos.length; index++) {
    //   const element = transaction.inputUtxos[index];
    //   const utxo = Utxo.load(element);
    //   if (utxo !== null) {
    //     inputAmount = inputAmount.plus(utxo.amount);
    //   }
    // }
    // let outputAmount = ZERO_BI;
    // for (let index = 0; index < transaction..length; index++) {
    //   const element = transaction.inputUtxos[index];
    //   const utxo = Utxo.load(element);
    //   if (utxo !== null) {
    //     inputAmount = inputAmount.plus(utxo.amount);
    //   }
    // }
    newRunestone.totalTxCount = ONE_BI;
    newRunestone.edictTxCount = ZERO_BI;
    newRunestone.mintTxCount = ZERO_BI;
    newRunestone.pointerTxCount = ZERO_BI;
    newRunestone.save();
    if (transaction.txid !== null) {
      const newRuneStoneTransaction = new RunestoneTransaction(
        (transaction.txid as string).concat(":ETCHING")
      );
      newRuneStoneTransaction.edicts = [];
      newRuneStoneTransaction.type = "ETCHING";
      newRuneStoneTransaction.rune = newRunestone.id;
      newRuneStoneTransaction.transaction = transaction.txid as string;

      newRuneStoneTransaction.save();

      // UPDATE ALL STATISTICS
      updateRuneDayData(
        newRunestone,
        newRuneStoneTransaction,
        blockTime,
        blockNumber,
        ZERO_BD
      );
      return newRuneStoneTransaction;
    }
    //  return newRunestone;
  }
  return null;
}
export function handleEdicts(
  edicts: Edict[],
  runestone: RunestoneBuf,
  transaction: ProtoTransaction,
  blockTime: BigInt,
  blockNumber: BigInt
): RunestoneTransaction | null {
  if (edicts.length > 0) {
    let runeStoneTransaction = RunestoneTransaction.load(
      (transaction.txid as string).concat(":EDICT")
    );
    if (runeStoneTransaction === null) {
      runeStoneTransaction = new RunestoneTransaction(
        (transaction.txid as string).concat(":EDICT")
      );
    }
    let loadedRunestoneData: RunestoneData | null = null;
    let allEdicts: string[] = [];
    for (let index2 = 0; index2 < edicts.length; index2++) {
      const edict = edicts[index2];

      if (edict.id !== null && edict.output !== null) {
        loadedRunestoneData = RunestoneData.load(
          edict
            .id!.block.toString()
            .concat(":")
            .concat(edict.id!.tx.toString())
        );
        if (loadedRunestoneData !== null) {
          runeStoneTransaction.rune = loadedRunestoneData.id;
          // if (
          //   transaction.txid !== null &&
          //   loadedRunestoneData.transactions !== null
          // ) {
          //   loadedRunestoneData.transactions.push(transaction.txid as string);
          // }
          const newEdict = new EdictData(
            edict
              .id!.block.toString()
              .concat(":")
              .concat(edict.id!.tx.toString())
              .concat(":")
              .concat("EDICT")
              .concat(":")
              .concat(index2.toString())
          );

          if (edict.amount !== null) {
            newEdict.amount = edict.amount;
          }
          if (edict.output !== null) {
            newEdict.output = edict.output;
          }
          newEdict.rune = edict
            .id!.block.toString()
            .concat(":")
            .concat(edict.id!.tx.toString());
          newEdict.runeID = edict
            .id!.block.toString()
            .concat(":")
            .concat(edict.id!.tx.toString());
          newEdict.save();
          allEdicts.push(newEdict.id as string);
        }

        //   log.info("Processing Rune {} == {} ==  {} == {}", [
        //     edict.id!.block.toString(),
        //     edict.id!.tx.toString(),
        //     edict.amount,
        //     edict.output,
        //   ]);
      }
    }
    // if (
    //   transaction.txid !== null &&
    //   loadedRunestoneData.transactions !== null
    // ) {
    //   loadedRunestoneData.transactions.push(transaction.txid as string);
    // }
    if (
      loadedRunestoneData !== null &&
      transaction.txid !== null &&
      loadedRunestoneData.transactions !== null
    ) {
      loadedRunestoneData.transactions!.push(transaction.txid as string);
      loadedRunestoneData.totalTxCount = loadedRunestoneData.totalTxCount!.plus(
        ONE_BI
      );
      loadedRunestoneData.edictTxCount = loadedRunestoneData.totalTxCount!.plus(
        ONE_BI
      );
      loadedRunestoneData.save();
    }
    runeStoneTransaction.edicts = allEdicts;
    runeStoneTransaction.type = "EDICT";
    if (transaction.txid !== null) {
      runeStoneTransaction.transaction = transaction.txid as string;
    }

    runeStoneTransaction.save();

    // UPDATE ALL STATISTICS
    if (loadedRunestoneData !== null) {
      updateRuneDayData(
        loadedRunestoneData as RunestoneData,
        runeStoneTransaction,
        blockTime,
        blockNumber,
        ZERO_BD
      );
    }
    return runeStoneTransaction;
  }
  return null;
}
export function handleMint(
  mint: RuneId,
  runestone: RunestoneBuf,
  transaction: ProtoTransaction,
  blockTime: BigInt,
  blockNumber: BigInt
): RunestoneTransaction | null {
  if (mint.block !== null && mint.tx !== null && transaction !== null) {
    let runeStoneTransaction = RunestoneTransaction.load(
      (transaction.txid as string).concat(":MINT")
    );
    if (runeStoneTransaction === null) {
      runeStoneTransaction = new RunestoneTransaction(
        (transaction.txid as string).concat(":MINT")
      );
    }
    const loadedRunestoneData = RunestoneData.load(
      mint.block
        .toString()
        .concat(":")
        .concat(mint.tx.toString())
    );
    if (loadedRunestoneData !== null) {
      runeStoneTransaction.rune = loadedRunestoneData.id;
      if (
        transaction.txid !== null &&
        loadedRunestoneData.transactions !== null &&
        loadedRunestoneData.transactions!.length >= 0
      ) {
        loadedRunestoneData.transactions!.push(transaction.txid as string);
        if (loadedRunestoneData.totalTxCount === null) {
          loadedRunestoneData.totalTxCount = ZERO_BI;
        }
        loadedRunestoneData.totalTxCount = loadedRunestoneData.totalTxCount!.plus(
          ONE_BI
        );
        if (loadedRunestoneData.mintTxCount === null) {
          loadedRunestoneData.mintTxCount = ZERO_BI;
        }
        loadedRunestoneData.mintTxCount = loadedRunestoneData.mintTxCount!.plus(
          ONE_BI
        );
        loadedRunestoneData.save();
      }
      runeStoneTransaction.type = "MINT";
      if (transaction.txid !== null) {
        runeStoneTransaction.transaction = transaction.txid as string;
      }
      runeStoneTransaction.mint = mint.block
        .toString()
        .concat(":")
        .concat(mint.tx.toString());

      runeStoneTransaction.save();
      // UPDATE ALL STATISTICS
      if (loadedRunestoneData !== null) {
        updateRuneDayData(
          loadedRunestoneData as RunestoneData,
          runeStoneTransaction,
          blockTime,
          blockNumber,
          ZERO_BD
        );
      }
      return runeStoneTransaction;
    }
  }
  return null;
}
export function handlePointer(
  pointer: String,
  runestone: RunestoneBuf,
  transaction: ProtoTransaction,
  blockTime: BigInt,
  blockNumber: BigInt
): RunestoneTransaction | null {
  if (pointer !== null) {
    let runeStoneTransaction = RunestoneTransaction.load(
      (transaction.txid as string).concat(":POINTER")
    );
    if (runeStoneTransaction === null) {
      runeStoneTransaction = new RunestoneTransaction(
        (transaction.txid as string).concat(":POINTER")
      );
    }
    runeStoneTransaction.pointer = pointer.toString();
    if (transaction.txid !== null) {
      runeStoneTransaction.transaction = transaction.txid as string;
    }
    runeStoneTransaction.type = "POINTER";
    runeStoneTransaction.save();
    // UPDATE ALL STATISTICS
    return runeStoneTransaction;
  }
  return null;
}
