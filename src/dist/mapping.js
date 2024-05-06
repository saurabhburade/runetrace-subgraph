"use strict";
exports.__esModule = true;
exports.handleBlock = exports.handleRunes = void 0;
var graph_ts_1 = require("@graphprotocol/graph-ts");
var Block_1 = require("./pb/ordinals/v1/Block");
var schema_1 = require("../generated/schema");
var assembly_1 = require("as-proto/assembly");
var ordinals_1 = require("./ordinals");
var handlers_1 = require("./runes/handlers");
function handleRunes(runeBytes) {
    // const runes = Protobuf.decode<RunestoneBufs>(runeBytes, RunestoneBufs.decode);
    // log.info("Processing runes {}", [runes.runestoneBufs.length.toString(2)]);
    // if (runes.runestoneBufs.length > 0) {
    //   for (let index = 0; index < runes.runestoneBufs.length; index++) {
    //     const rune = runes.runestoneBufs[index];
    //     if (rune && rune.etching !== null) {
    //       handleEtching(rune.etching! as Etching, rune);
    //       // const etching: Etching = rune.etching! as Etching;
    //       // // const etching = Protobuf.decode<Etching>(
    //       // //   new Uint8Array(rune.etching), // Convert Etching to ArrayBuffer
    //       // //   Etching.decode
    //       // // );
    //       // log.info("Processing Rune {} == {}", [etching.rune, etching.symbol]);
    //     }
    //     if (rune && rune.edicts) {
    //       const edicts: Edict[] = rune.edicts as Edict[];
    //       if (edicts.length > 0) {
    //         handleEdicts(edicts, rune);
    //       }
    //     }
    //     if (rune && rune.mint) {
    //       const mint: RuneId = rune.mint as RuneId;
    //       if (mint.block !== null && mint.tx !== null) {
    //         handleMint(mint, rune);
    //       }
    //     }
    //     if (rune && rune.pointer) {
    //       const pointer = rune.pointer;
    //       if (pointer !== null) {
    //         handlePointer(pointer, rune);
    //       }
    //     }
    //   }
    //   //   // const etching = Protobuf.decode<Etching>(
    //   //   //   new Uint8Array(rune.etching), // Convert Etching to ArrayBuffer
    //   //   //   Etching.decode
    //   //   // );
    // }
}
exports.handleRunes = handleRunes;
function handleBlock(blockBytes) {
    var block = assembly_1.Protobuf.decode(blockBytes, Block_1.Block.decode);
    // log.info("Processing block {}", [block.number.toString()]);
    // Create block
    var block_ = new schema_1.Block(block.number.toString());
    block_.height = graph_ts_1.BigInt.fromI64(block.number);
    block_.timestamp = graph_ts_1.BigInt.fromI64(block.timestamp);
    block_.reward = graph_ts_1.BigInt.fromI64(block.minerReward);
    block_.subsidy = graph_ts_1.BigInt.fromI64(block.subsidy);
    block_.fees = graph_ts_1.BigInt.fromI64(block.fees);
    block_.save();
    var fees_ordinals = new ordinals_1.OrdinalSet([]);
    for (var i = 1; i < block.txs.length; ++i) {
        fees_ordinals.append_set(handleRegularTransaction(block_, block.txs[i]));
        // handleRegularTransaction(block_, block.txs[i]);
    }
    // for (let i = 1; i < block.runestones.length; ++i) {
    //   let runestone = block.runestones[i];
    //   if (runestone !== null) {
    //     if (runestone.etching !== null) {
    //       handleEtching(runestone.etching!, runestone);
    //     }
    //     if (runestone.mint !== null) {
    //       handleMint(runestone.mint!, runestone);
    //     }
    //     if (runestone.edicts !== null) {
    //       const edicts: Edict[] = runestone.edicts as Edict[];
    //       if (edicts.length > 0) {
    //         handleEdicts(edicts, runestone);
    //       }
    //     }
    //   }
    // }
    handleCoinbaseTransaction(block_, block.txs[0], fees_ordinals);
}
exports.handleBlock = handleBlock;
function loadUTXOs(ids) {
    var utxos = [];
    for (var i = 0; i < ids.length; ++i) {
        var utxo = schema_1.Utxo.load(ids[i]);
        if (utxo == null) {
            graph_ts_1.log.critical("Error: UTXO {} does not exist!", [ids[i]]);
            return [];
        }
        utxos.push(utxo);
    }
    return utxos;
}
function loadInscriptions(utxos) {
    var inscriptions = [];
    for (var i = 0; i < utxos.length; ++i) {
        inscriptions = inscriptions.concat(utxos[i].inscriptions.load());
    }
    return inscriptions;
}
function getNthSatUtxo(utxos, n) {
    var total = 0;
    var idx = 0;
    while (total < n) {
        total += utxos[idx].amount.toU64();
        idx += 1;
    }
    return utxos[idx - 1];
}
function handleRegularTransaction(block, transaction) {
    graph_ts_1.log.debug("Processing regular transaction {}", [transaction.txid]);
    // Load input UTXOs and ordinals
    // log.debug("Loading input UTXOs", [])
    var input_utxos = loadUTXOs(transaction.inputUtxos);
    var input_ordinals = new ordinals_1.OrdinalSet([]);
    for (var i = 0; i < input_utxos.length; ++i) {
        var blocks = ordinals_1.OrdinalSet.deserialize(input_utxos[i].ordinalsSlug);
        input_ordinals.append_set(blocks);
        // Mark UTXO as spent
        input_utxos[i].unspent = false;
        input_utxos[i].spentIn = transaction.txid;
        input_utxos[i].save();
    }
    // Handle inscriptions
    // log.debug("Loading inscriptions", [])
    var inscriptions = loadInscriptions(input_utxos);
    for (var insc = 0; insc < transaction.inscriptions.length; ++insc) {
        var inscription = new schema_1.Inscription(transaction.inscriptions[insc].id);
        inscription.content_type = transaction.inscriptions[insc].contentType;
        inscription.offset = graph_ts_1.BigInt.fromI64(transaction.inscriptions[insc].pointer);
        inscription.parent = transaction.inscriptions[insc].parent;
        inscription.metadata = transaction.inscriptions[insc].metadata;
        inscription.metaprotocol = transaction.inscriptions[insc].metaprotocol;
        inscription.contentEncoding =
            transaction.inscriptions[insc].contentEncoding;
        inscription.content = transaction.inscriptions[insc].content;
        inscription.genesisTransaction = transaction.txid;
        inscription.genesisAddress = transaction.relativeOrdinals[0].address;
        inscription.ordinal = graph_ts_1.BigInt.fromU64(input_ordinals.getNthOrdinal(transaction.inscriptions[insc].pointer));
        inscription.genesisUtxo = getNthSatUtxo(input_utxos, transaction.inscriptions[insc].pointer).id;
        inscriptions.push(inscription);
    }
    // Assign ordinals to output UTXOs
    // log.debug("Assigning ordinals to output UTXOs", [])
    for (var i = 0; i < transaction.relativeOrdinals.length; ++i) {
        var utxo = new schema_1.Utxo(transaction.relativeOrdinals[i].utxo);
        utxo.address = transaction.relativeOrdinals[i].address;
        utxo.amount = graph_ts_1.BigInt.fromU64(transaction.relativeOrdinals[i].size);
        utxo.unspent = true;
        utxo.transaction = transaction.txid;
        var utxo_ordinals = input_ordinals.popNOrdinals(transaction.relativeOrdinals[i].size);
        // Assign inscriptions to UTXO
        for (var j = 0; j < inscriptions.length; ++j) {
            if (utxo_ordinals.contains(inscriptions[j].ordinal.toU64())) {
                inscriptions[j].location = utxo.id;
                inscriptions[j].locationOffset = graph_ts_1.BigInt.fromU64(utxo_ordinals.offsetOf(inscriptions[j].ordinal.toU64()));
                inscriptions[j].save();
            }
        }
        utxo.ordinalsSlug = graph_ts_1.Bytes.fromUint8Array(utxo_ordinals.serialize());
        utxo.save();
    }
    // Create transaction
    var transaction_ = new schema_1.Transaction(transaction.txid);
    transaction_.idx = graph_ts_1.BigInt.fromI64(transaction.idx);
    transaction_.amount = graph_ts_1.BigInt.fromI64(transaction.amount);
    transaction_.fee = graph_ts_1.BigInt.zero();
    transaction_.block = block.id;
    var runestone = transaction.rune;
    if (runestone !== null) {
        if (runestone.etching !== null) {
            var runeStoneTransaction = handlers_1.handleEtching(runestone.etching, runestone, transaction, block.timestamp, block.height);
            if (runeStoneTransaction !== null) {
                transaction_.rune = runeStoneTransaction.rune;
            }
        }
        if (runestone.mint !== null) {
            var runeStoneTransaction = handlers_1.handleMint(runestone.mint, runestone, transaction, block.timestamp, block.height);
            if (runeStoneTransaction !== null) {
                transaction_.rune = runeStoneTransaction.rune;
            }
        }
        if (runestone.edicts !== null) {
            var edicts = runestone.edicts;
            if (edicts.length > 0) {
                var runeStoneTransaction = handlers_1.handleEdicts(edicts, runestone, transaction, block.timestamp, block.height);
                if (runeStoneTransaction !== null) {
                    transaction_.rune = runeStoneTransaction.rune;
                }
            }
        }
    }
    transaction_.save();
    return input_ordinals;
}
function handleCoinbaseTransaction(block, transaction, fees_ordinals) {
    graph_ts_1.log.debug("Processing coinbase transaction {}", [transaction.txid]);
    var coinbase_ordinals = new ordinals_1.OrdinalSet([]);
    for (var i = 0; i < transaction.coinbaseOrdinals.length; ++i) {
        coinbase_ordinals.append_block(new ordinals_1.OrdinalBlock(transaction.coinbaseOrdinals[i].start, transaction.coinbaseOrdinals[i].size));
    }
    coinbase_ordinals.append_set(fees_ordinals);
    // log.debug("Assigning ordinals to output UTXOs", [])
    for (var i = 0; i < transaction.coinbaseOrdinals.length; ++i) {
        var utxo = new schema_1.Utxo(transaction.coinbaseOrdinals[i].utxo);
        utxo.amount = graph_ts_1.BigInt.fromU64(transaction.coinbaseOrdinals[i].size);
        utxo.unspent = true;
        utxo.transaction = transaction.txid;
        var utxo_ordinals = coinbase_ordinals.popNOrdinals(transaction.coinbaseOrdinals[i].size);
        utxo.ordinalsSlug = graph_ts_1.Bytes.fromUint8Array(utxo_ordinals.serialize());
        utxo.save();
    }
    var transaction_ = new schema_1.Transaction(transaction.txid);
    transaction_.idx = graph_ts_1.BigInt.fromI64(transaction.idx);
    transaction_.amount = graph_ts_1.BigInt.fromI64(transaction.amount);
    transaction_.fee = graph_ts_1.BigInt.zero();
    transaction_.block = block.id;
    transaction_.save();
}
