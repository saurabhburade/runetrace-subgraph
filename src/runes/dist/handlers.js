"use strict";
exports.__esModule = true;
exports.handlePointer = exports.handleMint = exports.handleEdicts = exports.handleEtching = void 0;
var graph_ts_1 = require("@graphprotocol/graph-ts");
var schema_1 = require("../../generated/schema");
var constants_1 = require("../constants");
var updateDatas_1 = require("../entities/updateDatas");
function handleEtching(etching, runestone, transaction, blockTime, blockNumber) {
    graph_ts_1.log.info("Processing Rune id:: {} ==  {} == {}", [
        etching.id.block.toString(),
        etching.id.tx.toString(),
        etching.rune.toString(),
        etching.symbol.toString(),
    ]);
    if (etching.rune !== null && etching.rune === "MEMEECONOMICS") {
        graph_ts_1.log.info("Processing Rune MEMEECONOMICS {} == {}", [
            etching.rune.toString(),
            etching.symbol.toString(),
        ]);
        // return null;
    }
    if (etching.id !== null) {
        var newRunestone = new schema_1.Runestone(etching
            .id.block.toString()
            .concat(":")
            .concat(etching.id.tx.toString()));
        newRunestone.runeId =
            etching.id.block.toString().concat(":") + etching.id.tx.toString();
        newRunestone.name = etching.rune;
        newRunestone.symbol = etching.symbol;
        if (etching.spacers !== null) {
            newRunestone.spacers = graph_ts_1.BigDecimal.fromString(etching.spacers);
        }
        newRunestone.divisibility = constants_1.ZERO_BD;
        if (etching.divisibility >= 0) {
            newRunestone.divisibility = graph_ts_1.BigDecimal.fromString(graph_ts_1.BigInt.fromI32(etching.divisibility).toString());
        }
        if (etching.premine !== null && etching.premine !== "") {
            newRunestone.premine = graph_ts_1.BigDecimal.fromString(etching.premine);
        }
        if (etching.supply !== null && etching.supply !== "") {
            newRunestone.supply = graph_ts_1.BigDecimal.fromString(etching.supply);
        }
        if (etching.turbo) {
            newRunestone.turbo = etching.turbo;
        }
        if (etching.terms !== null) {
            if (etching.terms.cap !== null && etching.terms.cap !== "") {
                newRunestone.termCap = graph_ts_1.BigDecimal.fromString(etching.terms.cap);
            }
            if (etching.terms.amount !== null && etching.terms.amount !== "") {
                newRunestone.termAmount = graph_ts_1.BigDecimal.fromString(etching.terms.amount);
            }
        }
        if (transaction.txid !== null) {
            newRunestone.transactions = [];
            if (newRunestone.transactions.length === 0) {
                newRunestone.transactions.push(transaction.txid);
            }
            newRunestone.etchTx = transaction.txid;
        }
        if (transaction.inputUtxos !== null && transaction.inputUtxos.length > 0) {
            var inputUtxo = transaction.inputUtxos[0];
            var utxoData = schema_1.Utxo.load(inputUtxo);
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
        newRunestone.totalTxCount = constants_1.ONE_BI;
        newRunestone.edictTxCount = constants_1.ZERO_BI;
        newRunestone.mintTxCount = constants_1.ZERO_BI;
        newRunestone.pointerTxCount = constants_1.ZERO_BI;
        newRunestone.save();
        if (transaction.txid !== null) {
            var newRuneStoneTransaction = new schema_1.RunestoneTransaction(transaction.txid.concat(":ETCHING"));
            newRuneStoneTransaction.edicts = [];
            newRuneStoneTransaction.type = "ETCHING";
            newRuneStoneTransaction.rune = newRunestone.id;
            newRuneStoneTransaction.transaction = transaction.txid;
            newRuneStoneTransaction.save();
            // UPDATE ALL STATISTICS
            updateDatas_1.updateRuneDayData(newRunestone, newRuneStoneTransaction, blockTime, blockNumber, constants_1.ZERO_BD);
            return newRuneStoneTransaction;
        }
        //  return newRunestone;
    }
    return null;
}
exports.handleEtching = handleEtching;
function handleEdicts(edicts, runestone, transaction, blockTime, blockNumber) {
    if (edicts.length > 0) {
        var runeStoneTransaction = schema_1.RunestoneTransaction.load(transaction.txid.concat(":EDICT"));
        if (runeStoneTransaction === null) {
            runeStoneTransaction = new schema_1.RunestoneTransaction(transaction.txid.concat(":EDICT"));
        }
        var loadedRunestoneData = null;
        var allEdicts = [];
        for (var index2 = 0; index2 < edicts.length; index2++) {
            var edict = edicts[index2];
            if (edict.id !== null && edict.output !== null) {
                loadedRunestoneData = schema_1.Runestone.load(edict
                    .id.block.toString()
                    .concat(":")
                    .concat(edict.id.tx.toString()));
                if (loadedRunestoneData !== null) {
                    runeStoneTransaction.rune = loadedRunestoneData.id;
                    // if (
                    //   transaction.txid !== null &&
                    //   loadedRunestoneData.transactions !== null
                    // ) {
                    //   loadedRunestoneData.transactions.push(transaction.txid as string);
                    // }
                    var newEdict = new schema_1.Edict(edict
                        .id.block.toString()
                        .concat(":")
                        .concat(edict.id.tx.toString())
                        .concat(":")
                        .concat("EDICT")
                        .concat(":")
                        .concat(index2.toString()));
                    if (edict.amount !== null) {
                        newEdict.amount = edict.amount;
                    }
                    if (edict.output !== null) {
                        newEdict.output = edict.output;
                    }
                    newEdict.rune = edict
                        .id.block.toString()
                        .concat(":")
                        .concat(edict.id.tx.toString());
                    newEdict.runeID = edict
                        .id.block.toString()
                        .concat(":")
                        .concat(edict.id.tx.toString());
                    newEdict.save();
                    allEdicts.push(newEdict.id);
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
        if (loadedRunestoneData !== null &&
            transaction.txid !== null &&
            loadedRunestoneData.transactions !== null) {
            loadedRunestoneData.transactions.push(transaction.txid);
            loadedRunestoneData.totalTxCount = loadedRunestoneData.totalTxCount.plus(constants_1.ONE_BI);
            loadedRunestoneData.edictTxCount = loadedRunestoneData.totalTxCount.plus(constants_1.ONE_BI);
            loadedRunestoneData.save();
        }
        runeStoneTransaction.edicts = allEdicts;
        runeStoneTransaction.type = "EDICT";
        if (transaction.txid !== null) {
            runeStoneTransaction.transaction = transaction.txid;
        }
        runeStoneTransaction.save();
        // UPDATE ALL STATISTICS
        if (loadedRunestoneData !== null) {
            updateDatas_1.updateRuneDayData(loadedRunestoneData, runeStoneTransaction, blockTime, blockNumber, constants_1.ZERO_BD);
        }
        return runeStoneTransaction;
    }
    return null;
}
exports.handleEdicts = handleEdicts;
function handleMint(mint, runestone, transaction, blockTime, blockNumber) {
    if (mint.block !== null && mint.tx !== null && transaction !== null) {
        var runeStoneTransaction = schema_1.RunestoneTransaction.load(transaction.txid.concat(":MINT"));
        if (runeStoneTransaction === null) {
            runeStoneTransaction = new schema_1.RunestoneTransaction(transaction.txid.concat(":MINT"));
        }
        var loadedRunestoneData = schema_1.Runestone.load(mint.block
            .toString()
            .concat(":")
            .concat(mint.tx.toString()));
        if (loadedRunestoneData !== null) {
            runeStoneTransaction.rune = loadedRunestoneData.id;
            if (transaction.txid !== null &&
                loadedRunestoneData.transactions !== null &&
                loadedRunestoneData.transactions.length >= 0) {
                loadedRunestoneData.transactions.push(transaction.txid);
                if (loadedRunestoneData.totalTxCount === null) {
                    loadedRunestoneData.totalTxCount = constants_1.ZERO_BI;
                }
                loadedRunestoneData.totalTxCount = loadedRunestoneData.totalTxCount.plus(constants_1.ONE_BI);
                if (loadedRunestoneData.mintTxCount === null) {
                    loadedRunestoneData.mintTxCount = constants_1.ZERO_BI;
                }
                loadedRunestoneData.mintTxCount = loadedRunestoneData.mintTxCount.plus(constants_1.ONE_BI);
                loadedRunestoneData.save();
            }
            runeStoneTransaction.type = "MINT";
            if (transaction.txid !== null) {
                runeStoneTransaction.transaction = transaction.txid;
            }
            runeStoneTransaction.mint = mint.block
                .toString()
                .concat(":")
                .concat(mint.tx.toString());
            runeStoneTransaction.save();
            // UPDATE ALL STATISTICS
            if (loadedRunestoneData !== null) {
                updateDatas_1.updateRuneDayData(loadedRunestoneData, runeStoneTransaction, blockTime, blockNumber, constants_1.ZERO_BD);
            }
            return runeStoneTransaction;
        }
    }
    return null;
}
exports.handleMint = handleMint;
function handlePointer(pointer, runestone, transaction, blockTime, blockNumber) {
    if (pointer !== null) {
        var runeStoneTransaction = schema_1.RunestoneTransaction.load(transaction.txid.concat(":POINTER"));
        if (runeStoneTransaction === null) {
            runeStoneTransaction = new schema_1.RunestoneTransaction(transaction.txid.concat(":POINTER"));
        }
        runeStoneTransaction.pointer = pointer.toString();
        if (transaction.txid !== null) {
            runeStoneTransaction.transaction = transaction.txid;
        }
        runeStoneTransaction.type = "POINTER";
        runeStoneTransaction.save();
        // UPDATE ALL STATISTICS
        return runeStoneTransaction;
    }
    return null;
}
exports.handlePointer = handlePointer;
