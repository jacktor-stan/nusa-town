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
exports.createSpamChecker = exports.RAPID_MESSAGE_TIMEOUT = exports.RAPID_MESSAGE_COUNT = exports.LONG_MESSAGE_MUL = exports.SHORT_MESSAGE_MUL = exports.TINY_MESSAGE_MUL = exports.MUTE_AFTER_LIMIT = exports.REPORT_AFTER_LIMIT = exports.MULTIPLE_MATCH_COUNT = void 0;
var utils_1 = require("../common/utils");
var reporting_1 = require("./reporting");
var playerUtils_1 = require("./playerUtils");
var serverUtils_1 = require("./serverUtils");
var constants_1 = require("../common/constants");
var TINY_MESSAGE_LENGTH = 3;
var SHORT_MESSAGE_LENGTH = 8;
var LONG_MESSAGE_LENGTH = 50;
exports.MULTIPLE_MATCH_COUNT = 5;
exports.REPORT_AFTER_LIMIT = 5;
exports.MUTE_AFTER_LIMIT = 7;
exports.TINY_MESSAGE_MUL = 1.5; // was 4
exports.SHORT_MESSAGE_MUL = 1.5; // was 2
exports.LONG_MESSAGE_MUL = 0.75;
exports.RAPID_MESSAGE_COUNT = 35;
exports.RAPID_MESSAGE_TIMEOUT = 30 * constants_1.SECOND;
var createSpamChecker = function (spamCounter, rapidCounter, countSpamming, timeoutAccount, handlePromise) {
    if (handlePromise === void 0) { handlePromise = serverUtils_1.handlePromiseDefault; }
    function countAndTimeout(client, timeout, message, items, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var timeoutTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        timeoutTime = utils_1.fromNow(reporting_1.SPAM_TIMEOUT * (settings.doubleTimeouts ? 2 : 1));
                        return [4 /*yield*/, countSpamming(client.accountId)];
                    case 1:
                        _a.sent();
                        if (!!playerUtils_1.isMutedOrShadowed(client)) return [3 /*break*/, 4];
                        if (!(timeout && settings.autoBanSpamming)) return [3 /*break*/, 3];
                        return [4 /*yield*/, timeoutAccount(client.accountId, timeoutTime, 'Timed out for spamming')];
                    case 2:
                        _a.sent();
                        if (settings.reportSpam) {
                            client.reporter.system('Timed out for spamming', items.join('\n'));
                        }
                        else {
                            client.reporter.systemLog('Timed out for spamming');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        if (settings.reportSpam && !ignoreReporting(message)) {
                            client.reporter.warn('Spam', message);
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }
    function countAndTimeoutForSpam(client, message, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var increment, _a, count, items, timeout;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        increment = message.length >= LONG_MESSAGE_LENGTH ? 2 : 1;
                        _a = spamCounter.add(client.accountId, message, increment), count = _a.count, items = _a.items;
                        timeout = count >= exports.MUTE_AFTER_LIMIT;
                        return [4 /*yield*/, countAndTimeout(client, timeout, message, items, settings)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    return function (client, message, settings) {
        if (client.isMod)
            return;
        if (message === '.')
            return;
        var lastSays = client.lastSays;
        var lastMatch = findLastSayByPartialString(lastSays, message);
        if (lastMatch) {
            lastMatch.count++;
            lastMatch.age = 0;
            var spamLimit = exports.REPORT_AFTER_LIMIT * getLengthMultiplier(message);
            if (lastMatch.count >= spamLimit) {
                lastMatch.count = 0;
                handlePromise(countAndTimeoutForSpam(client, message, settings), client.reporter.error);
            }
        }
        else {
            if (lastSays.length < exports.MULTIPLE_MATCH_COUNT) {
                lastSays.push({ message: message, count: 1, age: 0 });
            }
            else {
                lastSays.sort(byAge);
                var lastSay = lastSays[lastSays.length - 1];
                lastSay.message = message;
                lastSay.count = 1;
                lastSay.age = 0;
            }
        }
        for (var _i = 0, lastSays_1 = lastSays; _i < lastSays_1.length; _i++) {
            var say = lastSays_1[_i];
            say.age++;
        }
        var now = Date.now();
        var threshold = now - exports.RAPID_MESSAGE_TIMEOUT;
        var counter = rapidCounter.add(client.accountId, now);
        while (counter.items.length && counter.items[0] < threshold) {
            counter.items.shift();
            counter.count--;
        }
        if (counter.count > exports.RAPID_MESSAGE_COUNT) {
            countAndTimeout(client, true, 'rapid messages', ['rapid messages'], settings);
            rapidCounter.remove(client.accountId);
        }
    };
};
exports.createSpamChecker = createSpamChecker;
function findLastSayByPartialString(lastSays, message) {
    for (var _i = 0, lastSays_2 = lastSays; _i < lastSays_2.length; _i++) {
        var say = lastSays_2[_i];
        if (partialString(say.message, message)) {
            return say;
        }
    }
    return undefined;
}
function byAge(a, b) {
    return b.age - a.age;
}
function ignoreReporting(message) {
    return message.length <= 3 || /^[aаz]+$|^\/roll/i.test(message);
}
function partialString(a, b) {
    if (a === b) {
        return true;
    }
    else {
        var length_1 = Math.floor(Math.min(a.length, b.length) * 0.75);
        return length_1 > 8 && a.substr(0, length_1) === b.substr(0, length_1);
    }
}
function getLengthMultiplier(message) {
    if (message.length >= LONG_MESSAGE_LENGTH) {
        return exports.LONG_MESSAGE_MUL;
    }
    else if (message.length <= TINY_MESSAGE_LENGTH) {
        return exports.TINY_MESSAGE_MUL;
    }
    else if (message.length <= SHORT_MESSAGE_LENGTH) {
        return exports.SHORT_MESSAGE_MUL;
    }
    else {
        return 1;
    }
}
//# sourceMappingURL=spamChecker.js.map