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
exports.updateSupporterInvites = exports.SupporterInvitesService = exports.INVITE_REJECTED_LIMIT = exports.INVITE_REJECTED_TIMEOUT = void 0;
var lodash_1 = require("lodash");
var logger_1 = require("../logger");
var userError_1 = require("../userError");
var utils_1 = require("../../common/utils");
var constants_1 = require("../../common/constants");
var actionLimiter_1 = require("./actionLimiter");
var chat_1 = require("../chat");
var accountUtils_1 = require("../accountUtils");
exports.INVITE_REJECTED_TIMEOUT = 1 * constants_1.HOUR;
exports.INVITE_REJECTED_LIMIT = 5;
function formatMessage(requester, target, message) {
    var requesterInfo = requester.characterName + " (" + requester.account.name + ")";
    var targetInfo = target.characterName + " (" + target.account.name + ") [" + target.accountId + "]";
    return logger_1.systemMessage(requester.accountId, requesterInfo + " " + message + " " + targetInfo);
}
var SupporterInvitesService = /** @class */ (function () {
    function SupporterInvitesService(model, notifications, log) {
        this.model = model;
        this.notifications = notifications;
        this.log = log;
        this.limiter = new actionLimiter_1.ActionLimiter(exports.INVITE_REJECTED_TIMEOUT, exports.INVITE_REJECTED_LIMIT);
    }
    SupporterInvitesService.prototype.dispose = function () {
        this.limiter.dispose();
    };
    SupporterInvitesService.prototype.getInvites = function (source) {
        return __awaiter(this, void 0, void 0, function () {
            var items;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.find({ source: source.account._id }).exec()];
                    case 1:
                        items = _a.sent();
                        return [2 /*return*/, items.map(function (_a) {
                                var _id = _a._id, name = _a.name, info = _a.info, active = _a.active;
                                return ({ id: _id.toString(), name: name, info: info, active: active });
                            })];
                }
            });
        });
    };
    SupporterInvitesService.prototype.isInvited = function (target) {
        return __awaiter(this, void 0, void 0, function () {
            var count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.model.countDocuments({ target: target.account._id, active: true }).exec()];
                    case 1:
                        count = _a.sent();
                        return [2 /*return*/, count > 0];
                }
            });
        });
    };
    SupporterInvitesService.prototype.requestInvite = function (requester, target) {
        return __awaiter(this, void 0, void 0, function () {
            var items, limit;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getInvites(requester)];
                    case 1:
                        items = _a.sent();
                        limit = accountUtils_1.getSupporterInviteLimit(requester.account);
                        if (items.length >= limit)
                            return [2 /*return*/, chat_1.saySystem(requester, 'Invite limit reached')];
                        if (this.limiter.canExecute(requester, target) !== 0 /* Yes */)
                            return [2 /*return*/, chat_1.saySystem(requester, 'Cannot invite')];
                        this.log(formatMessage(requester, target, 'invited to supporter server'));
                        this.notifications.addNotification(target, {
                            id: 0,
                            sender: requester,
                            name: requester.pony.name || '',
                            entityId: requester.pony.id,
                            message: "<b>#NAME#</b> invited you to supporter servers",
                            flags: 8 /* Accept */ | 16 /* Reject */ | 64 /* Ignore */ |
                                (requester.pony.nameBad ? 128 /* NameBad */ : 0),
                            accept: function () { return _this.acceptInvite(requester, target); },
                            reject: function () { return _this.rejectInvite(requester, target); },
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    SupporterInvitesService.prototype.acceptInvite = function (requester, target) {
        this.log(formatMessage(requester, target, 'supporter invite accepted by'));
        this.invite(requester, target);
    };
    SupporterInvitesService.prototype.rejectInvite = function (requester, target) {
        this.log(formatMessage(requester, target, 'supporter invite rejected by'));
        this.limiter.count(requester);
    };
    SupporterInvitesService.prototype.invite = function (requester, target) {
        return __awaiter(this, void 0, void 0, function () {
            var limit, items;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        limit = accountUtils_1.getSupporterInviteLimit(requester.account);
                        return [4 /*yield*/, this.getInvites(requester)];
                    case 1:
                        items = _a.sent();
                        if (items.length >= limit) {
                            throw new userError_1.UserError('Invite limit reached');
                        }
                        return [4 /*yield*/, this.model.create({
                                source: requester.account._id,
                                target: target.account._id,
                                name: target.characterName,
                                info: target.character.info,
                                active: true,
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SupporterInvitesService.prototype.uninvite = function (requester, inviteId) {
        return Promise.resolve(this.model.deleteOne({ _id: inviteId, source: requester.account._id }).exec());
    };
    return SupporterInvitesService;
}());
exports.SupporterInvitesService = SupporterInvitesService;
function updateSupporterInvites(model) {
    return __awaiter(this, void 0, void 0, function () {
        var invites, itemsBySource, itemsToUpdate, groups;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, model.find({}, '_id active')
                        .populate('source', '_id supporter patreon roles')
                        .lean()
                        .exec()];
                case 1:
                    invites = _a.sent();
                    itemsBySource = lodash_1.toPairs(lodash_1.groupBy(invites, function (i) { return i.source._id; }));
                    itemsToUpdate = itemsBySource
                        .map(function (_a) {
                        var _ = _a[0], items = _a[1];
                        var source = items[0].source;
                        var limit = accountUtils_1.getSupporterInviteLimit(source);
                        return lodash_1.compact(items
                            .sort(function (a, b) { return utils_1.compareDates(a.createdAt, b.createdAt); })
                            .map(function (item, i) {
                            var active = i < limit;
                            return item.active === active ? undefined : { id: item._id, active: active };
                        }));
                    });
                    groups = lodash_1.toPairs(lodash_1.groupBy(utils_1.flatten(itemsToUpdate), function (i) { return i.active; }));
                    return [4 /*yield*/, Promise.all(groups.map(function (_a) {
                            var _ = _a[0], items = _a[1];
                            var active = items[0].active;
                            var ids = items.map(function (i) { return i.id; });
                            return model.updateMany({ _id: { $in: ids } }, { active: active }).exec();
                        }))];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, model.deleteMany({ active: false, updatedAt: { $lt: utils_1.fromNow(-100 * constants_1.DAY) } }).exec()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.updateSupporterInvites = updateSupporterInvites;
//# sourceMappingURL=supporterInvites.js.map