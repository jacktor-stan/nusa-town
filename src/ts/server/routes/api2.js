"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var requestUtils_1 = require("../requestUtils");
var internal_1 = require("../internal");
var config_1 = require("../config");
var serverUtils_1 = require("../serverUtils");
var constants_1 = require("../../common/constants");
function isServerSafe(server) {
    return server.state.alert !== '18+';
}
function toServerState(server) {
    var _a = server.state, name = _a.name, path = _a.path, desc = _a.desc, flag = _a.flag, alert = _a.alert, online = _a.online, settings = _a.settings, require = _a.require, host = _a.host;
    return {
        id: server.id,
        name: name,
        path: path,
        desc: desc,
        host: host,
        flag: flag,
        alert: alert,
        dead: false,
        online: online,
        offline: serverUtils_1.isServerOffline(server),
        filter: !!settings.filterSwears,
        require: require,
    };
}
function toServerStateShort(server) {
    return {
        id: server.id,
        online: server.state.online,
        offline: serverUtils_1.isServerOffline(server),
    };
}
function getGameStatus(servers, live, short, age) {
    var adult = age >= constants_1.MIN_ADULT_AGE;
    return {
        version: config_1.version,
        update: live.updating ? true : undefined,
        servers: servers
            .filter(function (s) { return isServerSafe(s) || adult; })
            .map(short ? toServerStateShort : toServerState),
    };
}
function default_1(settings, live, statsTracker) {
    var app = express_1.Router();
    app.get('/game/status', requestUtils_1.offline(settings), function (req, res) {
        var status = getGameStatus(internal_1.servers, live, req.query.short === 'true', req.query.d | 0);
        res.json(status);
        statsTracker.logRequest(req, status);
    });
    app.post('/csp', requestUtils_1.offline(settings), function (_, res) {
        //logger.warn('CSP report', getIPFromRequest(req), req.body['csp-report']);
        res.sendStatus(200);
    });
    return app;
}
exports.default = default_1;
//# sourceMappingURL=api2.js.map