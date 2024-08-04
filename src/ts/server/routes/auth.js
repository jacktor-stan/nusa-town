"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.authRoutes = void 0;
var express_1 = require("express");
var passport_1 = require("passport");
var passport_local_1 = require("passport-local");
var lodash_1 = require("lodash");
var constants_1 = require("../../common/constants");
var utils_1 = require("../../common/utils");
var db_1 = require("../db");
var requestUtils_1 = require("../requestUtils");
var accountUtils_1 = require("../accountUtils");
var reporter_1 = require("../reporter");
var logger_1 = require("../logger");
var oauth_1 = require("../oauth");
var internal_1 = require("../internal");
var userError_1 = require("../userError");
var admin_1 = require("../api/admin");
var security_1 = require("../../common/security");
var adminUtils_1 = require("../../common/adminUtils");
var merge_1 = require("../api/merge");
var authUtils_1 = require("../authUtils");
var originUtils_1 = require("../originUtils");
var FRESH_ACCOUNT_TIME = 1 * constants_1.MINUTE;
var mergeRequests = [];
/* tslint:disable */
var ignoreErrors = [
    'Service unavailable',
    'Internal error',
    'User denied your request',
    'Code was already redeemed.',
    'Code is invalid or expired.',
    'This authorization code has expired.',
    'This authorization code has been used.',
    'Failed to fetch user profile',
    'Failed to obtain access token',
    'Failed to find request token in session',
    'User authorization failed: user is deactivated.',
    'User authorization failed: user revoke access for this token.',
    'Backend Error',
    'TokenError',
    'Bad Request',
    'Rate limit exceeded',
    "Sorry, this feature isn't available right now: An error occurred while processing this request. Please try again later.",
    'Przepraszamy, ta funkcja nie jest obecnie dostępna: Podczas przetwarzania żądania wystąpił błąd. Spróbuj ponownie później.',
    'К сожалению, эта функция сейчас не доступна: Во время обработки запроса возникла ошибка. Пожалуйста, попробуйте еще раз позже',
    'К сожалению, эта функция сейчас не доступна: Во время обработки запроса возникла ошибка. Пожалуйста, попробуйте еще раз позже.',
    'Desculpe, esse recurso não está disponível no momento: Ocorreu um erro ao processar essa solicitação. Tente novamente mais tarde.',
    'Esta aplicación no está disponible: La aplicación que intentas usar ya no está disponible o tiene el acceso restringido.',
    'Xin lỗi, tính năng này không khả dụng ngay bây giờ: Đã xảy ra lỗi khi xử lý yêu cầu này. Vui lòng thử lại sau.',
    'Lo sentimos, esta función no está disponible ahora: Ocurrió un error mientras se procesaba la solicitud. Vuelve a intentarlo más tarde.',
    "The access token is invalid since the user hasn't engaged the app in longer than 90 days.",
    "Application Unavailable: The application you're trying to use is either no longer available or access is restricted.",
    'An unexpected error has occurred. Please retry your request later.',
    'Code was invalid or expired. ',
    'Internal server error: could not check access_token now, check later.',
    'failed to fetch user profile',
    'Failed to obtain request token',
    'User canceled the Dialog flow',
    'Internal Error',
    'Bad Authentication data.',
    'Diese Function ist vorübergehend nicht verfügbar',
    'Diese Funktion ist vorübergehend nicht verfügbar',
    'User authorization failed: no access_token passed.',
    'Ungültiges Anfrage-Token.',
    'Invalid Credentials',
    'Invalid code.',
    'Internal server error: Database problems, try later',
    'An invalid Platform session was found.: An invalid Platform session was found.',
    "Cannot read property 'id' of undefined",
    'User Rate Limit Exceeded. Rate of requests for user exceed configured project quota. You may consider re-evaluating expected per-user traffic to the API and adjust project quota limits accordingly. You may monitor aggregate quota usage and adjust limits in the API Console: https://console.developers.google.com/apis/api/plus.googleapis.com/quotas?project=200390553857',
];
function kickCurrentUser(req) {
    var user = req.user;
    if (user) {
        admin_1.kickFromAllServers(user.id)
            .catch(function (e) { return logger_1.logger.error(e); });
    }
}
function logIn(req, account) {
    return new Promise(function (resolve, reject) {
        kickCurrentUser(req);
        req.logIn(account, function (e) { return e ? reject(e) : resolve(); });
    });
}
function isMerge(accountId) {
    var minTime = utils_1.fromNow(-10 * constants_1.MINUTE).getTime();
    lodash_1.remove(mergeRequests, function (r) { return r.time < minTime; });
    return mergeRequests.some(function (r) { return r.accountId === accountId; });
}
function getIP(req) {
    return req.ip || req.ips[0];
}
function reportError(server, message, e, req) {
    reporter_1.createFromRequest(server, req).danger(message, e.toString());
    logger_1.logger.error(message, e);
}
function fixTwitterErrorMessage(message) {
    return /^<!DOCTYPE html>/.test(message) ? 'Service unavailable' : message;
}
function checkBanField(server, account, field, message, origin) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(adminUtils_1.isActive(origin[field]) && !adminUtils_1.isActive(account[field]))) return [3 /*break*/, 2];
                    reporter_1.create(server, account._id, undefined, origin).warn(message);
                    account[field] = origin[field];
                    return [4 /*yield*/, account.save()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function loginUser(server, req, res, account) {
    return __awaiter(this, void 0, void 0, function () {
        var origin, isFresh;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, db_1.Origin.findOne({ ip: getIP(req) }).exec()];
                case 1:
                    origin = _a.sent();
                    return [4 /*yield*/, originUtils_1.addOrigin(account, originUtils_1.getOrigin(req))];
                case 2:
                    _a.sent();
                    if (!origin) return [3 /*break*/, 6];
                    return [4 /*yield*/, checkBanField(server, account, 'mute', 'Muted account by origin', origin)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, checkBanField(server, account, 'shadow', 'Shadowed account by origin', origin)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, checkBanField(server, account, 'ban', 'Banned account by origin', origin)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6:
                    if (adminUtils_1.isBanned(account)) {
                        // const message = isTemporarilyBanned(account) ? `Account locked()` : 'Account locked';
                        throw new userError_1.UserError('Account locked', undefined, accountUtils_1.getAccountAlertMessage(account));
                    }
                    return [4 /*yield*/, logIn(req, account)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, internal_1.accountChanged(account._id.toString())];
                case 8:
                    _a.sent();
                    isFresh = account.createdAt && account.createdAt.getTime() > utils_1.fromNow(-FRESH_ACCOUNT_TIME).getTime();
                    res.redirect(isFresh ? '/account' : '/');
                    return [2 /*return*/];
            }
        });
    });
}
function mergeUser(req, res, account, removedDocument) {
    return __awaiter(this, void 0, void 0, function () {
        var user, userId, accountId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = req.user;
                    userId = user._id.toString();
                    accountId = account._id.toString();
                    lodash_1.remove(mergeRequests, function (r) { return r.accountId === userId; });
                    if (!(userId !== accountId)) return [3 /*break*/, 2];
                    return [4 /*yield*/, merge_1.mergeAccounts(userId, accountId, 'by user', removedDocument, false)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    res.redirect('/account?merged=true');
                    return [2 /*return*/];
            }
        });
    });
}
function handleErrorAndRedirect(server, url, message, e, req, res) {
    if (userError_1.isUserError(e)) {
        userError_1.reportUserError(e, server, req);
        url += "?error=" + encodeURIComponent(e.message);
        if (e.userInfo) {
            url += "&alert=" + encodeURIComponent(e.userInfo);
        }
    }
    else {
        reportError(server, "Auth error: " + message, e, req);
        url += "?error=" + encodeURIComponent(message);
    }
    res.redirect(url);
}
function handleAuth(server, live, removedDocument, req, res, error, account) {
    return __awaiter(this, void 0, void 0, function () {
        var user, merge, message, ignore, e_1, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    user = req.user;
                    merge = isMerge(user && user.id);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (error) {
                        if (userError_1.isUserError(error)) {
                            throw error;
                        }
                        message = fixTwitterErrorMessage(error.message);
                        ignore = utils_1.includes(ignoreErrors, message);
                        throw new userError_1.UserError(message, ignore ? undefined : { error: error, desc: "url: " + req.path });
                    }
                    if (!account) {
                        throw new userError_1.UserError('No account');
                    }
                    if (!(merge && !utils_1.hasFlag(account.flags, 16 /* BlockMerging */))) return [3 /*break*/, 3];
                    if (live.shutdown) {
                        throw new Error("Cannot merge while server is shutdown");
                    }
                    return [4 /*yield*/, mergeUser(req, res, account, removedDocument)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, loginUser(server, req, res, account)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    e_1 = _a.sent();
                    message = merge ? 'Account merge error' : 'Authentication error';
                    handleErrorAndRedirect(server, merge ? '/account' : '/', message, e_1, req, res);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function createHandler(server, live, id, options, removedDocument) {
    return function (req, res, next) {
        var handler = passport_1.authenticate(id, options, function (error, account) {
            return handleAuth(server, live, removedDocument, req, res, error, account);
        });
        return handler(req, res, next);
    };
}
function authRoutes(host, server, settings, live, mockLogin, removedDocument) {
    var failureRedirect = "/?error=" + encodeURIComponent('Authentication failed');
    var app = express_1.Router();
    var checkers = {
        isSuspiciousName: security_1.createIsSuspiciousName(settings),
        isSuspiciousAuth: security_1.createIsSuspiciousAuth(settings),
    };
    oauth_1.providers.filter(function (p) { return !!p.auth; }).forEach(function (_a) {
        var id = _a.id, strategy = _a.strategy, auth = _a.auth, connectOnly = _a.connectOnly, _b = _a.additionalOptions, additionalOptions = _b === void 0 ? {} : _b;
        var callbackURL = host + "auth/" + id + "/callback";
        var scope = id === 'patreon' ? ['users'] : id === 'discord' ? ['identify', 'email'] : ['email'];
        var options = __assign(__assign(__assign({}, additionalOptions), auth), { callbackURL: callbackURL, includeEmail: true, profileFields: ['id', 'displayName', 'name', 'emails'], passReqToCallback: true });
        function signInOrSignUp(req, profile) {
            return __awaiter(this, void 0, void 0, function () {
                var user, userId, mergeAccount, createAccountOptions, auth, account, ip, userAgent;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            user = req.user;
                            userId = user && user._id.toString();
                            mergeAccount = (userId && isMerge(userId)) ? userId : undefined;
                            createAccountOptions = createOptions(req, !!connectOnly, server, settings, checkers);
                            return [4 /*yield*/, authUtils_1.findOrCreateAuth(profile, mergeAccount, createAccountOptions)];
                        case 1:
                            auth = _a.sent();
                            return [4 /*yield*/, accountUtils_1.findOrCreateAccount(auth, profile, createAccountOptions)];
                        case 2:
                            account = _a.sent();
                            ip = createAccountOptions.ip, userAgent = createAccountOptions.userAgent;
                            logger_1.system(account._id, "signed-in with \"" + auth.name + "\" [" + auth._id + "] [" + ip + "] [" + userAgent + "]");
                            return [2 /*return*/, account];
                    }
                });
            });
        }
        passport_1.use(id, new strategy(options, function (req, _accessToken, _refreshToken, oauthProfile, callback) {
            var profile = oauth_1.getProfile(id, oauthProfile);
            signInOrSignUp(req, profile)
                .then(function (account) {
                callback(null, account);
            })
                .catch(function (error) {
                logger_1.logServer("failed to sign-in " + JSON.stringify(profile));
                callback(error, null);
            });
        }));
        app.get("/" + id, requestUtils_1.limit(120, 3600), createHandler(server, live, id, { scope: scope, failureRedirect: failureRedirect }, removedDocument));
        app.get("/" + id + "/callback", requestUtils_1.limit(120, 3600), createHandler(server, live, id, { failureRedirect: failureRedirect }, removedDocument));
        app.get("/" + id + "/merge", requestUtils_1.limit(120, 3600), requestUtils_1.auth, function (req, res) {
            var accountId = req.user._id.toString();
            mergeRequests.push({ accountId: accountId, time: Date.now() });
            res.redirect("/auth/" + id);
        });
    });
    app.post('/sign-out', requestUtils_1.wrap(server, function (req) {
        kickCurrentUser(req);
        req.logout();
        return { success: true };
    }));
    if (mockLogin) {
        passport_1.use(new passport_local_1.Strategy(function (login, _pass, done) { return db_1.Account.findById(login, done); }));
        app.get('/local', passport_1.authenticate('local', { successRedirect: '/', failureRedirect: '/failed-login' }));
    }
    return app;
}
exports.authRoutes = authRoutes;
function createOptions(req, connectOnly, server, settings, checkers) {
    var acl = req.cookies && req.cookies.acl;
    var origin = originUtils_1.getOriginFromHTTP(req);
    return __assign({ ip: getIP(req), userAgent: req.get('User-Agent'), browserId: req.get('Api-Bid'), connectOnly: !!connectOnly, creationLocked: acl && acl > (new Date()).toISOString(), canCreateAccounts: !!settings.canCreateAccounts, reportPotentialDuplicates: !!settings.reportPotentialDuplicates, warn: function (accountId, message, desc) { return reporter_1.create(server, accountId, undefined, origin).warn(message, desc); } }, checkers);
}
//# sourceMappingURL=auth.js.map