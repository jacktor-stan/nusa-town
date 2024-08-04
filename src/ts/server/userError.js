"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportUserError2 = exports.reportUserError = exports.isUserError = exports.UserError = void 0;
var logger_1 = require("./logger");
var reporter_1 = require("./reporter");
var UserError = /** @class */ (function (_super) {
    __extends(UserError, _super);
    //static name: string;
    function UserError(message, info, userInfo) {
        var _this = _super.call(this, message) || this;
        _this.message = message;
        _this.info = info;
        _this.userInfo = userInfo;
        Object.defineProperty(_this, 'name', { value: 'UserError' });
        Error.captureStackTrace(_this, UserError);
        return _this;
    }
    return UserError;
}(Error));
exports.UserError = UserError;
function isUserError(e) {
    return e.name === 'UserError';
}
exports.isUserError = isUserError;
function report(message, info, reporter, extra) {
    if (extra === void 0) { extra = ''; }
    var keys = Object.keys(info);
    if (keys.length === 1 && keys[0] === 'log') {
        logger_1.logger.log(info.log);
    }
    else {
        if (reporter) {
            reporter.warn((info.error && info.error.message) || info.message || message || '<no message>', info.desc);
        }
        logger_1.logger.warn(info.error || info.message || message || '<no message>', info.desc || '', info.data || '', extra);
    }
}
function reportUserError(e, server, req) {
    if (e.info) {
        report(e.message, e.info, reporter_1.createFromRequest(server, req), req.url + " " + req.ip);
    }
}
exports.reportUserError = reportUserError;
function reportUserError2(e, client) {
    if (e.info) {
        report(e.message, e.info, client && client.reporter);
    }
}
exports.reportUserError2 = reportUserError2;
//# sourceMappingURL=userError.js.map