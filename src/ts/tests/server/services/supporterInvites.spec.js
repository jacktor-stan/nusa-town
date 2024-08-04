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
var lib_1 = require("../../lib");
var sinon_1 = require("sinon");
var chai_1 = require("chai");
var supporterInvites_1 = require("../../../server/services/supporterInvites");
var notification_1 = require("../../../server/services/notification");
var mocks_1 = require("../../mocks");
var playerUtils_1 = require("../../../server/playerUtils");
var constants_1 = require("../../../common/constants");
function exec(value) {
    return { exec: sinon_1.stub().resolves(value) };
}
describe('SupporterInvitesService', function () {
    var model;
    var notifications = lib_1.stubClass(notification_1.NotificationService);
    var log;
    var service;
    beforeEach(function () {
        lib_1.resetStubMethods(notifications, 'addNotification');
        model = {
            find: sinon_1.stub(),
            countDocuments: sinon_1.stub(),
            create: sinon_1.stub(),
            deleteOne: sinon_1.stub(),
            deleteMany: sinon_1.stub(),
            updateMany: sinon_1.stub(),
        };
        log = sinon_1.stub();
        service = new supporterInvites_1.SupporterInvitesService(model, notifications, log);
    });
    afterEach(function () {
        service.dispose();
    });
    describe('getInvites()', function () {
        it('returns all invites from given client', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = mocks_1.mockClient();
                        model.find.withArgs({ source: client.account._id }).returns({
                            exec: sinon_1.stub().resolves([
                                { _id: 'foo', name: 'Foo', info: 'info', active: true, anotherField: 'xyz' },
                            ])
                        });
                        return [4 /*yield*/, service.getInvites(client)];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).eql([
                            { id: 'foo', name: 'Foo', info: 'info', active: true },
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('isInvited()', function () {
        it('returns true if has any active invites', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = mocks_1.mockClient();
                        model.countDocuments.withArgs({ target: client.account._id, active: true }).returns(exec(1));
                        return [4 /*yield*/, service.isInvited(client)];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).true;
                        return [2 /*return*/];
                }
            });
        }); });
        it('returns false if doesn not have any active invites', function () { return __awaiter(void 0, void 0, void 0, function () {
            var client, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        client = mocks_1.mockClient();
                        model.countDocuments.withArgs({ target: client.account._id, active: true }).returns(exec(0));
                        return [4 /*yield*/, service.isInvited(client)];
                    case 1:
                        result = _a.sent();
                        chai_1.expect(result).false;
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('requestInvite()', function () {
        var requester;
        var target;
        beforeEach(function () {
            requester = mocks_1.mockClient();
            requester.account.supporter = 1 /* Supporter1 */;
            target = mocks_1.mockClient();
            model.find.returns(exec([]));
        });
        it('adds notification', function () { return __awaiter(void 0, void 0, void 0, function () {
            var notification;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requester.pony.name = 'Foo';
                        return [4 /*yield*/, service.requestInvite(requester, target)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWith(notifications.addNotification, target, sinon_1.match.any);
                        notification = notifications.addNotification.args[0][1];
                        chai_1.expect(notification.sender).equal(requester);
                        chai_1.expect(notification.entityId).equal(requester.pony.id);
                        chai_1.expect(notification.message).equal("<b>#NAME#</b> invited you to supporter servers");
                        return [2 /*return*/];
                }
            });
        }); });
        it('fails if inviting self', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, service.requestInvite(requester, requester)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(notifications.addNotification);
                        chai_1.expect(requester.saysQueue).eql([
                            [requester.pony.id, 'Cannot invite', 1 /* System */],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('fails if requester is shadowed', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requester.shadowed = true;
                        return [4 /*yield*/, service.requestInvite(requester, target)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(notifications.addNotification);
                        chai_1.expect(requester.saysQueue).eql([
                            [requester.pony.id, 'Cannot invite', 1 /* System */],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('fails if requester is muted', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requester.account.mute = Date.now() + 10000;
                        return [4 /*yield*/, service.requestInvite(requester, target)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(notifications.addNotification);
                        chai_1.expect(requester.saysQueue).eql([
                            [requester.pony.id, 'Cannot invite', 1 /* System */],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('fails if target is offline', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        target.offline = true;
                        return [4 /*yield*/, service.requestInvite(requester, target)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(notifications.addNotification);
                        chai_1.expect(requester.saysQueue).eql([
                            [requester.pony.id, 'Cannot invite', 1 /* System */],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('fails if target ignores requester', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerUtils_1.addIgnore(requester, target.accountId);
                        return [4 /*yield*/, service.requestInvite(requester, target)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(notifications.addNotification);
                        chai_1.expect(requester.saysQueue).eql([
                            [requester.pony.id, 'Cannot invite', 1 /* System */],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('fails if requester ignores target', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        playerUtils_1.addIgnore(target, requester.accountId);
                        return [4 /*yield*/, service.requestInvite(requester, target)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(notifications.addNotification);
                        chai_1.expect(requester.saysQueue).eql([
                            [requester.pony.id, 'Cannot invite', 1 /* System */],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('fails if already reached invite limit', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        model.find.returns(exec([{ _id: 'foo' }]));
                        return [4 /*yield*/, service.requestInvite(requester, target)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(notifications.addNotification);
                        chai_1.expect(requester.saysQueue).eql([
                            [requester.pony.id, 'Invite limit reached', 1 /* System */],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('fails if exceeded reject limit', function () { return __awaiter(void 0, void 0, void 0, function () {
            var i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 5)) return [3 /*break*/, 4];
                        return [4 /*yield*/, service.requestInvite(requester, target)];
                    case 2:
                        _a.sent();
                        notifications.addNotification.args[i][1].reject();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        notifications.addNotification.reset();
                        return [4 /*yield*/, service.requestInvite(requester, target)];
                    case 5:
                        _a.sent();
                        sinon_1.assert.notCalled(notifications.addNotification);
                        chai_1.expect(requester.saysQueue).eql([
                            [requester.pony.id, 'Cannot invite', 1 /* System */],
                        ]);
                        return [2 /*return*/];
                }
            });
        }); });
        it('logs invite', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requester.character.name = 'Foo';
                        return [4 /*yield*/, service.requestInvite(requester, target)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledOnce(log);
                        return [2 /*return*/];
                }
            });
        }); });
        it('accepts invite when accept callback is invoked', function () { return __awaiter(void 0, void 0, void 0, function () {
            var acceptInvite, accept;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        acceptInvite = sinon_1.stub(service, 'acceptInvite');
                        return [4 /*yield*/, service.requestInvite(requester, target)];
                    case 1:
                        _a.sent();
                        accept = notifications.addNotification.args[0][1].accept;
                        accept();
                        sinon_1.assert.calledWith(acceptInvite, requester, target);
                        return [2 /*return*/];
                }
            });
        }); });
        it('rejects invite when reject callback is invoked', function () { return __awaiter(void 0, void 0, void 0, function () {
            var rejectInvite, reject;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rejectInvite = sinon_1.stub(service, 'rejectInvite');
                        return [4 /*yield*/, service.requestInvite(requester, target)];
                    case 1:
                        _a.sent();
                        reject = notifications.addNotification.args[0][1].reject;
                        reject();
                        sinon_1.assert.calledWith(rejectInvite, requester, target);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('acceptInvite()', function () {
        it('invites user', function () {
            var requester = mocks_1.mockClient();
            var target = mocks_1.mockClient();
            var invite = sinon_1.stub(service, 'invite');
            service.acceptInvite(requester, target);
            sinon_1.assert.calledOnce(invite);
        });
        it('logs accepted invite', function () {
            var requester = mocks_1.mockClient();
            var target = mocks_1.mockClient();
            sinon_1.stub(service, 'invite');
            service.acceptInvite(requester, target);
            sinon_1.assert.calledOnce(log);
        });
    });
    describe('rejectInvite()', function () {
        it('logs rejected invite', function () {
            var requester = mocks_1.mockClient();
            var target = mocks_1.mockClient();
            service.rejectInvite(requester, target);
            sinon_1.assert.calledOnce(log);
        });
    });
    describe('invite()', function () {
        it('creates new invite', function () { return __awaiter(void 0, void 0, void 0, function () {
            var requester, target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requester = mocks_1.mockClient();
                        requester.account.supporter = 1 /* Supporter1 */;
                        target = mocks_1.mockClient();
                        model.find.returns(exec([]));
                        return [4 /*yield*/, service.invite(requester, target)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWithMatch(model.create, {
                            source: requester.account._id,
                            target: target.account._id,
                            name: target.character.name,
                            info: target.character.info,
                            active: true,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it('throws if reached invite limit', function () { return __awaiter(void 0, void 0, void 0, function () {
            var requester, target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requester = mocks_1.mockClient();
                        requester.account.supporter = 1 /* Supporter1 */;
                        target = mocks_1.mockClient();
                        model.find.returns(exec([{}]));
                        return [4 /*yield*/, chai_1.expect(service.invite(requester, target)).rejectedWith()];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(model.create);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('uninvite()', function () {
        it('removes invite', function () { return __awaiter(void 0, void 0, void 0, function () {
            var requester;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        requester = mocks_1.mockClient();
                        model.deleteOne.returns({ exec: sinon_1.stub() });
                        return [4 /*yield*/, service.uninvite(requester, 'foobar')];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWithMatch(model.deleteOne, { _id: 'foobar', source: requester.account._id });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('updateSupporterInvites()', function () {
        var clock;
        beforeEach(function () {
            clock = sinon_1.useFakeTimers();
        });
        afterEach(function () {
            clock.restore();
        });
        it('activates inactive items', function () { return __awaiter(void 0, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = [
                            { _id: 'aaa', active: false, source: { supporter: 1 /* Supporter1 */ } },
                            { _id: 'bbb', active: true, source: { supporter: 1 /* Supporter1 */ } },
                        ];
                        model.find.withArgs({}, '_id active')
                            .returns({
                            populate: sinon_1.stub().withArgs('source', '_id supporter patreon roles')
                                .returns({ lean: sinon_1.stub().returns(exec(data)) })
                        });
                        model.deleteMany.returns({ exec: sinon_1.stub() });
                        model.updateMany.returns({ exec: sinon_1.stub() });
                        return [4 /*yield*/, supporterInvites_1.updateSupporterInvites(model)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWithMatch(model.updateMany, { _id: { $in: ['aaa'] } }, { active: true });
                        return [2 /*return*/];
                }
            });
        }); });
        it('deactivates active items', function () { return __awaiter(void 0, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = [
                            { _id: 'aaa', active: true, source: { supporter: 1 /* Supporter1 */ } },
                            { _id: 'bbb', active: true, source: {} },
                        ];
                        model.find.returns({ populate: sinon_1.stub().returns({ lean: sinon_1.stub().returns(exec(data)) }) });
                        model.deleteMany.returns({ exec: sinon_1.stub() });
                        model.updateMany.returns({ exec: sinon_1.stub() });
                        return [4 /*yield*/, supporterInvites_1.updateSupporterInvites(model)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWithMatch(model.updateMany, { _id: { $in: ['bbb'] } }, { active: false });
                        return [2 /*return*/];
                }
            });
        }); });
        it('activates and deactivates items', function () { return __awaiter(void 0, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = [
                            { _id: 'aaa', active: false, source: { supporter: 1 /* Supporter1 */ } },
                            { _id: 'bbb', active: true, source: {} },
                        ];
                        model.find.returns({ populate: sinon_1.stub().returns({ lean: sinon_1.stub().returns(exec(data)) }) });
                        model.deleteMany.returns({ exec: sinon_1.stub() });
                        model.updateMany.returns({ exec: sinon_1.stub() });
                        return [4 /*yield*/, supporterInvites_1.updateSupporterInvites(model)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWithMatch(model.updateMany, { _id: { $in: ['aaa'] } }, { active: true });
                        sinon_1.assert.calledWithMatch(model.updateMany, { _id: { $in: ['bbb'] } }, { active: false });
                        return [2 /*return*/];
                }
            });
        }); });
        it('does nothing if all items have correct active flag', function () { return __awaiter(void 0, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = [
                            { _id: 'aaa', active: true, source: { supporter: 1 /* Supporter1 */ } },
                            { _id: 'bbb', active: false, source: {} },
                        ];
                        model.find.returns({ populate: sinon_1.stub().returns({ lean: sinon_1.stub().returns(exec(data)) }) });
                        model.deleteMany.returns({ exec: sinon_1.stub() });
                        model.updateMany.returns({ exec: sinon_1.stub() });
                        return [4 /*yield*/, supporterInvites_1.updateSupporterInvites(model)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.notCalled(model.updateMany);
                        return [2 /*return*/];
                }
            });
        }); });
        it('removes old inactive entries', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        model.find.returns({ populate: sinon_1.stub().returns({ lean: sinon_1.stub().returns({ exec: sinon_1.stub() }) }) });
                        model.deleteMany.returns({ exec: sinon_1.stub() });
                        clock.setSystemTime(123 * constants_1.DAY);
                        return [4 /*yield*/, supporterInvites_1.updateSupporterInvites(model)];
                    case 1:
                        _a.sent();
                        sinon_1.assert.calledWithMatch(model.deleteMany, { active: false, updatedAt: { $lt: new Date(23 * constants_1.DAY) } });
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=supporterInvites.spec.js.map