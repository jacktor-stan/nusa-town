"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sayWhisperTest = exports.sayToPartyTest = exports.sayToClientTest = exports.sayToOthers = exports.sayToEveryone = exports.sayToAll = exports.saySystem = exports.sayTo = exports.createSay = exports.filterUrls = void 0;
var lodash_1 = require("lodash");
var security_1 = require("../common/security");
var interfaces_1 = require("../common/interfaces");
var filterUtils_1 = require("../common/filterUtils");
var expressionUtils_1 = require("../common/expressionUtils");
var swears_1 = require("../common/swears");
var clientUtils_1 = require("../client/clientUtils");
var commands_1 = require("./commands");
var playerUtils_1 = require("./playerUtils");
var friends_1 = require("./services/friends");
var utils_1 = require("../common/utils");
var camera_1 = require("../common/camera");
var constants_1 = require("../common/constants");
function isLaugh(message) {
    return /(^| )(ha(ha)+|he(he)+|ja(ja)+|ха(ха)+|lol|rofl|wk(wk)+|awok(awok)+)$/i.test(message);
}
function isIP(match) {
    var parts = match.split(/\./g);
    return !parts.some(function (p) { return /^0\d+$/.test(p); }) && parts.map(function (x) { return parseInt(x, 10); }).every(function (x) { return x >= 0 && x <= 255; });
}
function replaceIP(match) {
    return isIP(match) ? '[LINK]' : match;
}
var urlRegexes = filterUtils_1.urlRegexTexts.map(function (text) { return new RegExp(text, 'uig'); });
var ipRegex = new RegExp(filterUtils_1.ipRegexText, 'uig');
function replaceLink(value) {
    return filterUtils_1.urlExceptionRegex.test(value) ? value : '[LINK]';
}
function filterUrls(message) {
    message = message.replace(ipRegex, replaceIP);
    for (var _i = 0, urlRegexes_1 = urlRegexes; _i < urlRegexes_1.length; _i++) {
        var regex = urlRegexes_1[_i];
        message = message.replace(regex, replaceLink);
    }
    return message;
}
exports.filterUrls = filterUrls;
// non-party messages
function getMessageType(client, type) {
    switch (type) {
        case 0 /* Say */:
        case 1 /* Party */:
            return 0 /* Chat */;
        case 4 /* Supporter */:
            switch (client.supporterLevel) {
                case 1: return 9 /* Supporter1 */;
                case 2: return 10 /* Supporter2 */;
                case 3: return 11 /* Supporter3 */;
                default: return 0 /* Chat */;
            }
        case 5 /* Supporter1 */:
            return client.supporterLevel >= 1 ? 9 /* Supporter1 */ : 0 /* Chat */;
        case 6 /* Supporter2 */:
            return client.supporterLevel >= 2 ? 10 /* Supporter2 */ : 0 /* Chat */;
        case 7 /* Supporter3 */:
            return client.supporterLevel >= 3 ? 11 /* Supporter3 */ : 0 /* Chat */;
        case 2 /* Think */:
        case 3 /* PartyThink */:
            return 5 /* Thinking */;
        case 8 /* Dismiss */:
            return 12 /* Dismiss */;
        case 9 /* Whisper */:
            return 13 /* Whisper */;
        default:
            return utils_1.invalidEnumReturn(type, 0 /* Chat */);
    }
}
var createSay = function (world, runCommand, log, checkSpam, reportSwears, reportForbidden, reportSuspicious, spamCommands, random, isSuspiciousMessage) {
    return function (client, text, chatType, target, settings) {
        text = clientUtils_1.cleanMessage(text);
        var _a = commands_1.parseCommand(text, chatType), command = _a.command, args = _a.args, type = _a.type;
        var whisper = type === 9 /* Whisper */;
        if (!command && !args)
            return;
        if (whisper && client === target)
            return;
        var forbidden = command == null && interfaces_1.isPublicChat(type) && security_1.isForbiddenMessage(args);
        log(client, text, type, forbidden, target);
        var suspicious = isSuspiciousMessage(args, settings);
        if (suspicious !== 0 /* No */) {
            reportSuspicious(client, "" + commands_1.getChatPrefix(type) + text, suspicious);
        }
        if (command != null) {
            if (runCommand(client, command, args, type, target, settings)) {
                if (type !== 1 /* Party */ && spamCommands.indexOf(command) !== -1) {
                    if (!client.map.instance) {
                        checkSpam(client, text, settings);
                    }
                }
            }
            else {
                var expression = expressionUtils_1.parseExpression(text.substr(1), true);
                if (expression) {
                    playerUtils_1.setEntityExpression(client.pony, expression);
                }
                else {
                    saySystem(client, 'Invalid command');
                }
            }
        }
        else {
            var message = args;
            var think = type === 2 /* Think */ || type === 3 /* PartyThink */;
            var expression = (think || whisper) ? undefined : expressionUtils_1.parseExpression(message);
            if (expression) {
                playerUtils_1.setEntityExpression(client.pony, expression);
            }
            else if (!whisper && isLaugh(message)) {
                playerUtils_1.execAction(client, 4 /* Laugh */, settings);
            }
            if (interfaces_1.isPartyChat(type)) {
                sayToParty(client, message, think ? 6 /* PartyThinking */ : 4 /* Party */);
            }
            else {
                var friendWhisper = whisper && target !== undefined && friends_1.isFriend(client, target);
                var messageNoLinks = filterUrls(message);
                var messageCensored = forbidden ? lodash_1.repeat('*', messageNoLinks.length) : swears_1.filterBadWords(messageNoLinks);
                var trimmedMessage = filterUtils_1.trimRepeatedLetters(messageNoLinks);
                var trimmedCensored = filterUtils_1.trimRepeatedLetters(messageCensored);
                var messageType = getMessageType(client, type);
                var swearing = messageNoLinks !== messageCensored;
                if (!friendWhisper) {
                    if (!client.map.instance) {
                        checkSpam(client, message, settings);
                    }
                    if (settings.filterSwears && swearing) {
                        reportSwears(client, message, settings);
                    }
                    if (forbidden) {
                        reportForbidden(client, message, settings);
                    }
                }
                if (!friendWhisper && swearing && settings.kickSwearing && random() < 0.75) {
                    if (settings.kickSwearingToSpawn) {
                        world.resetToSpawn(client);
                    }
                    world.kick(client, 'swearing', 1 /* Swearing */);
                }
                else if (!friendWhisper && forbidden) {
                    sayTo(client, client.pony, trimmedMessage, messageType);
                }
                else if (whisper) {
                    sayWhisper(client, trimmedMessage, trimmedCensored, messageType, target, settings);
                }
                else {
                    sayToEveryone(client, trimmedMessage, trimmedCensored, messageType, settings);
                }
            }
        }
    };
};
exports.createSay = createSay;
function sayTo(client, _a, message, type) {
    var id = _a.id;
    client.saysQueue.push([id, message, type]);
}
exports.sayTo = sayTo;
function saySystem(client, message) {
    sayTo(client, client.pony, message, 1 /* System */);
}
exports.saySystem = saySystem;
function sayToClient(client, entity, message, censoredMessage, type, settings) {
    if (client.pony !== entity && !interfaces_1.isWhisperTo(type)) {
        var swear = !!settings.hideSwearing && message !== censoredMessage;
        if (interfaces_1.isPublicMessage(type)) {
            if (swear) {
                return false;
            }
            if (!camera_1.isWorldPointWithPaddingVisible(client.camera, entity, constants_1.tileWidth * 2)) {
                return false;
            }
        }
        if (entity.client) {
            if (playerUtils_1.isIgnored(client, entity.client)) {
                return false;
            }
            if (!client.isMod && playerUtils_1.isHiddenBy(client, entity.client)) {
                return false;
            }
            if (swear && !friends_1.isFriend(client, entity.client)) {
                return false;
            }
        }
        if (client.accountSettings.filterSwearWords || settings.filterSwears) {
            message = censoredMessage;
        }
    }
    sayTo(client, entity, message, type);
    return true;
}
function sayWhisper(client, message, censoredMessage, type, target, settings) {
    if (target === undefined || target.shadowed || playerUtils_1.isHiddenBy(client, target)) {
        saySystem(client, "Couldn't find this player");
    }
    else {
        var friend = friends_1.isFriend(client, target);
        if (!friend && client.accountSettings.ignoreNonFriendWhispers) {
            saySystem(client, "You can only whisper to friends");
        }
        else if (!friend && target.accountSettings.ignoreNonFriendWhispers) {
            saySystem(client, "Can't whisper to this player");
        }
        else {
            sayTo(client, target.pony, message, interfaces_1.toMessageType(type));
            if (!playerUtils_1.isMutedOrShadowed(client)) {
                sayToClient(target, client.pony, message, censoredMessage, type, settings);
            }
        }
    }
}
function sayToParty(client, message, type) {
    if (!client.party) {
        saySystem(client, "you're not in a party");
    }
    else if (playerUtils_1.isMutedOrShadowed(client)) {
        sayTo(client, client.pony, message, type);
    }
    else {
        for (var _i = 0, _a = client.party.clients; _i < _a.length; _i++) {
            var c = _a[_i];
            sayTo(c, client.pony, message, type);
        }
    }
}
function sayToAll(entity, message, censoredMessage, type, settings) {
    if (entity.region) {
        for (var _i = 0, _a = entity.region.clients; _i < _a.length; _i++) {
            var client = _a[_i];
            sayToClient(client, entity, message, censoredMessage, type, settings);
        }
    }
}
exports.sayToAll = sayToAll;
function sayToEveryone(client, message, censoredMessage, type, settings) {
    if (playerUtils_1.isMutedOrShadowed(client) ||
        client.accountSettings.ignorePublicChat) {
        sayTo(client, client.pony, message, type);
    }
    else {
        sayToAll(client.pony, message, censoredMessage, type, settings);
    }
}
exports.sayToEveryone = sayToEveryone;
function sayToOthers(client, message, type, target, settings) {
    if (interfaces_1.isWhisper(type)) {
        sayWhisper(client, message, message, type, target, settings);
    }
    else if (interfaces_1.isPartyMessage(type)) {
        sayToParty(client, message, type);
    }
    else {
        sayToEveryone(client, message, message, type, settings);
    }
}
exports.sayToOthers = sayToOthers;
exports.sayToClientTest = sayToClient;
exports.sayToPartyTest = sayToParty;
exports.sayWhisperTest = sayWhisper;
//# sourceMappingURL=chat.js.map