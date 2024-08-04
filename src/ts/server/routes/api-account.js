"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var requestUtils_1 = require("../requestUtils");
var account_1 = require("../api/account");
var db_1 = require("../db");
var logger_1 = require("../logger");
function default_1(server, settings) {
    var validAccount = requestUtils_1.validAccount(server);
    var offline = requestUtils_1.offline(settings);
    var app = express_1.Router();
    var getAccountCharacters = account_1.createGetAccountCharacters(db_1.findAllCharacters);
    var updateAccount = account_1.createUpdateAccount(db_1.findAccountSafe, logger_1.system);
    var updateSettings = account_1.createUpdateSettings(db_1.findAccountSafe);
    var removeSite = account_1.createRemoveSite(db_1.findAuth, db_1.countAllVisibleAuths, logger_1.system);
    app.post('/account-characters', offline, requestUtils_1.hash, validAccount, requestUtils_1.limit(60, 60), requestUtils_1.wrap(server, function (req) {
        return getAccountCharacters(req.user);
    }));
    app.post('/account-update', offline, requestUtils_1.hash, validAccount, requestUtils_1.limit(60, 60), requestUtils_1.wrap(server, function (req) {
        return updateAccount(req.user, req.body.account);
    }));
    app.post('/account-settings', offline, requestUtils_1.hash, validAccount, requestUtils_1.limit(60, 60), requestUtils_1.wrap(server, function (req) {
        return updateSettings(req.user, req.body.settings);
    }));
    app.post('/remove-site', offline, requestUtils_1.hash, validAccount, requestUtils_1.limit(60, 60), requestUtils_1.wrap(server, function (req) {
        return removeSite(req.user, req.body.siteId);
    }));
    app.post('/remove-hide', offline, requestUtils_1.hash, validAccount, requestUtils_1.limit(60, 60), requestUtils_1.wrap(server, function (req) {
        return account_1.removeHide(req.user, req.body.hideId);
    }));
    app.post('/get-hides', offline, requestUtils_1.hash, validAccount, requestUtils_1.limit(60, 60), requestUtils_1.wrap(server, function (req) {
        return account_1.getHides(req.user, req.body.page || 0);
    }));
    app.post('/get-friends', offline, requestUtils_1.hash, validAccount, requestUtils_1.limit(120, 60), requestUtils_1.wrap(server, function (req) {
        return account_1.getFriends(req.user);
    }));
    return app;
}
exports.default = default_1;
//# sourceMappingURL=api-account.js.map