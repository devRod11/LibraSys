"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const PORT = process.env.PORT || 3001;
const server = http_1.default.createServer(app_1.default);
(0, socket_1.initSocket)(server);
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
