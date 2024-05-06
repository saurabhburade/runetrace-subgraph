"use strict";
exports.__esModule = true;
exports.updateRuneDayData = void 0;
var schema_1 = require("../../generated/schema");
var graph_ts_1 = require("@graphprotocol/graph-ts");
var constants_1 = require("../constants");
function updateRuneDayData(runeData, runeTransaction, blockTime, blockNumber, txFee) {
    if (runeData !== null) {
        // UPDATE RUNE DAY DATA
        var timestamp = blockTime;
        var dayID = timestamp.div(graph_ts_1.BigInt.fromI32(86400));
        var pdayID = timestamp
            .minus(graph_ts_1.BigInt.fromI32(86400))
            .div(graph_ts_1.BigInt.fromI32(86400));
        var dayStartTimestamp = dayID.times(graph_ts_1.BigInt.fromI32(86400));
        var prevdayStartTimestamp = pdayID.times(graph_ts_1.BigInt.fromI32(86400));
        var runeDayID = runeData.id
            .toString()
            .concat("-")
            .concat(dayID.toString());
        var runePrevDayID = runeData.id
            .toString()
            .concat("-")
            .concat(pdayID.toString());
        var runeDayData = schema_1.RunestoneDayData.load(runeDayID);
        var runePrevDayData = schema_1.RunestoneDayData.load(runePrevDayID);
        if (runeDayData === null) {
            runeDayData = new schema_1.RunestoneDayData(runeDayID);
            runeDayData.date = dayStartTimestamp;
            runeDayData.prevDate = prevdayStartTimestamp;
            runeDayData.edictsTxCount = constants_1.ZERO_BI;
            runeDayData.txCount = constants_1.ZERO_BI;
            runeDayData.mintsTxCount = constants_1.ZERO_BI;
            runeDayData.pointerTxCount = constants_1.ZERO_BI;
            runeDayData.fees = constants_1.ZERO_BD;
            runeDayData.volume = constants_1.ZERO_BD;
        }
        if (runeTransaction.type === "MINT") {
            runeDayData.mintsTxCount = runeDayData.mintsTxCount.plus(constants_1.ONE_BI);
            if (runeDayData !== null &&
                runeDayData.volume !== null &&
                runeData.termAmount !== null) {
                runeDayData.volume = runeDayData.volume.plus(runeData.termAmount);
            }
        }
        if (runeTransaction.type === "POINTER") {
            runeDayData.pointerTxCount = runeDayData.pointerTxCount.plus(constants_1.ONE_BI);
        }
        if (runeTransaction.type === "EDICT") {
            if (runeTransaction.edicts !== null &&
                runeTransaction.edicts.length > 0) {
                for (var index = 0; index < runeTransaction.edicts.length; index++) {
                    var element = runeTransaction.edicts[index];
                    if (element !== null) {
                        var edictData = schema_1.Edict.load(element);
                        if (edictData !== null) {
                            if (runeDayData.volume !== null) {
                                runeDayData.volume = runeDayData.volume.plus(graph_ts_1.BigDecimal.fromString(edictData.amount));
                            }
                        }
                    }
                }
            }
            runeDayData.edictsTxCount = runeDayData.edictsTxCount.plus(constants_1.ONE_BI);
        }
        runeDayData.txCount = runeDayData.txCount.plus(constants_1.ONE_BI);
        runeDayData.lastBlock = blockNumber;
        runeDayData.rune = runeData.id;
        runeDayData.save();
        // ALL RUNE DAY DATA
        var allRuneDayData = schema_1.AllRuneDayData.load("all-rune-".concat(dayID.toString()));
        if (allRuneDayData === null) {
            allRuneDayData = new schema_1.AllRuneDayData("all-rune-".concat(dayID.toString()));
            allRuneDayData.date = dayStartTimestamp;
            allRuneDayData.prevDate = prevdayStartTimestamp;
            allRuneDayData.edictsTxCount = constants_1.ZERO_BI;
            allRuneDayData.etchingTxCount = constants_1.ZERO_BI;
            allRuneDayData.txCount = constants_1.ZERO_BI;
            allRuneDayData.mintsTxCount = constants_1.ZERO_BI;
            allRuneDayData.pointerTxCount = constants_1.ZERO_BI;
            allRuneDayData.fees = constants_1.ZERO_BD;
        }
        if (runeTransaction.type === "MINT") {
            allRuneDayData.mintsTxCount = allRuneDayData.mintsTxCount.plus(constants_1.ONE_BI);
        }
        if (runeTransaction.type === "ETCHING") {
            allRuneDayData.etchingTxCount = allRuneDayData.etchingTxCount.plus(constants_1.ONE_BI);
        }
        if (runeTransaction.type === "POINTER") {
            allRuneDayData.pointerTxCount = allRuneDayData.pointerTxCount.plus(constants_1.ONE_BI);
        }
        if (runeTransaction.type === "EDICT") {
            allRuneDayData.edictsTxCount = allRuneDayData.edictsTxCount.plus(constants_1.ONE_BI);
        }
        allRuneDayData.txCount = allRuneDayData.txCount.plus(constants_1.ONE_BI);
        allRuneDayData.lastBlock = blockNumber;
        allRuneDayData.save();
        // ALL RUNE  DATA
        var allRuneData = schema_1.AllRuneData.load("RUNES");
        if (allRuneData === null) {
            allRuneData = new schema_1.AllRuneData("RUNES");
            allRuneData.edictsTxCount = constants_1.ZERO_BI;
            allRuneData.txCount = constants_1.ZERO_BI;
            allRuneData.mintsTxCount = constants_1.ZERO_BI;
            allRuneData.etchingTxCount = constants_1.ZERO_BI;
            allRuneData.pointerTxCount = constants_1.ZERO_BI;
            allRuneData.fees = constants_1.ZERO_BD;
            // allRuneDayData.date = dayStartTimestamp;
            // allRuneDayData.prevDate = prevdayStartTimestamp;
            // allRuneDayData.edictsTxCount = ZERO_BI;
            // allRuneDayData.txCount = ZERO_BI;
            // allRuneDayData.mintsTxCount = ZERO_BI;
            // allRuneDayData.pointerTxCount = ZERO_BI;
            // allRuneDayData.fees = ZERO_BD;
        }
        if (runeTransaction.type === "ETCHING") {
            allRuneData.etchingTxCount = allRuneData.etchingTxCount.plus(constants_1.ONE_BI);
        }
        if (runeTransaction.type === "MINT") {
            allRuneData.mintsTxCount = allRuneData.mintsTxCount.plus(constants_1.ONE_BI);
        }
        if (runeTransaction.type === "POINTER") {
            allRuneData.pointerTxCount = allRuneData.pointerTxCount.plus(constants_1.ONE_BI);
        }
        if (runeTransaction.type === "EDICT") {
            allRuneData.edictsTxCount = allRuneData.edictsTxCount.plus(constants_1.ONE_BI);
        }
        allRuneData.txCount = allRuneData.txCount.plus(constants_1.ONE_BI);
        allRuneData.lastBlock = blockNumber;
        allRuneData.save();
    }
}
exports.updateRuneDayData = updateRuneDayData;
