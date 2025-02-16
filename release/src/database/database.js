"use strict";

var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDb = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
let database = null;
/** Function that allows other functions to manage data in our Sqlite3 DataBase */
const getDb = async () => {
  if (!database) {
    database = await (0, sqlite_1.open)({
      filename: 'database.db',
      driver: sqlite3_1.default.Database
    });
  }
  return database;
};
exports.getDb = getDb;