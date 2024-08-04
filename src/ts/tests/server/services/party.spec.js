"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../../lib");
var lodash_1 = require("lodash");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var constants_1 = require("../../../common/constants");
var notification_1 = require("../../../server/services/notification");
var party_1 = require("../../../server/services/party");
var mocks_1 = require("../../mocks");
var playerUtils_1 = require("../../../server/playerUtils");
var utils_1 = require("../../../common/utils");
describe('PartyService', function () {
    var notificationService;
    var partyService;
    var leader;
    var client;
    var addNotification;
    var leaderUpdateParty;
    var clientUpdateParty;
    var reportInviteLimit;
    var clock;
    function createClient(id, characterId, accountId) {
        return mocks_1.mockClient({
            accountId: accountId,
            characterId: characterId,
            pony: { id: id },
            character: { id: characterId },
            account: { id: accountId },
        });
    }
    function createParty(leader, clients, pending) {
        if (clients === void 0) { clients = []; }
        if (pending === void 0) { pending = []; }
        var party = {
            id: 'some_id',
            leader: leader,
            clients: __spreadArray([leader], clients),
            pending: pending.map(function (client) { return ({ client: client, notificationId: 5 }); }),
        };
        party.clients.forEach(function (c) { return c.party = party; });
        partyService.parties.push(party);
        return party;
    }
    beforeEach(function () {
        clock = sinon_1.useFakeTimers(Date.now());
        leader = createClient(1, 'foo', 'foofoo');
        client = createClient(2, 'bar', 'barbar');
        leaderUpdateParty = sinon_1.stub(leader, 'updateParty');
        clientUpdateParty = sinon_1.stub(client, 'updateParty');
        reportInviteLimit = sinon_1.stub();
        notificationService = new notification_1.NotificationService();
        addNotification = sinon_1.stub(notificationService, 'addNotification').returns(1);
        partyService = new party_1.PartyService(notificationService, reportInviteLimit);
    });
    afterEach(function () {
        clock.restore();
        partyService.dispose();
    });
    describe('clientConnected()', function () {
        it('does nothing if there is no party for client', function () {
            partyService.clientConnected(client);
            sinon_1.assert.notCalled(clientUpdateParty);
        });
        describe('rejoining', function () {
            beforeEach(function () {
                partyService.invite(leader, client);
                addNotification.firstCall.args[1].accept();
            });
            it('replaces matching client', function () {
                var newClient = createClient(5, 'bar', 'barbar');
                partyService.clientConnected(newClient);
                chai_1.expect(leader.party.clients[1]).equal(newClient);
            });
            it('replaces matching client for the same account', function () {
                var newClient = createClient(5, 'abc', 'barbar');
                partyService.clientConnected(newClient);
                chai_1.expect(leader.party.clients[1]).equal(newClient);
            });
            it('updates leader if leader reconnected', function () {
                var newLeader = createClient(5, 'foo', 'foofoo');
                partyService.clientConnected(newLeader);
                chai_1.expect(client.party.leader).equal(newLeader);
            });
            it('sends party update', function () {
                var newClient = createClient(5, 'bar', 'barbar');
                var updateParty = sinon_1.stub(newClient, 'updateParty');
                leaderUpdateParty.reset();
                partyService.clientConnected(newClient);
                sinon_1.assert.calledOnce(updateParty);
                sinon_1.assert.calledOnce(leaderUpdateParty);
            });
            it('sets party for new client', function () {
                var newClient = createClient(5, 'bar', 'barbar');
                partyService.clientConnected(newClient);
                chai_1.expect(newClient.party).equal(leader.party);
            });
            it('unsets party for old client', function () {
                var newClient = createClient(5, 'bar', 'barbar');
                partyService.clientConnected(newClient);
                chai_1.expect(client.party).undefined;
            });
            it('sets offlineAt to current time', function () {
                var newClient = createClient(5, 'bar', 'barbar');
                clock.setSystemTime(100);
                partyService.clientConnected(newClient);
                chai_1.expect(client.offlineAt.getTime()).equal(new Date().getTime());
            });
        });
        it('cancels new leader promotion', function () {
            var party = createParty(leader, [client, createClient(9, 'x', 'xx')]);
            var promoteLeader = sinon_1.stub(partyService, 'promoteLeader');
            var newLeader = createClient(10, 'foo', 'foofoo');
            leader.offline = true;
            partyService.clientDisconnected(leader);
            partyService.clientConnected(newLeader);
            clock.tick(party_1.LEADER_TIMEOUT + 100);
            chai_1.expect(party.leader).equal(newLeader);
            sinon_1.assert.notCalled(promoteLeader);
        });
    });
    describe('clientDisconnected()', function () {
        it('sends party update', function () {
            createParty(leader, [client]);
            client.offline = true;
            partyService.clientDisconnected(client);
            sinon_1.assert.calledWith(leaderUpdateParty, [
                [1, 1 /* Leader */],
                [2, 4 /* Offline */],
            ]);
        });
        it('does not send party update to disconnected client', function () {
            createParty(leader, [client]);
            client.offline = true;
            partyService.clientDisconnected(client);
            sinon_1.assert.notCalled(clientUpdateParty);
        });
        it('does nothing if not member of a party', function () {
            createParty(leader, [createClient(9)]);
            client.offline = true;
            partyService.clientDisconnected(client);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('promotes new leader after timeout', function () {
            createParty(leader, [client, createClient(9)]);
            var promoteLeader = sinon_1.stub(partyService, 'promoteLeader');
            leader.offline = true;
            partyService.clientDisconnected(leader);
            clock.tick(party_1.LEADER_TIMEOUT + 100);
            sinon_1.assert.calledWith(promoteLeader, leader, client);
        });
        it('does not promote offline player as the new leader', function () {
            var anotherClient = createClient(9);
            createParty(leader, [client, anotherClient]);
            var promoteLeader = sinon_1.stub(partyService, 'promoteLeader');
            leader.offline = true;
            client.offline = true;
            partyService.clientDisconnected(leader);
            clock.tick(party_1.LEADER_TIMEOUT + 100);
            sinon_1.assert.calledWith(promoteLeader, leader, anotherClient);
        });
        it('removes client if pending', function () {
            var party = createParty(leader, [createClient(9)], [client]);
            client.offline = true;
            partyService.clientDisconnected(client);
            chai_1.expect(party.pending).empty;
        });
        it('sends party update (pending)', function () {
            createParty(leader, [createClient(9)], [client]);
            client.offline = true;
            partyService.clientDisconnected(client);
            sinon_1.assert.calledOnce(leaderUpdateParty);
        });
        it('disbands party if cant find new leader after timeout', function () {
            var party = createParty(leader, [], [client, createClient(9)]);
            leader.offline = true;
            partyService.clientDisconnected(leader);
            clock.tick(party_1.LEADER_TIMEOUT + 100);
            chai_1.expect(partyService.parties).not.include(party);
        });
    });
    describe('invite()', function () {
        it('creates new party on the leader if none exists', function () {
            partyService.invite(leader, client);
            chai_1.expect(leader.party).not.empty;
            chai_1.expect(leader.party.leader).equal(leader);
            chai_1.expect(leader.party.clients).eql([leader]);
            chai_1.expect(leader.party.pending).eql([{ client: client, notificationId: 1 }]);
            chai_1.expect(partyService.parties).contain(leader.party);
        });
        it('adds client to pending members', function () {
            partyService.invite(leader, client);
            chai_1.expect(leader.party.pending[0].client).equal(client);
        });
        it('logs party invitation', function () {
            var systemLog = sinon_1.stub(leader.reporter, 'systemLog');
            partyService.invite(leader, client);
            sinon_1.assert.calledWith(systemLog, 'Invite to party [barbar]');
        });
        it('sends invite notice the the client', function () {
            leader.pony.name = 'foo';
            partyService.invite(leader, client);
            sinon_1.assert.calledWith(addNotification, client, sinon_1.match({
                name: 'foo',
                entityId: leader.pony.id,
                message: '<div class="text-party"><b>Party invite</b></div><b>#NAME#</b> invited you to a party',
                flags: 8 /* Accept */ | 16 /* Reject */ | 64 /* Ignore */,
            }));
        });
        it('sends invite notice the the client (existing party)', function () {
            leader.party = createParty(leader, [createClient(3)]);
            partyService.invite(leader, client);
            sinon_1.assert.calledOnce(addNotification);
        });
        it('sends party update to the leader', function () {
            partyService.invite(leader, client);
            sinon_1.assert.calledWithMatch(leaderUpdateParty, [
                [1, 1 /* Leader */],
                [2, 2 /* Pending */],
            ]);
        });
        it('does nothing if already is in party and not a leader', function () {
            var someone = createClient(3);
            someone.party = createParty(leader, [someone]);
            partyService.invite(someone, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if client is already in a party', function () {
            client.party = createParty(client);
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if client is already pending', function () {
            leader.party = createParty(leader, [], [client]);
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if party is already at member limit', function () {
            leader.party = createParty(leader, lodash_1.range(0, constants_1.PARTY_LIMIT - 1).map(function (i) { return createClient(i + 10); }));
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if party is already at member limit (pending)', function () {
            leader.party = createParty(leader, [], lodash_1.range(0, constants_1.PARTY_LIMIT - 1).map(function (i) { return createClient(i + 10); }));
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if leader is ignored', function () {
            leader.party = createParty(leader, [createClient(9)], []);
            playerUtils_1.addIgnore(leader, client.accountId);
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if leader is timedout', function () {
            leader.account.mute = Date.now() + constants_1.HOUR;
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if leader is muted', function () {
            leader.account.mute = -1;
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if leader is shadowed', function () {
            leader.shadowed = true;
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if client is offline', function () {
            leader.party = createParty(leader, [createClient(9)], []);
            client.offline = true;
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if inviting self (client)', function () {
            partyService.invite(leader, leader);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if inviting self (account)', function () {
            client.accountId = leader.accountId;
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        function setupRejectLimit() {
            lodash_1.range(0, party_1.INVITE_REJECTED_LIMIT).forEach(function (i) {
                var c = createClient(10 + i);
                partyService.invite(leader, c);
                addNotification.firstCall.args[1].reject();
                addNotification.reset();
                addNotification.returns(1);
            });
        }
        it('does nothing if reached invite limit', function () {
            setupRejectLimit();
            addNotification.reset();
            addNotification.returns(1);
            leaderUpdateParty.reset();
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('reports if reached invite limit', function () {
            setupRejectLimit();
            sinon_1.assert.calledWith(reportInviteLimit, leader);
        });
        it('resets invite limit periodically', function () {
            setupRejectLimit();
            addNotification.reset();
            addNotification.returns(1);
            leaderUpdateParty.reset();
            clock.tick(party_1.INVITE_REJECTED_TIMEOUT * 2);
            partyService.invite(leader, client);
            sinon_1.assert.calledOnce(addNotification);
            sinon_1.assert.calledOnce(leaderUpdateParty);
        });
        it('does nothing if leader has party invites blocked', function () {
            leader.party = createParty(leader, [createClient(9)], []);
            leader.account.flags = 1 /* BlockPartyInvites */;
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if user ignores all party requests', function () {
            leader.party = createParty(leader, [createClient(9)], []);
            client.accountSettings = { ignorePartyInvites: true };
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if user already reached party request limit', function () {
            lodash_1.range(0, party_1.INVITE_LIMIT).forEach(function (i) { return partyService.invite(createClient(10 + i), client); });
            addNotification.reset();
            partyService.invite(leader, client);
            sinon_1.assert.notCalled(addNotification);
        });
        it('does nothing if add notification returns 0', function () {
            addNotification.returns(0);
            partyService.invite(leader, client);
            chai_1.expect(leader.party).undefined;
            sinon_1.assert.notCalled(leaderUpdateParty);
            sinon_1.assert.notCalled(clientUpdateParty);
        });
        it('does nothing for existing party if add notification returns 0', function () {
            var party = createParty(leader, [createClient(9)], []);
            leader.party = party;
            addNotification.returns(0);
            partyService.invite(leader, client);
            chai_1.expect(leader.party).equal(party);
            sinon_1.assert.notCalled(clientUpdateParty);
        });
        describe('notification.accept()', function () {
            function accept() {
                addNotification.firstCall.args[1].accept();
            }
            it('removes client from pending', function () {
                partyService.invite(leader, client);
                accept();
                chai_1.expect(leader.party.pending).empty;
            });
            it('removes notification', function () {
                var removeNotification = sinon_1.stub(notificationService, 'removeNotification');
                partyService.invite(leader, client);
                accept();
                sinon_1.assert.calledWith(removeNotification, client, 1);
            });
            it('adds client to clients', function () {
                partyService.invite(leader, client);
                accept();
                chai_1.expect(leader.party.clients).contain(client);
            });
            it('sets party for client', function () {
                partyService.invite(leader, client);
                accept();
                chai_1.expect(client.party).equal(leader.party);
            });
            it('sends party update', function () {
                partyService.invite(leader, client);
                leaderUpdateParty.reset();
                clientUpdateParty.reset();
                accept();
                sinon_1.assert.calledOnce(leaderUpdateParty);
                sinon_1.assert.calledOnce(clientUpdateParty);
            });
            it('logs accept', function () {
                var systemLog = sinon_1.stub(leader.reporter, 'systemLog');
                partyService.invite(leader, client);
                accept();
                sinon_1.assert.calledWith(systemLog, 'Invite accepted by [barbar]');
            });
            it('rejects all other party invites', function () {
                var leader2 = createClient(8);
                var leader3 = createClient(9);
                partyService.invite(leader, client);
                partyService.invite(leader2, client);
                partyService.invite(leader3, client);
                accept();
                chai_1.expect(leader2.party).undefined;
                chai_1.expect(leader3.party).undefined;
            });
            it('does nothing if not in pending', function () {
                createParty(leader, [createClient(9)]);
                partyService.invite(leader, client);
                partyService.remove(leader, client);
                leaderUpdateParty.reset();
                accept();
                sinon_1.assert.notCalled(leaderUpdateParty);
            });
            it('does nothing if party does not exist', function () {
                partyService.invite(leader, client);
                partyService.remove(leader, client);
                leaderUpdateParty.reset();
                accept();
                sinon_1.assert.notCalled(leaderUpdateParty);
            });
        });
        describe('notification.reject()', function () {
            function reject() {
                addNotification.firstCall.args[1].reject();
            }
            it('removes client from pending', function () {
                createParty(leader, [createClient(9)]);
                partyService.invite(leader, client);
                reject();
                chai_1.expect(leader.party.pending).empty;
            });
            it('removes notification', function () {
                var removeNotification = sinon_1.stub(notificationService, 'removeNotification');
                partyService.invite(leader, client);
                reject();
                sinon_1.assert.calledWith(removeNotification, client, 1);
            });
            it('sends party update', function () {
                createParty(leader, [createClient(9)]);
                partyService.invite(leader, client);
                leaderUpdateParty.reset();
                reject();
                sinon_1.assert.calledOnce(leaderUpdateParty);
            });
            it('logs rejection', function () {
                var systemLog = sinon_1.stub(leader.reporter, 'systemLog');
                partyService.invite(leader, client);
                reject();
                sinon_1.assert.calledWith(systemLog, 'Invite rejected by [barbar]');
            });
            it('disbands party if less than 2 users', function () {
                partyService.invite(leader, client);
                leaderUpdateParty.reset();
                reject();
                chai_1.expect(leader.party).undefined;
            });
            it('does nothing if client is not pending anymore', function () {
                createParty(leader, [createClient(9)]);
                partyService.invite(leader, client);
                partyService.remove(leader, client);
                leaderUpdateParty.reset();
                reject();
                sinon_1.assert.notCalled(leaderUpdateParty);
            });
        });
    });
    describe('remove()', function () {
        it('removes client from the party', function () {
            var party = createParty(leader, [client, createClient(3)]);
            client.party = party;
            partyService.remove(leader, client);
            chai_1.expect(party.clients).not.include(client);
        });
        it('removes party from the client', function () {
            var party = createParty(leader, [client, createClient(3)]);
            client.party = party;
            partyService.remove(leader, client);
            chai_1.expect(client.party).undefined;
        });
        it('removes pending client from the party', function () {
            var party = createParty(leader, [createClient(3)], [client]);
            client.party = party;
            partyService.remove(leader, client);
            chai_1.expect(party.pending).empty;
        });
        it('logs cancel if removed pending client', function () {
            var systemLog = sinon_1.stub(leader.reporter, 'systemLog');
            var party = createParty(leader, [createClient(3)], [client]);
            client.party = party;
            partyService.remove(leader, client);
            sinon_1.assert.calledWith(systemLog, 'Invite cancelled for [barbar]');
        });
        it('counts invite limit for cancels', function () {
            var party = createParty(leader, [createClient(3)], []);
            utils_1.times(party_1.INVITE_REJECTED_LIMIT, function () {
                client.party = party;
                party.pending.push({ client: client, notificationId: 0 });
                partyService.remove(leader, client);
            });
            sinon_1.assert.calledWith(reportInviteLimit, leader);
        });
        it('removes pending client notification', function () {
            var removeNotification = sinon_1.stub(notificationService, 'removeNotification');
            var party = createParty(leader, [createClient(3)], [client]);
            client.party = party;
            partyService.remove(leader, client);
            sinon_1.assert.calledWith(removeNotification, client, 5);
        });
        it('sends party update to all clients', function () {
            var party = createParty(leader, [client, createClient(3)]);
            client.party = party;
            partyService.remove(leader, client);
            sinon_1.assert.calledOnce(leaderUpdateParty);
        });
        it('sends party update to all clients (pending)', function () {
            var party = createParty(leader, [createClient(3)], [client]);
            client.party = party;
            partyService.remove(leader, client);
            sinon_1.assert.calledOnce(leaderUpdateParty);
        });
        it('sends undefined party update to the client', function () {
            var party = createParty(leader, [client, createClient(3)]);
            client.party = party;
            partyService.remove(leader, client);
            sinon_1.assert.calledWith(clientUpdateParty, undefined);
        });
        it('does nothing if given leader is not the leader of the party', function () {
            var party = createParty(leader, [client, createClient(3)]);
            client.party = party;
            partyService.remove(createClient(4), client);
            chai_1.expect(party.clients).include(client);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if given client is not in the party', function () {
            var party = createParty(leader, [createClient(3), createClient(4)]);
            partyService.remove(leader, client);
            chai_1.expect(party.clients).not.include(client);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('selects new party leader', function () {
            var party = createParty(leader, [client, createClient(3)]);
            partyService.remove(leader, leader);
            chai_1.expect(party.leader).equal(client);
        });
        it('disbands party if less than 2 members are left', function () {
            createParty(leader, [client]);
            partyService.remove(leader, client);
            chai_1.expect(leader.party).undefined;
            chai_1.expect(client.party).undefined;
        });
        it('disbands party if cannot find new leader', function () {
            var party = createParty(leader, [], [createClient(9), createClient(10)]);
            partyService.remove(leader, leader);
            chai_1.expect(partyService.parties).not.include(party);
        });
        it('disbands party and clear all its fields', function () {
            var party = createParty(leader, [client], []);
            partyService.remove(leader, leader);
            chai_1.expect(party.clients).empty;
            chai_1.expect(party.pending).empty;
        });
    });
    describe('leave()', function () {
        it('calls removeFromParty', function () {
            createParty(leader, [client]);
            var remove = sinon_1.stub(partyService, 'remove');
            partyService.leave(client);
            sinon_1.assert.calledWith(remove, leader, client);
        });
        it('does not call removeFromParty if not in party', function () {
            var remove = sinon_1.stub(partyService, 'remove');
            partyService.leave(client);
            sinon_1.assert.notCalled(remove);
        });
    });
    describe('promoteLeader()', function () {
        it('sets client as leader', function () {
            var party = createParty(leader, [client]);
            partyService.promoteLeader(leader, client);
            chai_1.expect(party.leader).equal(client);
        });
        it('sends party update', function () {
            createParty(leader, [client]);
            partyService.promoteLeader(leader, client);
            sinon_1.assert.calledWithMatch(leaderUpdateParty, [
                [1, 0 /* None */],
                [2, 1 /* Leader */],
            ]);
        });
        it('does nothing if client is already the leader', function () {
            createParty(leader, [client]);
            partyService.promoteLeader(leader, leader);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if client is offline', function () {
            createParty(leader, [client]);
            client.offline = true;
            partyService.promoteLeader(leader, client);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
        it('does nothing if leader is not in party', function () {
            createParty(createClient(9), [client]);
            partyService.promoteLeader(leader, client);
            sinon_1.assert.notCalled(clientUpdateParty);
        });
        it('does nothing if leader is not a leader', function () {
            createParty(createClient(9), [leader, client]);
            partyService.promoteLeader(leader, client);
            sinon_1.assert.notCalled(clientUpdateParty);
        });
        it('does nothing if client is not in party', function () {
            createParty(leader, [createClient(9)]);
            partyService.promoteLeader(leader, client);
            sinon_1.assert.notCalled(leaderUpdateParty);
        });
    });
});
//# sourceMappingURL=party.spec.js.map