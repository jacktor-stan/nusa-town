"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalAdminApi = void 0;
var InternalAdminApi = /** @class */ (function () {
    function InternalAdminApi(adminService, endPoints) {
        this.adminService = adminService;
        this.endPoints = endPoints;
    }
    InternalAdminApi.prototype.removedDocument = function (model, id) {
        if (model in this.endPoints) {
            this.endPoints[model].removedItem(id);
        }
        this.adminService.removedItem(model, id);
        return Promise.resolve();
    };
    return InternalAdminApi;
}());
exports.InternalAdminApi = InternalAdminApi;
//# sourceMappingURL=internal-admin.js.map