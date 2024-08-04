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
exports.addOrigin = exports.getOrigin = exports.getOriginFromHTTP = exports.getIP = void 0;
var db_1 = require("./db");
var config_1 = require("./config");
var logger_1 = require("./logger");
var constants_1 = require("../common/constants");
var get_ip = require('ipware')().get_ip;
var request = require('request');
var geoIpService = constants_1.GEOIP_SERVICE_API;
function getIP(req) {
    return req.headers['cf-connecting-ip'] || (get_ip(req) ? get_ip(req).clientIp : null);
}
exports.getIP = getIP;
function getOriginFromHTTP(req) {
    var ip = getIP(req) || '0.0.0.0';
    var ipcountry = (ip === '127.0.0.1' || ip === '::ffff:127.0.0.1' || ip === '::1') ? 'LOCAL' : '';
    var country = ipcountry || req.headers['cf-ipcountry'] || '??';
    return { ip: ip, country: country, last: new Date() };
}
exports.getOriginFromHTTP = getOriginFromHTTP;
function getOrigin(req) {
    var origin = getOriginFromHTTP(req);
    if (origin.country === '??' && config_1.config.proxy) {
        logger_1.logger.warn('Invalid IP', JSON.stringify(req.ips));
        //create(null, null, null).danger('Invalid IP', JSON.stringify(req.ips));
    }
    return origin;
}
exports.getOrigin = getOrigin;
function addOrigin(account, origin) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            //Mendapatkan IP eksternal dari layanan pihek ke-3
            request('http://ipinfo.io', function (_error, response, body) {
                return __awaiter(this, void 0, void 0, function () {
                    var localIP, parse, _ip, _country, _last, obj_1, _id, existingOrigin, e_1, _id, existingOrigin, e_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                localIP = Object.values(origin)[1];
                                if (!(localIP == 'LOCAL')) return [3 /*break*/, 1];
                                return [3 /*break*/, 9];
                            case 1:
                                if (!(geoIpService == 1 && response.statusCode == 200)) return [3 /*break*/, 9];
                                parse = JSON.parse('[' + body + ']');
                                _ip = parse[0]['ip'];
                                _country = parse[0]['country'];
                                _last = Object.values(origin)[2];
                                obj_1 = { ip: _ip, country: _country, last: _last };
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 7, , 8]);
                                _id = account._id;
                                existingOrigin = account.origins && account.origins
                                    .find(function (o) { return o.ip === obj_1.ip; });
                                if (!existingOrigin) return [3 /*break*/, 4];
                                return [4 /*yield*/, db_1.Account.updateOne({ _id: _id, 'origins._id': existingOrigin._id }, { $set: { 'origins.$.last': new Date() } }).exec()];
                            case 3:
                                _a.sent();
                                return [3 /*break*/, 6];
                            case 4: return [4 /*yield*/, db_1.Account.updateOne({ _id: _id }, { $push: { origins: obj_1 } }).exec()];
                            case 5:
                                _a.sent();
                                _a.label = 6;
                            case 6: return [3 /*break*/, 8];
                            case 7:
                                e_1 = _a.sent();
                                logger_1.logger.error('Failed to add origin', e_1);
                                return [3 /*break*/, 8];
                            case 8: return [3 /*break*/, 9];
                            case 9:
                                if (!(geoIpService == 0 || localIP == 'LOCAL')) return [3 /*break*/, 16];
                                _a.label = 10;
                            case 10:
                                _a.trys.push([10, 15, , 16]);
                                _id = account._id;
                                existingOrigin = account.origins && account.origins
                                    .find(function (o) { return o.ip === origin.ip; });
                                if (!existingOrigin) return [3 /*break*/, 12];
                                return [4 /*yield*/, db_1.Account.updateOne({ _id: _id, 'origins._id': existingOrigin._id }, { $set: { 'origins.$.last': new Date() } }).exec()];
                            case 11:
                                _a.sent();
                                return [3 /*break*/, 14];
                            case 12: return [4 /*yield*/, db_1.Account.updateOne({ _id: _id }, { $push: { origins: origin } }).exec()];
                            case 13:
                                _a.sent();
                                _a.label = 14;
                            case 14: return [3 /*break*/, 16];
                            case 15:
                                e_2 = _a.sent();
                                logger_1.logger.error('Failed to add origin', e_2);
                                return [3 /*break*/, 16];
                            case 16: return [2 /*return*/];
                        }
                    });
                });
            });
            return [2 /*return*/];
        });
    });
}
exports.addOrigin = addOrigin;
//# sourceMappingURL=originUtils.js.map