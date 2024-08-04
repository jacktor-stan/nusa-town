"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIndex = void 0;
var fs = require("fs");
var path = require("path");
var pug_1 = require("pug");
var ag_sockets_1 = require("ag-sockets");
var oauth_1 = require("../oauth");
var config_1 = require("../config");
var logger_1 = require("../logger");
var paths_1 = require("../paths");
var binaryUtils_1 = require("../../common/binaryUtils");
function getFiles(urlBase, dir, sub) {
    try {
        return fs.readdirSync(path.join(dir, sub))
            .filter(function (file) { return /\.(js|css|png)$/.test(file); })
            .map(function (file) { return ({
            name: file.replace(/-[a-f0-9]{10}\.(js|css|png)$/, '.$1'),
            path: path.join(dir, sub, file),
            url: urlBase + "/" + sub + "/" + file,
        }); });
    }
    catch (_a) {
        return [];
    }
}
function createIndex(assetsPath, adminAssetsPath) {
    function toOAuthProvider(_a) {
        var id = _a.id, name = _a.name, color = _a.color, auth = _a.auth, connectOnly = _a.connectOnly;
        return { id: id, name: name, color: color, disabled: auth ? undefined : true, connectOnly: connectOnly };
    }
    var revServer = new Map();
    __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], getFiles('assets', assetsPath, 'styles')), getFiles('assets', assetsPath, 'scripts')), getFiles('assets', assetsPath, 'images')), getFiles('assets-admin', adminAssetsPath, 'styles')), getFiles('assets-admin', adminAssetsPath, 'scripts')).forEach(function (file) { return revServer.set(file.name, file); });
    function revUrlGetter(dir) {
        return function (name) {
            var file = revServer.get(name);
            return file && file.url || "assets/" + dir + "/" + name;
        };
    }
    function getRevPath(name) {
        return (revServer.get(name) && revServer.get(name).path) || path.join(assetsPath, name);
    }
    var getRevScriptURL = revUrlGetter('scripts');
    var getRevStyleURL = revUrlGetter('styles');
    var getRevImageURL = revUrlGetter('images');
    var template = pug_1.compileFile(paths_1.pathTo('views', 'index.pug'));
    var inlineStyle = fs.readFileSync(getRevPath('style-inline.css'), 'utf8');
    var loadingImage = fs.readFileSync(getRevPath('logo-64.png'));
    var oauthProviders = oauth_1.providers.map(toOAuthProvider);
    function encodeSocketOptions(options) {
        if (options) {
            var data = binaryUtils_1.writeBinary(function (writer) { return ag_sockets_1.writeObject(writer, options); });
            var buffer = Buffer.from(data);
            return buffer.toString('base64');
        }
        else {
            return '';
        }
    }
    function renderPage(_a) {
        var isPublic = _a.isPublic, style = _a.style, script = _a.script, scriptES = _a.scriptES, production = _a.production, noindex = _a.noindex, base = _a.base, socketOptions = _a.socketOptions, token = _a.token, local = _a.local;
        return template({
            doctype: 'html',
            host: config_1.config.host,
            title: config_1.config.title,
            twitterLink: config_1.config.twitterLink,
            discordLink: config_1.config.discordLink,
            email: config_1.config.contactEmail,
            contactDiscord: config_1.config.contactDiscord,
            logo: "" + config_1.config.host + getRevImageURL('logo-120.png'),
            loadingImage: "data:image/png;base64," + loadingImage.toString('base64'),
            version: config_1.version,
            description: config_1.description,
            base: base,
            token: token,
            sw: config_1.config.sw ? 'true' : undefined,
            noindex: noindex || config_1.config.noindex,
            production: production,
            local: local ? 'true' : undefined,
            socketOptions: encodeSocketOptions(socketOptions),
            inlineStyle: inlineStyle,
            style: style,
            script: script,
            scriptES: scriptES,
            oauthProviders: oauthProviders,
            facebookAppId: config_1.config.facebookAppId,
            isPublic: isPublic ? 'true' : undefined,
        });
    }
    function admin(production, base, assetsBase, scriptName, socket) {
        var socketOptions = socket.options();
        var style = assetsBase + "/" + getRevStyleURL('style-admin.css');
        var script = assetsBase + "/" + getRevScriptURL(scriptName);
        var scriptES = script;
        return function (req, res) {
            try {
                var token = socket.token({ account: req.user });
                res.send(renderPage({ production: production, base: base, style: style, script: script, scriptES: scriptES, noindex: true, socketOptions: socketOptions, token: token }));
            }
            catch (e) {
                logger_1.logger.error(e);
                res.sendStatus(500);
            }
        };
    }
    function user(production, base, styleName, scriptName, scriptESName, socketOptions, noindex, local, isPublic) {
        var style = "/" + getRevStyleURL(styleName);
        var script = "/" + getRevScriptURL(scriptName);
        var scriptES = "/" + getRevScriptURL(scriptESName);
        var sprites1 = DEVELOPMENT ? "/assets/images/pony.png" : "/" + getRevImageURL('pony.png');
        var sprites2 = DEVELOPMENT ? "/assets/images/pony2.png" : "/" + getRevImageURL('pony2.png');
        var page = renderPage({ isPublic: isPublic, production: production, base: base, style: style, script: script, scriptES: scriptES, socketOptions: socketOptions, noindex: noindex, local: local });
        var preload = [
            "<" + script + ">; rel=preload; as=script",
            "<" + style + ">; rel=preload; as=style",
            "<" + sprites1 + ">; rel=preload; as=fetch; crossorigin",
            "<" + sprites2 + ">; rel=preload; as=fetch; crossorigin",
        ];
        return { page: page, preload: preload };
    }
    return { admin: admin, user: user, getRevScript: getRevScriptURL, getRevStyle: getRevStyleURL };
}
exports.createIndex = createIndex;
//# sourceMappingURL=index.js.map