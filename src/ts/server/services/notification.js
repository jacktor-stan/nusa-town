"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
var utils_1 = require("../../common/utils");
var NOTIFICATION_LIMIT = 10;
function getId(notifications) {
    for (var id = 1; id <= 0xffff; id++) {
        if (!utils_1.findById(notifications, id)) {
            return id;
        }
    }
    /* istanbul ignore next */
    throw new Error('Unable to get unique id for notification');
}
function hasNotification(client, notification) {
    return client.notifications.some(function (n) {
        return n.message === notification.message &&
            n.flags === notification.flags &&
            n.note === notification.note &&
            n.sender === notification.sender &&
            n.entityId === notification.entityId;
    });
}
var NotificationService = /** @class */ (function () {
    function NotificationService() {
    }
    NotificationService.prototype.addNotification = function (client, notification) {
        if (client.notifications.length >= NOTIFICATION_LIMIT || hasNotification(client, notification)) {
            return 0;
        }
        else {
            notification.id = getId(client.notifications);
            client.notifications.push(notification);
            var id = notification.id, _a = notification.entityId, entityId = _a === void 0 ? 0 : _a, name_1 = notification.name, message = notification.message, _b = notification.note, note = _b === void 0 ? '' : _b, _c = notification.flags, flags = _c === void 0 ? 0 : _c;
            client.addNotification(id, entityId, name_1, message, note, flags);
            return notification.id;
        }
    };
    NotificationService.prototype.removeNotification = function (client, id) {
        if (utils_1.removeById(client.notifications, id)) {
            client.removeNotification(id);
            return true;
        }
        else {
            return false;
        }
    };
    NotificationService.prototype.acceptNotification = function (client, id) {
        var notification = utils_1.findById(client.notifications, id);
        this.removeNotification(client, id);
        if (notification && notification.accept) {
            notification.accept();
        }
    };
    NotificationService.prototype.rejectNotification = function (client, id) {
        var notification = utils_1.findById(client.notifications, id);
        this.removeNotification(client, id);
        if (notification && notification.reject) {
            notification.reject();
        }
    };
    NotificationService.prototype.rejectAll = function (client) {
        var _this = this;
        client.notifications.slice()
            .forEach(function (n) { return _this.rejectNotification(client, n.id); });
    };
    NotificationService.prototype.dismissAll = function (client) {
        while (client.notifications.length) {
            this.removeNotification(client, client.notifications[0].id);
        }
    };
    return NotificationService;
}());
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.js.map