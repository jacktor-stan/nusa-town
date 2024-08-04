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
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var fs = require("fs");
var path = require("path");
var lodash_1 = require("lodash");
var stringUtils_1 = require("../../common/stringUtils");
var serverUtils_1 = require("../serverUtils");
var requestUtils_1 = require("../requestUtils");
var paths = require("../paths");
var db_1 = require("../db");
var account_1 = require("../api/account");
var utils_1 = require("../../common/utils");
var serverMap_1 = require("../serverMap");
function default_1(server, settings, world) {
    var offline = requestUtils_1.offline(settings);
    var app = express_1.Router();
    app.use(requestUtils_1.auth);
    app.get('/ponies', offline, function (req, res) {
        requestUtils_1.handleJSON(server, req, res, account_1.createGetAccountCharacters(db_1.findAllCharacters)(req.user));
    });
    app.get('/animation/:id', offline, function (req, res) {
        var filePath = path.join(paths.store, req.params.id);
        res.sendFile(filePath);
    });
    app.post('/animation', offline, function (req, res) {
        var name = stringUtils_1.randomString(10);
        var filePath = path.join(paths.store, name);
        fs.writeFileAsync(filePath, req.body.animation, 'utf8')
            .then(function () { return res.send({ name: name }); });
    });
    app.post('/animation-gif', offline, function (req, res) {
        var image = req.body.image;
        var width = req.body.width || 80;
        var height = req.body.height || 80;
        var fps = req.body.fps || 24;
        var remove = req.body.remove || 0;
        var name = stringUtils_1.randomString(10);
        var filePath = path.join(paths.store, name + '.png');
        var header = 'data:image/gif;base64,';
        var buffer = Buffer.from(image.substr(header.length), 'base64');
        var magick = /^win/.test(process.platform) ? 'magick' : 'convert';
        var command = magick + " -dispose Background -delay " + 100 / fps + " -loop 0 \"" + filePath + "\" -crop " + width + "x" + height + " "
            + ("+repage" + lodash_1.repeat(' +delete', remove) + " \"" + filePath.replace(/png$/, 'gif') + "\"");
        console.log('executing ' + command);
        fs.writeFileAsync(filePath, buffer)
            .then(function () { return serverUtils_1.execAsync(command); })
            .then(function () { return res.send({ name: name }); });
    });
    app.get('/maps', offline, function (_, res) {
        if (world) {
            res.json(world.maps.map(function (m) { return m.id; }));
        }
        else {
            res.sendStatus(400);
        }
    });
    app.get('/map', offline, function (req, res) {
        if (world) {
            var id_1 = req.query.map || '';
            var map = world.maps.find(function (m) { return m.id === id_1; });
            if (map) {
                var mapInfo = __assign(__assign({}, serverMap_1.serializeMap(map)), { defaultTile: map.defaultTile, type: map.type, info: {
                        season: world.season,
                        entities: utils_1.flatten(map.regions.map(function (r) { return r.entities; }))
                            .map(function (_a) {
                            var type = _a.type, x = _a.x, y = _a.y, order = _a.order, id = _a.id;
                            return ({ type: type, x: x, y: y, order: order, id: id });
                        }),
                    } });
                res.json(mapInfo);
                return;
            }
        }
        res.sendStatus(400);
    });
    return app;
}
exports.default = default_1;
//# sourceMappingURL=api-tools.js.map