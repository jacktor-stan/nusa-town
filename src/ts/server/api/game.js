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
exports.createJoinGame = void 0;
var url_1 = require("url");
var errors_1 = require("../../common/errors");
var userError_1 = require("../userError");
var accountUtils_1 = require("../../common/accountUtils");
var adminUtils_1 = require("../../common/adminUtils");
var serverUtils_1 = require("../serverUtils");
var accountUtils_2 = require("../accountUtils");
var createJoinGame = function (findServer, _a, findCharacter, join, addOrigin, hasInvites) {
    var version = _a.version, host = _a.host, debug = _a.debug, local = _a.local;
    var waiting = new Map();
    return function (account, characterId, serverId, clientVersion, url, hasAlert, origin) { return __awaiter(void 0, void 0, void 0, function () {
        var accountId, _a, server, supporterInvited, req, time, alert_1, character, token;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    accountId = account._id.toString();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, , 6, 7]);
                    return [4 /*yield*/, Promise.all([
                            findServer(serverId),
                            hasInvites(account._id),
                        ])];
                case 2:
                    _a = _b.sent(), server = _a[0], supporterInvited = _a[1];
                    if (clientVersion !== version)
                        throw new userError_1.UserError(errors_1.VERSION_ERROR);
                    if (url_1.parse(url).host !== url_1.parse(host).host && !debug && !local)
                        throw new userError_1.UserError('Invalid data', { message: 'Invalid host', desc: url });
                    if (!server)
                        throw new userError_1.UserError('Invalid data');
                    if (serverUtils_1.isServerOffline(server))
                        throw new userError_1.UserError('Server is offline');
                    if (server.state.settings.blockJoining)
                        throw new userError_1.UserError('Cannot join to the server');
                    if (!accountUtils_1.meetsRequirement({ roles: account.roles, supporter: adminUtils_1.supporterLevel(account), supporterInvited: supporterInvited }, server.state.require))
                        throw new userError_1.UserError('Server is restricted');
                    if (!characterId || typeof characterId !== 'string')
                        throw new userError_1.UserError('Invalid data', { message: 'Invalid pony ID', desc: "\"" + characterId + "\"" });
                    req = waiting.get(accountId);
                    time = new Date();
                    if (req) {
                        throw new userError_1.UserError('Already waiting for join request');
                    }
                    alert_1 = accountUtils_2.getAccountAlertMessage(account);
                    if (alert_1 && !hasAlert) {
                        return [2 /*return*/, { alert: alert_1 }];
                    }
                    waiting.set(accountId, { characterId: characterId, time: time });
                    return [4 /*yield*/, findCharacter(characterId, account._id)];
                case 3:
                    character = _b.sent();
                    if (!character) {
                        throw new userError_1.UserError('Character does not exist', {
                            desc: "(join) (account: " + accountId + " pony: " + characterId + ")"
                        });
                    }
                    return [4 /*yield*/, addOrigin(account, origin)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, join(server, account, character)];
                case 5:
                    token = _b.sent();
                    return [2 /*return*/, { token: token }];
                case 6:
                    waiting.delete(accountId);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    }); };
};
exports.createJoinGame = createJoinGame;
//# sourceMappingURL=game.js.map