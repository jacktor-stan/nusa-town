"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.addHide = exports.findHidesForMerge = exports.findHideIdsRev = exports.findHideIds = exports.findFriends = exports.findFriendIds = exports.hasActiveSupporterInvites = exports.queryAccount = exports.queryAccounts = exports.updateAccounts = exports.updateAccount = exports.findAccountSafe = exports.checkIfAdmin = exports.findAccount = exports.updateAuth = exports.queryAuths = exports.countAllVisibleAuths = exports.findAllVisibleAuths = exports.findAllAuths = exports.findAuth = exports.findAuthByEmail = exports.findAuthByOpenId = exports.queryCharacter = exports.updateCharacterState = exports.removeCharacter = exports.findLatestCharacters = exports.findAllCharacters = exports.findCharacterById = exports.findCharacterSafe = exports.findCharacter = exports.characterCount = exports.createCharacter = exports.checkAccountExists = exports.checkCharacterExists = exports.nullToUndefined = exports.iterate = exports.HideRequest = exports.FriendRequest = exports.SupporterInvite = exports.Account = exports.Character = exports.Session = exports.Origin = exports.Event = exports.Auth = void 0;
var mongoose_1 = require("mongoose");
var logger_1 = require("./logger");
var accountUtils_1 = require("../common/accountUtils");
var emoji_1 = require("../client/emoji");
var characterUtils_1 = require("./characterUtils");
var swears_1 = require("../common/swears");
// schemas
var originInfo = {
    ip: String,
    country: String,
    last: Date,
};
var mergeInfo = {
    id: String,
    name: String,
    //code: Number,
    date: Date,
    reason: String,
    data: Object,
    split: Boolean,
};
var logEntry = {
    message: String,
    date: Date,
};
var authSchema = new mongoose_1.Schema({
    account: { type: mongoose_1.Schema.Types.ObjectId, index: true, ref: 'Account' },
    openId: String,
    provider: String,
    name: String,
    url: String,
    emails: [String],
    disabled: Boolean,
    banned: Boolean,
    pledged: Number,
    lastUsed: Date,
}, { timestamps: true });
authSchema.index({ updatedAt: 1 });
authSchema.index({ openId: 1, provider: 1 }, { unique: true });
var bannedMuted = {
    mute: Number,
    shadow: Number,
    ban: Number,
};
var originSchema = new mongoose_1.Schema(__assign({ ip: { type: String, index: true }, country: String }, bannedMuted), { timestamps: true });
originSchema.index({ updatedAt: 1 });
var accountSchema = new mongoose_1.Schema({
    name: String,
    birthdate: Date,
    birthyear: Number,
    // code: Number,
    emails: { type: [String], index: true },
    lastVisit: Date,
    lastUserAgent: String,
    lastBrowserId: String,
    lastOnline: Date,
    lastCharacter: mongoose_1.Schema.Types.ObjectId,
    roles: [String],
    origins: [originInfo],
    note: String,
    noteUpdated: Date,
    ignores: [String],
    // friends: [{ type: Schema.Types.ObjectId, unique: true, ref: 'Account' }],
    flags: Number,
    characterCount: { type: Number, default: 0 },
    // NOTE: use account.markModified('settings') if changed nested field
    settings: { type: mongoose_1.Schema.Types.Mixed, default: function () { return ({}); } },
    counters: { type: mongoose_1.Schema.Types.Mixed, default: function () { return ({}); } },
    patreon: Number,
    supporter: Number,
    supporterLog: [logEntry],
    supporterTotal: Number,
    supporterDeclinedSince: Date,
    merges: [mergeInfo],
    banLog: [logEntry],
    mute: Number,
    shadow: Number,
    ban: Number,
    // auths: [{ type: Schema.Types.ObjectId, ref: 'Auth' }],
    state: Object,
    alert: Object,
    savedMap: String,
}, { timestamps: true });
accountSchema.virtual('auths', {
    ref: 'Auth',
    localField: '_id',
    foreignField: 'account',
});
accountSchema.virtual('characters', {
    ref: 'Character',
    localField: '_id',
    foreignField: 'account',
});
accountSchema.index({ updatedAt: 1 });
var characterSchema = new mongoose_1.Schema({
    account: { type: mongoose_1.Schema.Types.ObjectId, index: true, ref: 'Account' },
    site: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Auth' },
    name: { type: String, index: true },
    desc: String,
    tag: String,
    info: String,
    flags: { type: Number, default: 0 },
    lastUsed: { type: Date, index: true },
    creator: String,
    state: Object,
}, { timestamps: true });
characterSchema.index({ updatedAt: 1 });
characterSchema.index({ createdAt: 1 });
var eventSchema = new mongoose_1.Schema({
    account: { type: mongoose_1.Schema.Types.ObjectId, index: true, ref: 'Account' },
    pony: mongoose_1.Schema.Types.ObjectId,
    type: String,
    server: String,
    message: String,
    desc: String,
    origin: originInfo,
    count: { type: Number, default: 1 },
}, { timestamps: true });
eventSchema.index({ updatedAt: 1 });
var supporterInviteSchema = new mongoose_1.Schema({
    source: { type: mongoose_1.Schema.Types.ObjectId, index: true, ref: 'Account' },
    target: { type: mongoose_1.Schema.Types.ObjectId, index: true, ref: 'Account' },
    name: String,
    info: String,
    active: Boolean,
}, { timestamps: true });
var friendRequestSchema = new mongoose_1.Schema({
    source: { type: mongoose_1.Schema.Types.ObjectId, index: true, ref: 'Account' },
    target: { type: mongoose_1.Schema.Types.ObjectId, index: true, ref: 'Account' },
});
var hideRequestSchema = new mongoose_1.Schema({
    source: { type: mongoose_1.Schema.Types.ObjectId, index: true, ref: 'Account' },
    target: { type: mongoose_1.Schema.Types.ObjectId, index: true, ref: 'Account' },
    name: String,
    date: Date,
});
var sessionSchema = new mongoose_1.Schema({
    _id: String,
    session: String,
});
// models
exports.Auth = mongoose_1.model('Auth', authSchema);
exports.Event = mongoose_1.model('Event', eventSchema);
exports.Origin = mongoose_1.model('Origin', originSchema);
exports.Session = mongoose_1.model('session', sessionSchema);
exports.Character = mongoose_1.model('Character', characterSchema);
accountSchema.post('remove', function (doc) {
    Promise.all([
        exports.Character.deleteMany({ account: doc._id }).exec(),
        exports.Event.deleteMany({ account: doc._id }).exec(),
        exports.Auth.deleteMany({ account: doc._id }).exec(),
        exports.FriendRequest.deleteMany({ $or: [{ target: doc._id }, { source: doc._id }] }).exec(),
        exports.HideRequest.deleteMany({ $or: [{ target: doc._id }, { source: doc._id }] }).exec(),
    ]).catch(logger_1.logger.error);
});
exports.Account = mongoose_1.model('Account', accountSchema);
exports.SupporterInvite = mongoose_1.model('SupporterInvite', supporterInviteSchema);
exports.FriendRequest = mongoose_1.model('FriendRequest', friendRequestSchema);
exports.HideRequest = mongoose_1.model('HideRequest', hideRequestSchema);
function iterate(query, onData) {
    return new Promise(function (resolve) {
        query.cursor()
            .on('data', onData)
            .on('end', resolve);
    });
}
exports.iterate = iterate;
function throwOnEmpty(message) {
    return function (item) {
        if (item) {
            return item;
        }
        else {
            throw new Error(message);
        }
    };
}
function nullToUndefined(item) {
    return item === null ? undefined : item;
}
exports.nullToUndefined = nullToUndefined;
exports.checkCharacterExists = throwOnEmpty('Character does not exist');
exports.checkAccountExists = throwOnEmpty('Account does not exist');
function createCharacter(account) {
    return new exports.Character({ account: account._id, creator: account.name + " [" + account._id + "]" });
}
exports.createCharacter = createCharacter;
function characterCount(account) {
    return exports.Character.countDocuments({ account: account }).exec();
}
exports.characterCount = characterCount;
function findCharacter(pony, account) {
    return exports.Character.findOne({ _id: pony, account: account }).exec().then(nullToUndefined);
}
exports.findCharacter = findCharacter;
function findCharacterSafe(pony, accountId) {
    return findCharacter(pony, accountId)
        .then(exports.checkCharacterExists);
}
exports.findCharacterSafe = findCharacterSafe;
function findCharacterById(id) {
    return exports.Character.findById(id).exec().then(nullToUndefined);
}
exports.findCharacterById = findCharacterById;
var findAllCharacters = function (account, fields) {
    return exports.Character.find({ account: account }, fields).lean().exec();
};
exports.findAllCharacters = findAllCharacters;
function findLatestCharacters(account, count) {
    return exports.Character.find({ account: account })
        .sort('-lastUsed')
        .limit(count)
        .exec();
}
exports.findLatestCharacters = findLatestCharacters;
function removeCharacter(id, account) {
    return exports.Character.findOneAndRemove({ _id: id, account: account }).exec().then(nullToUndefined);
}
exports.removeCharacter = removeCharacter;
var updateCharacterState = function (characterId, serverName, state) {
    var _a;
    return exports.Character.updateOne({ _id: characterId }, (_a = {}, _a["state." + serverName] = state, _a)).exec().then(nullToUndefined);
};
exports.updateCharacterState = updateCharacterState;
var queryCharacter = function (query, fields) {
    return exports.Character.findOne(query, fields).exec();
};
exports.queryCharacter = queryCharacter;
var findAuthByOpenId = function (openId, provider) {
    return exports.Auth.findOne({ openId: openId, provider: provider }).exec().then(nullToUndefined);
};
exports.findAuthByOpenId = findAuthByOpenId;
var findAuthByEmail = function (emails) {
    return exports.Auth.findOne({ emails: { $in: emails } }).exec().then(nullToUndefined);
};
exports.findAuthByEmail = findAuthByEmail;
var findAuth = function (auth, account, fields) {
    return exports.Auth.findOne({ _id: auth, account: account }, fields).exec().then(nullToUndefined);
};
exports.findAuth = findAuth;
var findAllAuths = function (account, fields) {
    return exports.Auth.find({ account: account, fields: fields }).exec();
};
exports.findAllAuths = findAllAuths;
var findAllVisibleAuths = function (account, fields) {
    return exports.Auth.find({ account: account, disabled: { $ne: true }, banned: { $ne: true } }, fields).lean().exec();
};
exports.findAllVisibleAuths = findAllVisibleAuths;
var countAllVisibleAuths = function (account) {
    return exports.Auth.find({ account: account, disabled: { $ne: true }, banned: { $ne: true } }).countDocuments().exec();
};
exports.countAllVisibleAuths = countAllVisibleAuths;
var queryAuths = function (query, fields) {
    return exports.Auth.find(query, fields).lean().exec();
};
exports.queryAuths = queryAuths;
var updateAuth = function (id, update) {
    return exports.Auth.updateOne({ _id: id }, update).exec();
};
exports.updateAuth = updateAuth;
var findAccount = function (account, projection) {
    return exports.Account.findById(account, projection).exec().then(nullToUndefined);
};
exports.findAccount = findAccount;
function checkIfAdmin(account) {
    return exports.Account.findOne({ _id: account }, 'roles').lean().exec()
        .then(function (a) { return a && accountUtils_1.isAdmin(a); });
}
exports.checkIfAdmin = checkIfAdmin;
function findAccountSafe(account, projection) {
    return exports.findAccount(account, projection)
        .then(exports.checkAccountExists);
}
exports.findAccountSafe = findAccountSafe;
var updateAccount = function (accountId, update) {
    return exports.Account.updateOne({ _id: accountId }, update).exec();
};
exports.updateAccount = updateAccount;
var updateAccounts = function (query, update) {
    return exports.Account.updateMany(query, update).exec();
};
exports.updateAccounts = updateAccounts;
var queryAccounts = function (query, fields) {
    return exports.Account.find(query, fields).lean().exec();
};
exports.queryAccounts = queryAccounts;
var queryAccount = function (query, fields) {
    return exports.Account.findOne(query, fields).exec().then(nullToUndefined);
};
exports.queryAccount = queryAccount;
var hasActiveSupporterInvites = function (accountId) {
    return exports.SupporterInvite.countDocuments({ target: accountId, active: true }).exec()
        .then(function (count) { return count > 0; });
};
exports.hasActiveSupporterInvites = hasActiveSupporterInvites;
// friend requests
function findFriendIds(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var accountIdString, friendRequests, friendIds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    accountIdString = accountId.toString();
                    return [4 /*yield*/, exports.FriendRequest
                            .find({ $or: [{ source: accountId }, { target: accountId }] }, 'source target')
                            .lean()
                            .exec()];
                case 1:
                    friendRequests = _a.sent();
                    friendIds = friendRequests
                        .map(function (f) { return f.source.toString() === accountIdString ? f.target.toString() : f.source.toString(); });
                    return [2 /*return*/, friendIds];
            }
        });
    });
}
exports.findFriendIds = findFriendIds;
function findFriends(accountId, withCharacters) {
    return __awaiter(this, void 0, void 0, function () {
        var friendIds, accounts, characters, characterIds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, findFriendIds(accountId)];
                case 1:
                    friendIds = _a.sent();
                    return [4 /*yield*/, exports.Account.find({ _id: { $in: friendIds } }, '_id name lastOnline lastCharacter').lean().exec()];
                case 2:
                    accounts = _a.sent();
                    characters = [];
                    if (!withCharacters) return [3 /*break*/, 4];
                    characterIds = accounts.map(function (a) { return a.lastCharacter; }).filter(function (id) { return id; });
                    return [4 /*yield*/, exports.Character.find({ _id: { $in: characterIds } }, '_id name info').lean().exec()];
                case 3:
                    characters = _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, accounts.map(function (a) {
                        var characterId = a.lastCharacter && a.lastCharacter.toString();
                        var character = characterId && characters.find(function (c) { return c._id.toString() === characterId; });
                        var name = character && characterUtils_1.filterForbidden(emoji_1.replaceEmojis(character.name));
                        var nameFiltered = name && swears_1.filterName(name);
                        return {
                            accountId: a._id.toString(),
                            accountName: a.name,
                            name: name,
                            pony: character && character.info,
                            nameBad: name !== nameFiltered,
                        };
                    })];
            }
        });
    });
}
exports.findFriends = findFriends;
// hide requests
function findHideIds(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var hideRequests;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.HideRequest.find({ source: accountId }, 'target').lean().exec()];
                case 1:
                    hideRequests = _a.sent();
                    return [2 /*return*/, hideRequests.map(function (f) { return f.target.toString(); })];
            }
        });
    });
}
exports.findHideIds = findHideIds;
function findHideIdsRev(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var hideRequests;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.HideRequest.find({ target: accountId }, 'source').lean().exec()];
                case 1:
                    hideRequests = _a.sent();
                    return [2 /*return*/, hideRequests.map(function (f) { return f.source.toString(); })];
            }
        });
    });
}
exports.findHideIdsRev = findHideIdsRev;
function findHidesForMerge(accountId) {
    return __awaiter(this, void 0, void 0, function () {
        var hideRequests;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, exports.HideRequest
                        .find({ source: accountId }, '_id name date')
                        .lean()
                        .exec()];
                case 1:
                    hideRequests = _a.sent();
                    return [2 /*return*/, hideRequests.map(function (f) { return ({
                            id: f._id.toString(),
                            name: f.name,
                            date: f.date.toString(),
                        }); })];
            }
        });
    });
}
exports.findHidesForMerge = findHidesForMerge;
function addHide(source, target, name) {
    return __awaiter(this, void 0, void 0, function () {
        var existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (source.toString() === target.toString())
                        return [2 /*return*/];
                    return [4 /*yield*/, exports.HideRequest.findOne({ source: source, target: target }, '_id').lean().exec()];
                case 1:
                    existing = _a.sent();
                    if (!!existing) return [3 /*break*/, 3];
                    return [4 /*yield*/, exports.HideRequest.create({ source: source, target: target, name: name, date: new Date() })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.addHide = addHide;
//# sourceMappingURL=db.js.map