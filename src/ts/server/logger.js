"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat = exports.logPerformance = exports.logServer = exports.logPatreon = exports.admin = exports.system = exports.systemMessage = exports.formatMessage = exports.log = exports.logger = void 0;
var tracer_1 = require("tracer");
var chalk_1 = require("chalk");
var interfaces_1 = require("../common/interfaces");
var commands_1 = require("./commands");
var playerUtils_1 = require("./playerUtils");
var paths_1 = require("./paths");
var reset = chalk_1.default.reset, gray = chalk_1.default.gray, magenta = chalk_1.default.magenta, cyan = chalk_1.default.cyan, green = chalk_1.default.green, yellow = chalk_1.default.yellow, red = chalk_1.default.red;
function format(color) {
    //'[{{timestamp}}] [{{title}}] {{message}} ({{file}}:{{line}})',
    return [
        reset('['),
        gray('{{timestamp}}'),
        reset('] ['),
        color('{{title}}'),
        reset('] {{message}} '),
        gray('({{file}}:{{line}})'),
    ].join('');
}
exports.logger = tracer_1.console({
    level: 0,
    dateformat: 'mmm dd HH:MM:ss',
    format: [
        format(reset),
        {
            trace: format(cyan),
            debug: format(magenta),
            info: format(green),
            warn: format(yellow),
            error: format(red),
        }
    ],
});
var daily = tracer_1.dailyfile({
    root: paths_1.pathTo('logs'),
    maxLogFiles: 14,
    dateformat: 'HH:MM:ss',
    format: '{{timestamp}} {{message}}', // ({{file}}:{{line}})
});
function log(message) {
    daily.info(message);
}
exports.log = log;
function formatMessage(accountId, type, message) {
    return "[" + accountId + "]" + type + "\t" + message;
}
exports.formatMessage = formatMessage;
function systemMessage(accountId, message) {
    return formatMessage(accountId, '[system]', message);
}
exports.systemMessage = systemMessage;
function adminMessage(accountId, message) {
    return formatMessage(accountId, '[admin]', message);
}
function system(accountId, message) {
    log(systemMessage(accountId, message));
}
exports.system = system;
function admin(accountId, message) {
    log(adminMessage(accountId, message));
}
exports.admin = admin;
function logPatreon(message) {
    log(formatMessage('patreon', '', message));
}
exports.logPatreon = logPatreon;
function logServer(message) {
    log(formatMessage('server', '', message));
}
exports.logServer = logServer;
function logPerformance(message) {
    log(formatMessage('performance', '', message));
}
exports.logPerformance = logPerformance;
function chat(server, client, text, type, ignored, target) {
    var prefix = commands_1.getChatPrefix(type);
    var mod = '';
    if (ignored) {
        mod = '[ignored]';
    }
    else if (playerUtils_1.isMutedOrShadowed(client)) {
        mod = '[muted]';
    }
    else if (client.accountSettings.ignorePublicChat && interfaces_1.isPublicChat(type)) {
        mod = '[ignorepub]';
    }
    if (type === 9 /* Whisper */) {
        prefix += "[" + (target ? "" + target.accountId + (target.shadowed ? '][shadowed' : '') : 'undefined') + "] ";
    }
    var message = formatMessage(client.accountId, "[" + server.id + "][" + (client.map.id || 'main') + "][" + client.characterName + "]" + mod, "" + prefix + text);
    log(message);
}
exports.chat = chat;
//# sourceMappingURL=logger.js.map