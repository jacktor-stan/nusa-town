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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./boot");
var fs = require("fs");
var Bluebird = require("bluebird");
var mongoose = require("mongoose");
var http = require("http");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var expressSession = require("express-session");
var serveFavicon = require("serve-favicon");
var Rollbar = require("rollbar");
var passport = require("passport");
var connectMongo = require("connect-mongo");
var express = require("express");
// import { WebSocketServer } from '@clusterws/cws';
var clusterws_uws_1 = require("clusterws-uws");
var lodash_1 = require("lodash");
var fs_extra_1 = require("fs-extra");
var ag_sockets_1 = require("ag-sockets");
var config_1 = require("./config");
var constants_1 = require("../common/constants");
var rollbar_1 = require("../common/rollbar");
var adminUtils_1 = require("../common/adminUtils");
var utils_1 = require("../common/utils");
var hash_1 = require("../generated/hash");
var clientActions_1 = require("../client/clientActions");
var clientAdminActions_1 = require("../client/clientAdminActions");
var serverActions_1 = require("./serverActions");
var adminServerActions_1 = require("./adminServerActions");
var db_1 = require("./db");
var logger_1 = require("./logger");
var settings_1 = require("./settings");
var socketErrorHandler_1 = require("./utils/socketErrorHandler");
var serverUtils_1 = require("./serverUtils");
var requestUtils_1 = require("./requestUtils");
var stats_1 = require("./stats");
var start_1 = require("./start");
var serverActionsManager_1 = require("./serverActionsManager");
var internal_1 = require("./internal");
var polling_1 = require("./polling");
var paths_1 = require("./paths");
var liveSettings_1 = require("./liveSettings");
var index_1 = require("./routes/index");
var auth_1 = require("./routes/auth");
var api_1 = require("./routes/api");
var api1_1 = require("./routes/api1");
var api2_1 = require("./routes/api2");
var api_tools_1 = require("./routes/api-tools");
var internal_2 = require("./api/internal");
var internal_login_1 = require("./api/internal-login");
var admin_accounts_1 = require("./api/admin-accounts");
var internal_admin_1 = require("./api/internal-admin");
var adminService_1 = require("./services/adminService");
var admin_1 = require("./api/admin");
function getServiceWorker() {
    try {
        return fs.readFileSync(paths_1.pathTo('build', 'sw.min.js'));
    }
    catch (_a) {
        return '';
    }
}
mongoose.connect(config_1.config.db, {
    //reconnectTries: Number.MAX_VALUE,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
});
var MongoStore = connectMongo(expressSession);
var app = express();
var production = app.get('env') === 'production';
var maxAge = production ? constants_1.YEAR : 0;
var etag = false;
var limit = !production || config_1.args.tools ? '100mb' : '100kb';
Bluebird.config({ warnings: false, longStackTraces: !production });
var rollbar = config_1.config.rollbar && Rollbar.init({
    accessToken: config_1.config.rollbar.serverToken,
    environment: config_1.config.rollbar.environment,
    handleUncaughtExceptions: true,
    handleUnhandledRejections: true,
    captureUncaught: true,
    checkIgnore: rollbar_1.rollbarCheckIgnore,
});
var assetsPath = paths_1.pathTo('build', 'assets');
var adminAssetsPath = paths_1.pathTo('build', 'assets-admin');
fs_extra_1.ensureDirSync(paths_1.pathTo('build-copy'));
if (production && config_1.args.login) {
    var newAssetsPath = paths_1.pathTo('build-copy', 'assets');
    fs_extra_1.removeSync(newAssetsPath);
    fs_extra_1.copySync(assetsPath, newAssetsPath);
    assetsPath = newAssetsPath;
}
if (production && config_1.args.admin) {
    var newAssetsPath = paths_1.pathTo('build-copy', 'assets-admin');
    fs_extra_1.removeSync(newAssetsPath);
    fs_extra_1.copySync(adminAssetsPath, newAssetsPath);
    adminAssetsPath = newAssetsPath;
}
app.set('port', config_1.port);
app.set('views', paths_1.pathTo('views'));
app.set('view engine', 'pug');
app.set('view options', { doctype: 'html' });
app.set('x-powered-by', false);
app.set('etag', false);
if (config_1.config.proxy) {
    app.set('trust proxy', config_1.config.proxy);
}
if (production) {
    app.use(require('hsts')({ maxAge: maxAge }));
    app.use(require('frameguard')({ action: 'sameorigin' }));
    // app.use(require('shrink-ray-current')());
}
if (config_1.args.login || config_1.args.admin) {
    app.use(serveFavicon(paths_1.pathTo('favicons', 'favicon.ico')));
}
app.use(morgan('dev', { skip: function (_, res) { return res.statusCode < 500 || res.statusCode === 503; } }));
var serviceWorker = getServiceWorker();
if (serviceWorker) {
    app.get('/sw.js', function (_, res) {
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'public, max-age=0');
        res.send(serviceWorker);
    });
}
else {
    app.get('/sw.js', requestUtils_1.notFound);
}
if (config_1.args.login || config_1.args.admin) {
    if (production) {
        app.use(requestUtils_1.inMemoryStaticFiles(assetsPath, '/assets', maxAge));
    }
    app.use('/assets', requestUtils_1.blockMaps(DEVELOPMENT, !!config_1.args.local), express.static(assetsPath, { maxAge: maxAge, etag: etag }));
    app.use(express.static(paths_1.pathTo('public'), { maxAge: maxAge, etag: etag }));
    app.use(express.static(paths_1.pathTo('favicons'), { maxAge: maxAge, etag: etag }));
}
app.use(bodyParser.json({ type: ['json', 'application/csp-report'], limit: limit }));
app.use(bodyParser.urlencoded({ extended: true, limit: limit }));
app.use(require('cookie-parser')());
if (config_1.args.login || config_1.args.admin) {
    passport.serializeUser(function (account, done) { return done(null, account._id.toString()); });
    passport.deserializeUser(function (id, done) {
        return db_1.Account.findById(id, function (err, a) { return done(err, a && !adminUtils_1.isBanned(a) ? a : false); });
    });
}
var ignore = [
    'RangeNotSatisfiableError',
    'PreconditionFailedError',
];
app.use(function (err, req, res, next) {
    var ignored = err instanceof Error && utils_1.includes(ignore, err.name);
    return next(ignored ? null : err, req, res);
});
if (rollbar) {
    app.use(rollbar.errorHandler());
}
if (!production) {
    app.use('/assets-admin', express.static(paths_1.pathTo('assets')));
    app.use('/assets-admin', express.static(paths_1.pathTo('src')));
    app.use('/assets', express.static(paths_1.pathTo('assets')));
    app.use('/assets', express.static(paths_1.pathTo('src')));
    app.use(require('errorhandler')());
}
var httpServer = http.createServer(app);
var errorHandler = new socketErrorHandler_1.SocketErrorHandler(rollbar, config_1.server);
var createSession = function () { return expressSession({
    secret: config_1.config.secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: constants_1.WEEK * 2,
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
}); };
var statsPath = paths_1.pathTo('logs', "stats-" + config_1.server.id + ".csv");
var stats = new stats_1.StatsTracker(statsPath);
var sessionMiddlewares = lodash_1.once(function () { return [createSession(), passport.initialize(), passport.session()]; });
var adminMiddlewares = lodash_1.once(function () { return __spreadArray(__spreadArray([], sessionMiddlewares()), [requestUtils_1.admin(config_1.server)]); });
var socketOptionsBase = {
    ws: { Server: clusterws_uws_1.WebSocketServer },
    hash: hash_1.STAMP,
};
requestUtils_1.initLogRequest(stats.logRequest);
admin_accounts_1.initLogSwearingAndSpamming(stats.logSwearing, stats.logSpamming);
var host = ag_sockets_1.createServerHost(httpServer, {
    path: config_1.args.standaloneadmin && !config_1.args.game ? '/admin/ws-admin' : config_1.server.path,
    ws: { Server: clusterws_uws_1.WebSocketServer },
    perMessageDeflate: false,
    errorHandler: errorHandler,
});
var theWorld = undefined;
var sent = 0, received = 0;
var sentPackets = 0, receivedPackets = 0;
if (config_1.args.game) {
    var getSettings_1 = function () { return settings_1.settings.servers[config_1.server.id] || {}; };
    var _a = serverActionsManager_1.createServerActionsFactory(config_1.server, settings_1.settings, getSettings_1, {
        stats: function () {
            var result = { sent: sent, received: received, sentPackets: sentPackets, receivedPackets: receivedPackets };
            sent = 0;
            received = 0;
            sentPackets = 0;
            receivedPackets = 0;
            return result;
        }
    }), world = _a.world, createServerActions = _a.createServerActions, hiding = _a.hiding;
    var options = __assign(__assign({}, socketOptionsBase), { verifyClient: function () { return !getSettings_1().isServerOffline && !liveSettings_1.liveSettings.shutdown; }, forceBinary: true, onSend: function (packet) {
            sent += packet.binary ? packet.binary.byteLength : (packet.json ? packet.json.length : 0);
            sentPackets++;
            stats.logSendStats(packet);
        }, onRecv: function (packet) {
            received += packet.binary ? packet.binary.byteLength : (packet.json ? packet.json.length : 0);
            receivedPackets++;
            stats.logRecvStats(packet);
        } });
    var gameSocket = host.socket(serverActions_1.ServerActions, clientActions_1.ClientActions, createServerActions, options);
    var tokens = serverUtils_1.tokenService(gameSocket);
    start_1.start(world, config_1.server);
    internal_1.init(world, tokens);
    theWorld = world;
    var apiInternal = internal_2.createInternalApi(world, config_1.server, settings_1.reloadSettings, getSettings_1, tokens, hiding, stats, liveSettings_1.liveSettings);
    app.use('/api-internal', requestUtils_1.internal(config_1.config, config_1.server), requestUtils_1.wrapApi(config_1.server, apiInternal));
}
var endPoints = config_1.args.admin ? admin_1.createEndPoints() : undefined;
var adminService = config_1.args.admin ? new adminService_1.AdminService() : undefined;
var removedDocument = internal_1.createRemovedDocument(endPoints, adminService);
var index = index_1.createIndex(assetsPath, adminAssetsPath);
if (config_1.args.admin) {
    if (config_1.args.standaloneadmin) {
        app.use.apply(app, __spreadArray(__spreadArray(['/admin/assets-admin'], adminMiddlewares()), [express.static(adminAssetsPath, { maxAge: maxAge, etag: etag })]));
        app.get('/admin/assets-admin/*', function (_, res) { return res.sendStatus(404); });
        var adminApi = new internal_admin_1.InternalAdminApi(adminService, endPoints);
        app.use('/api-internal-admin', requestUtils_1.internal(config_1.config, config_1.server), requestUtils_1.wrapApi(config_1.server, adminApi));
    }
    var createClient = function (client) {
        return new adminServerActions_1.AdminServerActions(client, config_1.server, settings_1.settings, adminService, endPoints, removedDocument);
    };
    var base = '/admin';
    var assetsBase = config_1.args.standaloneadmin ? '/admin' : '';
    var adminSocket = host.socket(adminServerActions_1.AdminServerActions, clientAdminActions_1.ClientAdminActions, createClient, socketOptionsBase);
    var sendAdminPage = index.admin(production, base + "/", assetsBase, 'bootstrap-admin.js', adminSocket);
    app.get.apply(app, __spreadArray(__spreadArray(["" + base], adminMiddlewares()), [sendAdminPage]));
    app.get.apply(app, __spreadArray(__spreadArray([base + "/*"], adminMiddlewares()), [sendAdminPage]));
}
if (config_1.args.tools) {
    var toolsPage_1 = index.user(production, '/tools/', 'style-tools.css', 'bootstrap-tools.js', 'bootstrap-tools.js', undefined, true, !!config_1.args.local, false);
    app.get.apply(app, __spreadArray(__spreadArray(['/tools'], sessionMiddlewares()), [requestUtils_1.auth, function (_, res) { return res.send(toolsPage_1.page); }]));
    app.get.apply(app, __spreadArray(__spreadArray(['/tools/*'], sessionMiddlewares()), [requestUtils_1.auth, function (_, res) { return res.send(toolsPage_1.page); }]));
    app.use.apply(app, __spreadArray(__spreadArray(['/api-tools'], sessionMiddlewares()), [api_tools_1.default(config_1.server, settings_1.settings, theWorld)]));
    app.get('/api-tools/*', function (_, res) { return res.sendStatus(404); });
}
if (config_1.args.login) {
    var socketOptions = ag_sockets_1.createClientOptions(serverActions_1.ServerActions, clientActions_1.ClientActions, socketOptionsBase);
    var userPage_1 = index.user(production, '/', 'style.css', 'bootstrap.js', 'bootstrap-es.js', socketOptions, false, !!config_1.args.local, !production);
    var offlinePage_1 = fs.readFileSync(paths_1.pathTo('public', 'offline.html'), 'utf8');
    var script = "" + config_1.config.host + index.getRevScript('bootstrap.js');
    var scriptES = "" + config_1.config.host + index.getRevScript('bootstrap-es.js');
    var analytics = config_1.config.analytics ? 'https://www.google-analytics.com' : '';
    // const workbox = 'https://storage.googleapis.com/workbox-cdn';
    // const rollbarScripts =
    // rollbar ? 'https://d37gvrvc0wt4s1.cloudfront.net https://cdnjs.cloudflare.com/ajax/libs/rollbar.js/' : '';
    var csp_1 = "object-src 'none';"
        + "frame-src 'self';"
        + "frame-ancestors 'self';"
        + ("worker-src " + config_1.config.host + "sw.js;")
        + ("script-src 'unsafe-eval' " + script + " " + scriptES + " " + analytics + ";");
    var linkPreloads_1 = __spreadArray([], userPage_1.preload);
    app.use.apply(app, __spreadArray(__spreadArray(['/assets-admin'], adminMiddlewares()), [express.static(adminAssetsPath, { maxAge: maxAge, etag: etag })]));
    app.use.apply(app, __spreadArray(__spreadArray(['/auth'], sessionMiddlewares()), [auth_1.authRoutes(config_1.config.host, config_1.server, settings_1.settings, liveSettings_1.liveSettings, config_1.args.local || DEVELOPMENT, removedDocument)]));
    app.use.apply(app, __spreadArray(__spreadArray(['/api'], sessionMiddlewares()), [api_1.default(config_1.server, settings_1.settings, { version: config_1.version, host: config_1.config.host, debug: DEVELOPMENT, local: !!config_1.args.local }, removedDocument)]));
    app.use.apply(app, __spreadArray(__spreadArray(['/api1'], sessionMiddlewares()), [api1_1.default(config_1.server, settings_1.settings)]));
    app.use('/api2', api2_1.default(settings_1.settings, liveSettings_1.liveSettings, stats));
    var loginApi = internal_login_1.createInternalLoginApi(settings_1.settings, liveSettings_1.liveSettings, stats, settings_1.reloadSettings, removedDocument);
    app.use('/api-internal-login', requestUtils_1.internal(config_1.config, config_1.server), requestUtils_1.wrapApi(config_1.server, loginApi));
    app.get('/assets-admin/*', requestUtils_1.notFound);
    app.get('/assets/*', requestUtils_1.notFound);
    app.get('/auth/*', requestUtils_1.notFound);
    app.get('/api/*', requestUtils_1.notFound);
    app.get('/api1/*', requestUtils_1.notFound);
    app.get('/api2/*', requestUtils_1.notFound);
    app.get('/*', function (req, res) {
        if (settings_1.settings.isPageOffline) {
            res.send(offlinePage_1);
        }
        else {
            if (production && !config_1.args.local) {
                res.setHeader('Content-Security-Policy', csp_1);
                res.setHeader('Link', linkPreloads_1);
            }
            res.setHeader('Referrer-Policy', 'no-referrer');
            // res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.send(userPage_1.page);
            stats.logRequest(req, userPage_1.page, '/');
        }
    });
}
app.use(function (err, req, res, next) {
    if (err instanceof URIError) {
        res.redirect(config_1.config.host);
    }
    else {
        return next(err, req, res);
    }
});
settings_1.reloadSettings().then(function () {
    if (config_1.args.login || config_1.args.game) {
        stats.startStatTracking();
    }
    if (config_1.args.login || config_1.args.admin) {
        polling_1.pollServers();
    }
    if (config_1.args.admin && !config_1.args.nocleanup) {
        polling_1.startStrayAuthsCleanup(removedDocument);
        polling_1.startClearOldIgnores();
        polling_1.startMergesCleanup();
        polling_1.startBansCleanup();
        polling_1.startCollectingUsersVisitedCount();
        polling_1.startSupporterInvitesCleanup();
        polling_1.startPotentialDuplicatesCleanup(adminService);
        polling_1.startAccountAlertsCleanup();
        polling_1.startClearTo10Origns(adminService);
        polling_1.startClearVeryOldOrigns(adminService);
    }
    if (config_1.args.admin) {
        polling_1.pollDiskSpace();
        polling_1.pollMemoryUsage();
        polling_1.pollCertificateExpirationDate();
    }
    httpServer.listen(config_1.port, function () {
        var options = lodash_1.compact([
            app.get('env'),
            config_1.args.login && 'login',
            config_1.args.admin && 'admin',
            config_1.args.standaloneadmin && '(standaloneadmin)',
            config_1.args.tools && 'tools',
            config_1.args.game && "game:" + config_1.server.id,
        ]);
        logger_1.logger.info("Listening on port " + config_1.port + " (" + options.join(', ') + ")");
    });
});
//# sourceMappingURL=server.js.map