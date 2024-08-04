"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var requestUtils_1 = require("../requestUtils");
var game_1 = require("../api/game");
var internal_1 = require("../internal");
var db_1 = require("../db");
var internal_2 = require("../internal");
var originUtils_1 = require("../originUtils");
function default_1(server, settings, config) {
    var _this = this;
    var offline = requestUtils_1.offline(settings);
    var validAccount = requestUtils_1.validAccount(server);
    var join = internal_2.createJoin();
    var app = express_1.Router();
    var inQueue = 0;
    var joinGame = game_1.createJoinGame(internal_1.findServer, config, db_1.findCharacter, join, originUtils_1.addOrigin, db_1.hasActiveSupporterInvites);
    app.post('/game/join', offline, requestUtils_1.limit(60, 5 * 60), requestUtils_1.hash, validAccount, requestUtils_1.wrap(server, function (req) { return __awaiter(_this, void 0, void 0, function () {
        var _a, ponyId, serverId, version, url, alert_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(inQueue > 100)) return [3 /*break*/, 1];
                    return [2 /*return*/, {}];
                case 1:
                    _b.trys.push([1, , 3, 4]);
                    inQueue++;
                    _a = req.body, ponyId = _a.ponyId, serverId = _a.serverId, version = _a.version, url = _a.url, alert_1 = _a.alert;
                    return [4 /*yield*/, joinGame(req.user, ponyId, serverId, version, url, alert_1, originUtils_1.getOrigin(req))];
                case 2: return [2 /*return*/, _b.sent()];
                case 3:
                    inQueue--;
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); }));
    return app;
}
exports.default = default_1;
//# sourceMappingURL=api-game.js.map