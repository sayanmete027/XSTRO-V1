"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = this && this.__importStar || function () {
  var ownKeys = function (o) {
    ownKeys = Object.getOwnPropertyNames || function (o) {
      var ar = [];
      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
      return ar;
    };
    return ownKeys(o);
  };
  return function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
    __setModuleDefault(result, mod);
    return result;
  };
}();
var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
const http = __importStar(require("http"));
const cluster_1 = __importDefault(require("cluster"));
const config_1 = __importDefault(require("./config"));
const index_1 = require("./src/index");
if (cluster_1.default.isPrimary) {
  let isRestarting = false;
  const createWorker = () => {
    const worker = cluster_1.default.fork();
    worker.on('message', message => {
      if (message === 'app.kill') {
        console.log('Shutting down Xstro...');
        worker.kill();
        process.exit(0);
      } else if (message === 'restart') {
        console.log('Restarting...');
        isRestarting = true;
        worker.kill();
      }
    });
    worker.on('exit', () => {
      if (!isRestarting) console.log('Restarting...');
      isRestarting = false;
      createWorker();
    });
  };
  createWorker();
  ['SIGINT', 'SIGTERM'].forEach(sig => {
    process.on(sig, () => {
      for (const id in cluster_1.default.workers) {
        cluster_1.default.workers[id]?.kill();
      }
      process.exit(0);
    });
  });
} else {
  const startServer = async () => {
    console.log('Starting...');
    (0, index_1.eventlogger)();
    await (0, index_1.initSession)();
    await (0, index_1.SessionMigrator)(`session/${config_1.default.SESSION_ID}`, 'database.db');
    await (0, index_1.loadPlugins)();
    await (0, index_1.client)();
    http.createServer((req, res) => {
      res.end(JSON.stringify({
        alive: req.url === '/'
      }));
    }).listen(process.env.PORT || 8000);
  };
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
  process.on('unhandledRejection', (reason, promise) => {
    console.error('RUNTIME ERROR:', promise, 'CAUSED BY:', reason);
  });
  process.on('exit', () => {
    if (process.send) {
      process.send('restart');
    }
  });
}