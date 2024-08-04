"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var requestUtils_1 = require("../requestUtils");
var api_account_1 = require("./api-account");
var api_pony_1 = require("./api-pony");
var api_game_1 = require("./api-game");
function default_1(server, settings, config, removedDocument) {
    var app = express_1.Router();
    app.use(requestUtils_1.auth);
    app.use(api_account_1.default(server, settings));
    app.use(api_pony_1.default(server, settings, removedDocument));
    app.use(api_game_1.default(server, settings, config));
    return app;
}
exports.default = default_1;
//# sourceMappingURL=api.js.map