import { log } from "@graphprotocol/graph-ts";
import { Edict } from "../pb/ordinals/v1/Edict";
import { Etching } from "../pb/ordinals/v1/Etching";
import { RunestoneBuf } from "../pb/ordinals/v1/RunestoneBuf";
import { RuneId } from "../pb/ordinals/v1/RuneId";

export function handleEtching(etching: Etching, runestone: RunestoneBuf): void {
  if (etching.id !== null) {
    log.info("Processing Rune id:: {} ==  {} == {}", [
      etching.id!.block.toString(),
      etching.id!.tx.toString(),
      etching.rune,
      etching.symbol,
    ]);
  }
}
export function handleEdicts(edicts: Edict[], runestone: RunestoneBuf): void {
  for (let index2 = 0; index2 < edicts.length; index2++) {
    const edict = edicts[index2];

    if (edict.id !== null && edict.output !== null) {
      //   log.info("Processing Rune {} == {} ==  {} == {}", [
      //     edict.id!.block.toString(),
      //     edict.id!.tx.toString(),
      //     edict.amount,
      //     edict.output,
      //   ]);
    }
  }
}
export function handleMint(mint: RuneId, runestone: RunestoneBuf): void {}
export function handlePointer(pointer: String, runestone: RunestoneBuf): void {}
