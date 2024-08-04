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
exports.createServerActionsFactory = void 0;
var fs = require("fs");
var lodash_1 = require("lodash");
var constants_1 = require("../common/constants");
var admin_accounts_1 = require("./api/admin-accounts");
var serverActions_1 = require("./serverActions");
var reporting_1 = require("./reporting");
var spamChecker_1 = require("./spamChecker");
var notification_1 = require("./services/notification");
var counter_1 = require("./services/counter");
var hiding_1 = require("./services/hiding");
var party_1 = require("./services/party");
var world_1 = require("./world");
var logger_1 = require("./logger");
var chat_1 = require("./chat");
var commands_1 = require("./commands");
var playerUtils_1 = require("./playerUtils");
var account_1 = require("./api/account");
var db_1 = require("./db");
var supporterInvites_1 = require("./services/supporterInvites");
var move_1 = require("./move");
var liveSettings_1 = require("./liveSettings");
var security_1 = require("../common/security");
var characterUtils_1 = require("./characterUtils");
var friends_1 = require("./services/friends");
var config_1 = require("./config");
var utils_1 = require("../common/utils");
function refreshSettings(account) {
    return __awaiter(this, void 0, void 0, function () {
        var a;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.Account.findOne({ _id: account._id }, 'settings').exec()];
                case 1:
                    a = _a.sent();
                    if (a) {
                        account.settings = a.settings;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function createServerActionsFactory(server, settings, getSettings, socketStats) {
    var reportInviteLimitFunc = reporting_1.reportInviteLimit(admin_accounts_1.reportInviteLimitAccount, "Party invite limit");
    var reportFriendLimitFunc = reporting_1.reportInviteLimit(admin_accounts_1.reportFriendLimitAccount, "Friend request limit");
    var notifications = new notification_1.NotificationService();
    var party = new party_1.PartyService(notifications, reportInviteLimitFunc);
    var supporterInvites = new supporterInvites_1.SupporterInvitesService(db_1.SupporterInvite, notifications, logger_1.log);
    var friends = new friends_1.FriendsService(notifications, reportFriendLimitFunc);
    var world;
    var hiding = new hiding_1.HidingService(constants_1.UNHIDE_TIMEOUT, notifications, function (accountId) { return world_1.findClientByAccountId(world, accountId); }, logger_1.log);
    world = new world_1.World(server, party, friends, hiding, notifications, getSettings, liveSettings_1.liveSettings, socketStats);
    var spamCounter = new counter_1.CounterService(2 * constants_1.HOUR);
    var rapidCounter = new counter_1.CounterService(1 * constants_1.MINUTE);
    var swearsCounter = new counter_1.CounterService(2 * constants_1.HOUR);
    var forbiddenCounter = new counter_1.CounterService(4 * constants_1.HOUR);
    var suspiciousCounter = new counter_1.CounterService(4 * constants_1.HOUR);
    var teleportCounter = new counter_1.CounterService(1 * constants_1.HOUR);
    var statesCounter = new counter_1.CounterService(10 * constants_1.SECOND);
    var logChatMessage = function (client, text, type, ignored, target) { return logger_1.chat(server, client, text, type, ignored, target); };
    world.season = utils_1.parseSeason(server.season) || utils_1.parseSeason(config_1.config.season) || constants_1.SEASON;
    world.holiday = utils_1.parseHoliday(server.holiday) || utils_1.parseHoliday(config_1.config.holiday) || constants_1.HOLIDAY;
    try {
        var hidingData = fs.readFileSync(hiding_1.hidingDataPath(server.id), 'utf8');
        if (hidingData) {
            hiding.deserialize(hidingData);
        }
    }
    catch (_a) { }
    hiding_1.pollHidingDataSave(hiding, server.id);
    hiding.changes.subscribe(function (_a) {
        var by = _a.by, who = _a.who;
        return world.notifyHidden(by, who);
    });
    hiding.unhidesAll.subscribe(function (by) { return world.kickByAccount(by); });
    hiding.start();
    spamCounter.start();
    swearsCounter.start();
    forbiddenCounter.start();
    suspiciousCounter.start();
    var commands = commands_1.createCommands(world);
    var spamCommands = commands_1.getSpamCommandNames(commands);
    var runCommand = commands_1.createRunCommand({ world: world, notifications: notifications, random: lodash_1.random, liveSettings: liveSettings_1.liveSettings, party: party }, commands);
    var updateSettings = account_1.createUpdateSettings(db_1.findAccountSafe);
    var accountService = {
        update: admin_accounts_1.updateAccountSafe,
        updateSettings: function (account, settings) { return updateSettings(account, settings).then(lodash_1.noop); },
        refreshSettings: refreshSettings,
        updateAccount: db_1.updateAccount,
        updateCharacterState: function (characterId, state) { return characterUtils_1.updateCharacterState(characterId, server.id, state); },
    };
    var reportSwears = reporting_1.createReportSwears(swearsCounter, admin_accounts_1.reportSwearingAccount, admin_accounts_1.timeoutAccount);
    var reportForbidden = reporting_1.createReportForbidden(forbiddenCounter, admin_accounts_1.timeoutAccount);
    var reportSuspicious = reporting_1.createReportSuspicious(suspiciousCounter);
    var checkSpam = spamChecker_1.createSpamChecker(spamCounter, rapidCounter, admin_accounts_1.reportSpammingAccount, admin_accounts_1.timeoutAccount);
    var isSuspiciousMessage = security_1.createIsSuspiciousMessage(settings);
    var say = chat_1.createSay(world, runCommand, logChatMessage, checkSpam, reportSwears, reportForbidden, reportSuspicious, spamCommands, Math.random, isSuspiciousMessage);
    var move = move_1.createMove(teleportCounter);
    var ignorePlayer = playerUtils_1.createIgnorePlayer(db_1.updateAccount);
    function createServerActions(client) {
        return __awaiter(this, void 0, void 0, function () {
            var account, _a, friendIds, hideIds;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        account = client.tokenData.account;
                        return [4 /*yield*/, Promise.all([db_1.findFriendIds(account._id), db_1.findHideIds(account._id)])];
                    case 1:
                        _a = _b.sent(), friendIds = _a[0], hideIds = _a[1];
                        playerUtils_1.createClientAndPony(client, friendIds, hideIds, server, world, statesCounter);
                        return [2 /*return*/, new serverActions_1.ServerActions(client, world, notifications, party, supporterInvites, getSettings, server, say, move, hiding, statesCounter, accountService, ignorePlayer, playerUtils_1.findClientByEntityId, friends)];
                }
            });
        });
    }
    return { world: world, hiding: hiding, createServerActions: createServerActions };
}
exports.createServerActionsFactory = createServerActionsFactory;
//# sourceMappingURL=serverActionsManager.js.map