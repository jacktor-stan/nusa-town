"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartyService = exports.INVITE_REJECTED_TIMEOUT = exports.INVITE_REJECTED_LIMIT = exports.INVITE_LIMIT = exports.LEADER_TIMEOUT = void 0;
var rxjs_1 = require("rxjs");
var lodash_1 = require("lodash");
var utils_1 = require("../../common/utils");
var constants_1 = require("../../common/constants");
var actionLimiter_1 = require("./actionLimiter");
var chat_1 = require("../chat");
var friends_1 = require("./friends");
exports.LEADER_TIMEOUT = 5 * constants_1.SECOND;
exports.INVITE_LIMIT = 5;
exports.INVITE_REJECTED_LIMIT = 5;
exports.INVITE_REJECTED_TIMEOUT = 1 * constants_1.HOUR;
function toPartyMember(client, pending, leader) {
    var flags = (pending ? 2 /* Pending */ : 0)
        | (leader ? 1 /* Leader */ : 0)
        | (client.offline ? 4 /* Offline */ : 0);
    return [client.pony.id, flags];
}
function findClientInParties(parties, accountId) {
    for (var _i = 0, parties_1 = parties; _i < parties_1.length; _i++) {
        var party = parties_1[_i];
        for (var index = 0; index < party.clients.length; index++) {
            if (party.clients[index].accountId === accountId) {
                return { party: party, index: index };
            }
        }
    }
    return { party: undefined, index: 0 };
}
var PartyService = /** @class */ (function () {
    function PartyService(notificationService, reportInviteLimit) {
        this.notificationService = notificationService;
        this.reportInviteLimit = reportInviteLimit;
        this.parties = [];
        this.partyChanged = new rxjs_1.Subject();
        this.id = 0;
        this.limiter = new actionLimiter_1.ActionLimiter(exports.INVITE_REJECTED_TIMEOUT, exports.INVITE_REJECTED_LIMIT);
    }
    PartyService.prototype.dispose = function () {
        this.limiter.dispose();
    };
    PartyService.prototype.clientConnected = function (client) {
        var _a = findClientInParties(this.parties, client.accountId), party = _a.party, index = _a.index;
        if (party) {
            var existing = party.clients[index];
            party.clients[index] = client;
            client.party = party;
            if (party.leader === existing) {
                party.leader = client;
                clearTimeout(party.leaderTimeout);
            }
            existing.party = undefined;
            existing.offlineAt = new Date();
            this.sendPartyUpdateToAll(party);
        }
    };
    PartyService.prototype.clientDisconnected = function (client) {
        var _this = this;
        var party = client.party;
        if (party) {
            this.sendPartyUpdateToAll(party);
            party.leaderTimeout = setTimeout(function () {
                var newLeader = party.clients.find(function (c) { return c !== client && !c.offline; });
                if (newLeader) {
                    _this.promoteLeader(client, newLeader);
                }
                else {
                    _this.destroyParty(party);
                }
            }, exports.LEADER_TIMEOUT);
        }
        else {
            var pendingParty = this.parties.find(function (p) { return p.pending.some(function (x) { return x.client === client; }); });
            if (pendingParty) {
                lodash_1.remove(pendingParty.pending, function (x) { return x.client === client; });
                this.sendPartyUpdateToAll(pendingParty);
            }
        }
    };
    PartyService.prototype.remove = function (leader, client) {
        var party = leader.party;
        if (!party || party.leader !== leader)
            return;
        if (utils_1.includes(party.clients, client)) {
            utils_1.removeItem(party.clients, client);
            client.party = undefined;
            if (party.leader === client && party.clients[0]) {
                party.leader = party.clients[0];
            }
            client.updateParty(undefined);
            this.sendPartyUpdateToAll(party);
            this.partyChanged.next(client);
        }
        else {
            var pending = party.pending.find(function (p) { return p.client === client; });
            if (pending) {
                leader.reporter.systemLog("Invite cancelled for [" + client.accountId + "]");
                utils_1.removeItem(party.pending, pending);
                this.notificationService.removeNotification(pending.client, pending.notificationId);
                this.sendPartyUpdateToAll(party);
                this.countReject(leader);
            }
        }
        this.cleanupParty(party);
    };
    PartyService.prototype.invite = function (leader, client) {
        var party = leader.party;
        var can = this.limiter.canExecute(leader, client);
        if (can === 4 /* LimitReached */) {
            return chat_1.saySystem(leader, 'Reached invite rejection limit');
        }
        else if (can !== 0 /* Yes */) {
            return chat_1.saySystem(leader, 'Cannot invite');
        }
        if (client.shadowed)
            return chat_1.saySystem(leader, 'Cannot invite');
        if (utils_1.hasFlag(leader.account.flags, 1 /* BlockPartyInvites */))
            return chat_1.saySystem(leader, 'Cannot invite');
        if (party && party.leader !== leader)
            return chat_1.saySystem(leader, 'You need to be party leader');
        if (party && (party.clients.length + party.pending.length) >= constants_1.PARTY_LIMIT)
            return chat_1.saySystem(leader, 'Party is full');
        if (client.party)
            return chat_1.saySystem(leader, 'Already in a party');
        if (party && party.pending.some(function (p) { return p.client === client; }))
            return chat_1.saySystem(leader, 'Already invited');
        if (client.accountSettings.ignorePartyInvites && !friends_1.isFriend(client, leader))
            return chat_1.saySystem(leader, 'Cannot invite');
        if (this.parties.reduce(function (sum, p) { return sum + p.pending.filter(function (x) { return x.client === client; }).length; }, 0) >= exports.INVITE_LIMIT)
            return chat_1.saySystem(leader, 'Too many pending invites');
        var partyExisted = !!leader.party;
        if (!partyExisted) {
            party = this.createParty(leader);
        }
        /* istanbul ignore next */
        if (!party)
            throw new Error("Party not created");
        var notificationId = this.addInviteNotification(client, leader, party);
        if (!notificationId) {
            if (!partyExisted) {
                leader.party = undefined;
                utils_1.removeItem(this.parties, party);
            }
            return chat_1.saySystem(leader, 'Cannot invite');
        }
        party.pending.push({ client: client, notificationId: notificationId });
        this.sendPartyUpdateToAll(party);
        leader.reporter.systemLog("Invite to party [" + client.accountId + "]");
        if (!partyExisted) {
            this.partyChanged.next(leader);
        }
    };
    PartyService.prototype.leave = function (client) {
        if (client.party) {
            this.remove(client.party.leader, client);
        }
    };
    PartyService.prototype.promoteLeader = function (leader, client) {
        var party = leader.party;
        if (!party)
            return;
        if (leader === client)
            return;
        if (client.offline)
            return chat_1.saySystem(leader, 'Player is offline');
        if (party.leader !== leader)
            return chat_1.saySystem(leader, 'You need to be party leader');
        if (!utils_1.includes(party.clients, client))
            return chat_1.saySystem(leader, 'Not in the party');
        party.leader = client;
        this.sendPartyUpdateToAll(party);
    };
    PartyService.prototype.cleanupParties = function () {
        var now = Date.now();
        for (var i = this.parties.length - 1; i >= 0; i--) {
            var party = this.parties[i];
            if (party.clients.every(function (c) { return c.offline; })) {
                party.cleanup = party.cleanup || now;
                if ((now - party.cleanup) > (10 * constants_1.SECOND)) {
                    this.destroyParty(party);
                }
            }
            else if (party.cleanup !== undefined) {
                party.cleanup = undefined;
            }
        }
    };
    PartyService.prototype.createParty = function (leader) {
        var party = {
            id: "party-" + this.id++,
            leader: leader,
            clients: [leader],
            pending: [],
        };
        leader.party = party;
        this.parties.push(party);
        return party;
    };
    PartyService.prototype.destroyParty = function (party) {
        var _this = this;
        var clients = party.clients;
        clients.forEach(function (c) { return c.party = undefined; });
        clients.forEach(function (c) { return c.updateParty(undefined); });
        party.pending.forEach(function (p) { return _this.notificationService.removeNotification(p.client, p.notificationId); });
        party.clients = [];
        party.pending = [];
        utils_1.removeItem(this.parties, party);
        clients.forEach(function (c) { return _this.partyChanged.next(c); });
    };
    PartyService.prototype.sendPartyUpdate = function (client, party) {
        var clients = party.clients.map(function (c) { return toPartyMember(c, false, c === party.leader); });
        var pending = party.pending.map(function (c) { return toPartyMember(c.client, true, false); });
        client.updateParty(__spreadArray(__spreadArray([], clients), pending));
    };
    PartyService.prototype.sendPartyUpdateToAll = function (party) {
        var _this = this;
        party.clients
            .filter(function (c) { return !c.offline; })
            .forEach(function (c) { return _this.sendPartyUpdate(c, party); });
    };
    PartyService.prototype.cleanupParty = function (party) {
        if (party.clients.length === 0 || (party.clients.length + party.pending.length) <= 1) {
            this.destroyParty(party);
        }
    };
    PartyService.prototype.acceptInvitation = function (party, client, invitedBy) {
        var _this = this;
        var removed = lodash_1.remove(party.pending, function (p) { return p.client === client; })[0];
        if (!client.party && removed) {
            party.leader.reporter.systemLog("Invite accepted by [" + client.accountId + "]");
            party.clients.push(client);
            client.party = party;
            this.notificationService.removeNotification(client, removed.notificationId);
            this.sendPartyUpdateToAll(party);
            this.parties
                .filter(function (p) { return p.pending.some(function (x) { return x.client === client; }); })
                .forEach(function (p) { return _this.rejectInvitation(p, client, invitedBy); });
            this.partyChanged.next(client);
        }
    };
    PartyService.prototype.rejectInvitation = function (party, client, invitedBy) {
        var removed = lodash_1.remove(party.pending, function (p) { return p.client === client; })[0];
        if (removed) {
            party.leader.reporter.systemLog("Invite rejected by [" + client.accountId + "]");
            this.notificationService.removeNotification(client, removed.notificationId);
            this.sendPartyUpdateToAll(party);
            this.cleanupParty(party);
            this.countReject(invitedBy);
        }
    };
    PartyService.prototype.countReject = function (invitedBy) {
        var count = this.limiter.count(invitedBy);
        if (count >= exports.INVITE_REJECTED_LIMIT) {
            this.reportInviteLimit(invitedBy);
        }
    };
    PartyService.prototype.addInviteNotification = function (client, leader, party) {
        var _this = this;
        return this.notificationService.addNotification(client, {
            id: 0,
            sender: leader,
            name: leader.pony.name || '',
            entityId: leader.pony.id,
            message: "<div class=\"text-party\"><b>Party invite</b></div><b>#NAME#</b> invited you to a party",
            flags: 8 /* Accept */ | 16 /* Reject */ | 64 /* Ignore */ |
                (client.pony.nameBad ? 128 /* NameBad */ : 0),
            accept: function () { return _this.acceptInvitation(party, client, leader); },
            reject: function () { return _this.rejectInvitation(party, client, leader); },
        });
    };
    return PartyService;
}());
exports.PartyService = PartyService;
//# sourceMappingURL=party.js.map