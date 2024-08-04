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
var lodash_1 = require("lodash");
var db_1 = require("../db");
var requestUtils_1 = require("../requestUtils");
var account_1 = require("../api/account");
var utils_1 = require("../../common/utils");
var blockApps = [];
var MAX_CONCURRENT_REQUESTS = 100;
var requests = 0;
function default_1(server, settings) {
    var app = express_1.Router();
    var getAccountData = account_1.createGetAccountData(db_1.findAllCharacters, db_1.findAllVisibleAuths);
    function handleAccountRequest(account, userAgent, browserId) {
        return __awaiter(this, void 0, void 0, function () {
            var lastUserAgent, lastBrowserId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(requests < MAX_CONCURRENT_REQUESTS)) return [3 /*break*/, 5];
                        requests++;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        lastUserAgent = userAgent || account.lastUserAgent;
                        lastBrowserId = browserId || account.lastBrowserId;
                        if ((lastUserAgent && account.lastUserAgent !== lastUserAgent) ||
                            (lastBrowserId && account.lastBrowserId !== lastBrowserId)) {
                            account.lastUserAgent = lastUserAgent;
                            account.lastBrowserId = lastBrowserId;
                            db_1.Account.updateOne({ _id: account._id }, { lastUserAgent: lastUserAgent, lastBrowserId: lastBrowserId }, lodash_1.noop);
                        }
                        return [4 /*yield*/, getAccountData(account)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        requests--;
                        return [7 /*endfinally*/];
                    case 4: return [3 /*break*/, 6];
                    case 5: return [2 /*return*/, { limit: true }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    app.post('/account', requestUtils_1.offline(settings), requestUtils_1.hash, function (req, res) {
        req.session.touch();
        var account = req.user;
        var browserId = req.get('Api-Bid');
        var userAgent = req.get('User-Agent') || '';
        var requestedWith = req.get('X-Requested-With');
        var isWebViewUserAgent = /Chrome\/\d+\.0\.0\.0 Mobile|; wv\)/.test(userAgent);
        var isWebView = requestedWith || isWebViewUserAgent;
        if (!account || (settings.blockWebView && isWebView && utils_1.includes(blockApps, requestedWith))) {
            requestUtils_1.handleJSON(server, req, res, null);
        }
        else {
            requestUtils_1.handleJSON(server, req, res, handleAccountRequest(account, userAgent, browserId));
        }
    });
    return app;
}
exports.default = default_1;
//# sourceMappingURL=api1.js.map