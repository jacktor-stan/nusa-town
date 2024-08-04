"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inMemoryStaticFiles = exports.wrapApi = exports.wrap = exports.handleJSON = exports.initLogRequest = exports.handleError = exports.limit = exports.admin = exports.auth = exports.internal = exports.offline = exports.hash = exports.blockMaps = exports.validAccount = exports.notFound = void 0;
var fs = require("fs");
var path = require("path");
var moment = require("moment");
var ExpressBrute = require("express-brute");
var lodash_1 = require("lodash");
var hash_1 = require("../generated/hash");
var accountUtils_1 = require("../common/accountUtils");
var errors_1 = require("../common/errors");
var logger_1 = require("./logger");
var reporter_1 = require("./reporter");
var userError_1 = require("./userError");
var originUtils_1 = require("./originUtils");
var ROLLBAR_IP = '35.184.69.251';
var notFound = function (_, res) {
    res.setHeader('Cache-Control', 'public, max-age=0');
    res.sendStatus(404);
};
exports.notFound = notFound;
var validAccount = function (server) { return function (req, res, next) {
    var account = req.user;
    var accountId = req.body.accountId;
    var accountName = req.body.accountName;
    if (!account || account.id !== accountId) {
        if (!/#$/.test(accountId)) {
            reporter_1.createFromRequest(server, req).warn(errors_1.ACCOUNT_ERROR, accountName + " [" + accountId + "] (" + req.path + ")");
        }
        //logger.warn(ACCOUNT_ERROR, `${accountName} [${accountId}] (${req.path})`);
        res.status(403).json({ error: errors_1.ACCOUNT_ERROR });
    }
    else {
        next(null);
    }
}; };
exports.validAccount = validAccount;
var blockMaps = function (debug, local) { return function (req, res, next) {
    if (!debug && !local && /\.map$/.test(req.path) && originUtils_1.getIP(req) !== ROLLBAR_IP) {
        res.sendStatus(404);
    }
    else {
        next(null);
    }
}; };
exports.blockMaps = blockMaps;
var hash = function (req, res, next) {
    var apiVersion = req.get('api-version');
    if (apiVersion !== hash_1.HASH) {
        res.status(400).json({ error: errors_1.VERSION_ERROR });
    }
    else {
        next(null);
    }
};
exports.hash = hash;
var offline = function (settings) { return function (_req, res, next) {
    if (settings.isPageOffline) {
        res.status(503).send(errors_1.OFFLINE_ERROR);
    }
    else {
        next(null);
    }
}; };
exports.offline = offline;
var internal = function (config, server) { return function (req, res, next) {
    if (req.get('api-token') === config.token) {
        next(null);
    }
    else {
        reporter_1.createFromRequest(server, req).warn('Unauthorized internal api call', req.originalUrl);
        res.sendStatus(403);
    }
}; };
exports.internal = internal;
var auth = function (req, res, next) {
    if (req.isAuthenticated()) {
        next(null);
    }
    else {
        //createFromRequest(req).warn('Unauthorized access', req.originalUrl);
        res.setHeader('X-Robots-Tag', 'noindex');
        res.sendStatus(403);
    }
};
exports.auth = auth;
var admin = function (server) { return function (req, res, next) {
    if (req.isAuthenticated() && req.user && accountUtils_1.isAdmin(req.user)) {
        next(null);
    }
    else {
        if (!/Googlebot/.test(req.get('User-Agent'))) {
            reporter_1.createFromRequest(server, req).warn("Unauthorized access (admin)", req.originalUrl);
        }
        res.setHeader('X-Robots-Tag', 'noindex, nofollow');
        res.sendStatus(403);
    }
}; };
exports.admin = admin;
var store = new ExpressBrute.MemoryStore();
function limit(freeRetries, lifetime) {
    var options = {
        freeRetries: freeRetries,
        lifetime: lifetime,
        failCallback: function (req, res, _next, nextValidRequestDate) {
            logger_1.logger.warn("rate limit " + req.url + " " + req.ip);
            res.status(429).send("Too many requests, please try again " + moment(nextValidRequestDate).fromNow());
        }
    };
    return (new ExpressBrute(store, options)).prevent;
}
exports.limit = limit;
function reportError(e, server, req) {
    reporter_1.createFromRequest(server, req).danger("Req error: " + e.message, req.method.toUpperCase() + " " + req.originalUrl);
    logger_1.logger.error(e);
}
function handleError(server, req, res) {
    return function (e) {
        if (userError_1.isUserError(e)) {
            userError_1.reportUserError(e, server, req);
            res.status(422).json({ error: e.message, userError: true });
        }
        else {
            reportError(e, server, req);
            res.status(500).json({ error: 'Error occurred' });
        }
    };
}
exports.handleError = handleError;
var logRequest = lodash_1.noop;
function initLogRequest(func) {
    logRequest = func;
}
exports.initLogRequest = initLogRequest;
function handleJSON(server, req, res, result) {
    Promise.resolve(result)
        .then(function (result) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
        res.json(result);
        return result;
    })
        .then(function (result) { return logRequest(req, result); })
        .catch(handleError(server, req, res));
}
exports.handleJSON = handleJSON;
function wrap(server, handle) {
    return function (req, res) { return handleJSON(server, req, res, handle(req)); };
}
exports.wrap = wrap;
function wrapApi(server, api) {
    return wrap(server, function (_a) {
        var _b = _a.body, method = _b.method, _c = _b.args, args = _c === void 0 ? [] : _c;
        if (api[method]) {
            return api[method].apply(api, args);
        }
        else {
            return Promise.reject(new Error("Invalid method (" + method + ")"));
        }
    });
}
exports.wrapApi = wrapApi;
function readFiles(files, dir, url) {
    var mimeTypes = {
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
    };
    for (var _i = 0, _a = fs.readdirSync(dir); _i < _a.length; _i++) {
        var file = _a[_i];
        var filePath = path.join(dir, file);
        var stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            readFiles(files, filePath, url + "/" + file);
        }
        else {
            var ext = path.extname(file);
            var mimeType = mimeTypes[ext];
            if (mimeType) {
                var buffer = fs.readFileSync(filePath);
                files.set(url + "/" + file, { mimeType: mimeType, buffer: buffer });
            }
        }
    }
}
function inMemoryStaticFiles(assetsPath, assetsUrl, maxAge) {
    var staticFiles = new Map();
    var cacheControl = "public, max-age=" + Math.floor(maxAge / 1000);
    readFiles(staticFiles, assetsPath, assetsUrl);
    return function (req, res, next) {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return next();
        }
        var staticFile = staticFiles.get(req.path);
        if (!staticFile) {
            return next();
        }
        try {
            res.setHeader('Content-Type', staticFile.mimeType);
            res.setHeader('Cache-Control', cacheControl);
            res.status(200).end(staticFile.buffer);
        }
        catch (e) {
            next(e);
        }
    };
}
exports.inMemoryStaticFiles = inMemoryStaticFiles;
//# sourceMappingURL=requestUtils.js.map