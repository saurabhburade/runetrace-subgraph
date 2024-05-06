"use strict";
exports.__esModule = true;
exports.BI_18 = exports.ONE_BD = exports.ZERO_BD = exports.ONE_BI = exports.ZERO_BI = void 0;
var graph_ts_1 = require("@graphprotocol/graph-ts");
exports.ZERO_BI = graph_ts_1.BigInt.fromI32(0);
exports.ONE_BI = graph_ts_1.BigInt.fromI32(1);
exports.ZERO_BD = graph_ts_1.BigDecimal.fromString("0");
exports.ONE_BD = graph_ts_1.BigDecimal.fromString("1");
exports.BI_18 = graph_ts_1.BigInt.fromI32(18);
// export const RUNE_TRANSACTION_TYPES = {
//   MINT: "MINT",
//   BURN: "BURN",
//   EDICT: "EDICT",
//   TRANSFER: "TRANSFER",
//   CENOTAPH: "CENOTAPH",
//   POINTER: "POINTER",
//   ETCHING: "ETCHING",
// };
