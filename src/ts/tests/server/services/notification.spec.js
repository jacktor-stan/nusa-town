"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../../lib");
var lodash_1 = require("lodash");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var notification_1 = require("../../../server/services/notification");
var utils_1 = require("../../../common/utils");
describe('NotificationService', function () {
    var notificationService;
    var client;
    function createClient() {
        return {
            notifications: [],
            addNotification: function () { },
            removeNotification: function () { },
        };
    }
    beforeEach(function () {
        notificationService = new notification_1.NotificationService();
        client = createClient();
    });
    after(function () {
        notificationService = undefined;
        client = undefined;
    });
    describe('addNotification()', function () {
        it('adds notification to client', function () {
            var notification = { id: 0, name: 'name', message: 'test' };
            notificationService.addNotification(client, notification);
            chai_1.expect(client.notifications).contain(notification);
        });
        it('returns new notification ID', function () {
            var notification = { id: 0, name: 'name', message: 'test' };
            chai_1.expect(notificationService.addNotification(client, notification)).equal(1);
        });
        it('assigns ID to notification', function () {
            var notification = { id: 0, name: 'name', message: 'test1' };
            client.notifications.push({ id: 1, name: 'name', message: 'test2' });
            notificationService.addNotification(client, notification);
            chai_1.expect(notification.id).not.equal(0);
        });
        it('sends addNotification', function () {
            var notification = { id: 0, name: 'name', message: 'test', note: 'note', flags: 123 };
            var addNotification = sinon_1.stub(client, 'addNotification');
            notificationService.addNotification(client, notification);
            sinon_1.assert.calledWith(addNotification, 1, 0, 'name', 'test', 'note', 123);
        });
        it('does not add notification to client if limit is reached', function () {
            utils_1.times(10, function () { return notificationService.addNotification(client, { id: 0, name: 'name', message: lodash_1.uniqueId('test') }); });
            var addNotification = sinon_1.stub(client, 'addNotification');
            chai_1.expect(notificationService.addNotification(client, { id: 0, name: 'name', message: lodash_1.uniqueId('test') })).equal(0);
            sinon_1.assert.notCalled(addNotification);
        });
        it('does not add notification to client if identical notification already exists', function () {
            var addNotification = sinon_1.stub(client, 'addNotification');
            chai_1.expect(notificationService.addNotification(client, { id: 0, name: 'name', message: 'foo' })).not.equal(0);
            chai_1.expect(notificationService.addNotification(client, { id: 0, name: 'name', message: 'foo' })).equal(0);
            chai_1.expect(client.notifications.length).equal(1);
            sinon_1.assert.calledOnce(addNotification);
        });
    });
    describe('removeNotification()', function () {
        it('removes notification from client', function () {
            var notification = { id: 1, name: 'name', message: 'test' };
            client.notifications.push(notification);
            notificationService.removeNotification(client, 1);
            chai_1.expect(client.notifications).not.contain(notification);
        });
        it('does nothing if notification does not exist', function () {
            var removeNotification = sinon_1.stub(client, 'removeNotification');
            notificationService.removeNotification(client, 1);
            sinon_1.assert.notCalled(removeNotification);
        });
        it('sends removeNotification', function () {
            client.notifications.push({ id: 1, name: 'name', message: 'test' });
            var removeNotification = sinon_1.stub(client, 'removeNotification');
            notificationService.removeNotification(client, 1);
            sinon_1.assert.calledWith(removeNotification, 1);
        });
        it('returns true if notification is removed', function () {
            client.notifications.push({ id: 1, name: 'name', message: 'test' });
            chai_1.expect(notificationService.removeNotification(client, 1)).true;
        });
        it('returns false if notification does not exist', function () {
            chai_1.expect(notificationService.removeNotification(client, 1)).false;
        });
    });
    describe('acceptNotification()', function () {
        it('calls accept callback', function () {
            var accept = sinon_1.spy();
            notificationService.addNotification(client, { id: 0, name: 'name', message: 'test', accept: accept });
            notificationService.acceptNotification(client, 1);
            sinon_1.assert.calledOnce(accept);
        });
        it('removes notification', function () {
            notificationService.addNotification(client, { id: 0, name: 'name', message: 'test', accept: function () { } });
            var removeNotification = sinon_1.stub(notificationService, 'removeNotification');
            notificationService.acceptNotification(client, 1);
            sinon_1.assert.calledWith(removeNotification, client, 1);
        });
        it('does nothing if notification does not exist', function () {
            var removeNotification = sinon_1.stub(client, 'removeNotification');
            notificationService.acceptNotification(client, 1);
            sinon_1.assert.notCalled(removeNotification);
        });
        it('works if notification does not have accept callback', function () {
            var notification = { id: 0, name: 'name', message: 'test' };
            notificationService.addNotification(client, notification);
            notificationService.acceptNotification(client, 1);
            chai_1.expect(client.notifications).not.include(notification);
        });
    });
    describe('rejectNotification()', function () {
        it('calls reject callback', function () {
            var reject = sinon_1.spy();
            notificationService.addNotification(client, { id: 0, name: 'name', message: 'test', reject: reject });
            notificationService.rejectNotification(client, 1);
            sinon_1.assert.calledOnce(reject);
        });
        it('removes notification', function () {
            notificationService.addNotification(client, { id: 0, name: 'name', message: 'test', accept: function () { } });
            var removeNotification = sinon_1.stub(notificationService, 'removeNotification');
            notificationService.rejectNotification(client, 1);
            sinon_1.assert.calledWith(removeNotification, client, 1);
        });
        it('does nothing if notification does not exist', function () {
            var removeNotification = sinon_1.stub(client, 'removeNotification');
            notificationService.rejectNotification(client, 1);
            sinon_1.assert.notCalled(removeNotification);
        });
        it('works if notification does not have reject callback', function () {
            var notification = { id: 0, name: 'name', message: 'test' };
            notificationService.addNotification(client, notification);
            notificationService.rejectNotification(client, 1);
            chai_1.expect(client.notifications).not.include(notification);
        });
    });
    describe('rejectAll()', function () {
        it('rejects all notifications', function () {
            client.notifications = [{ id: 1 }, { id: 2 }];
            var rejectNotification = sinon_1.stub(notificationService, 'rejectNotification');
            notificationService.rejectAll(client);
            sinon_1.assert.calledWith(rejectNotification, client, 1);
            sinon_1.assert.calledWith(rejectNotification, client, 2);
        });
    });
});
//# sourceMappingURL=notification.spec.js.map