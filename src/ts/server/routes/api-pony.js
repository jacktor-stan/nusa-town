"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var requestUtils_1 = require("../requestUtils");
var reporter_1 = require("../reporter");
var pony_1 = require("../api/pony");
var db_1 = require("../db");
var accountUtils_1 = require("../accountUtils");
var logger_1 = require("../logger");
var admin_1 = require("../api/admin");
var security_1 = require("../../common/security");
var characterUtils_1 = require("../characterUtils");
function default_1(server, settings, removedDocument) {
    var offline = requestUtils_1.offline(settings);
    var validAccount = requestUtils_1.validAccount(server);
    var app = express_1.Router();
    var isSuspiciousName = security_1.createIsSuspiciousName(settings);
    var isSuspiciousPony = security_1.createIsSuspiciousPony(settings);
    var savePonyHandler = pony_1.createSavePony(db_1.findCharacter, db_1.findAuth, db_1.characterCount, accountUtils_1.updateCharacterCount, db_1.createCharacter, logger_1.system, isSuspiciousName, isSuspiciousPony);
    var removePonyHandler = pony_1.createRemovePony(admin_1.kickFromAllServersByCharacter, db_1.removeCharacter, accountUtils_1.updateCharacterCount, function (id) { return removedDocument('ponies', id); }, characterUtils_1.logRemovedCharacter);
    app.post('/pony/save', offline, requestUtils_1.hash, validAccount, requestUtils_1.wrap(server, function (req) {
        return savePonyHandler(req.user, req.body.pony, reporter_1.createFromRequest(server, req));
    }));
    app.post('/pony/remove', offline, requestUtils_1.hash, validAccount, requestUtils_1.wrap(server, function (req) {
        return removePonyHandler(req.body.id, req.user.id);
    }));
    return app;
}
exports.default = default_1;
//# sourceMappingURL=api-pony.js.map