"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../lib");
var chai_1 = require("chai");
var accountUtils_1 = require("../../common/accountUtils");
var mocks_1 = require("../mocks");
describe('accountUtils [client]', function () {
    describe('isAdmin()', function () {
        it('returns true if target account has admin role', function () {
            chai_1.expect(accountUtils_1.isAdmin(mocks_1.account({ roles: ['admin'] }))).true;
        });
        it('returns true if target account has superadmin role', function () {
            chai_1.expect(accountUtils_1.isAdmin(mocks_1.account({ roles: ['superadmin'] }))).true;
        });
        it('returns false if target account has no roles', function () {
            chai_1.expect(accountUtils_1.isAdmin(mocks_1.account({}))).false;
        });
        it('returns false if target account has no admin or superadmin roles', function () {
            chai_1.expect(accountUtils_1.isAdmin(mocks_1.account({ roles: ['foo'] }))).false;
        });
    });
    describe('isMod()', function () {
        it('returns true if target account has mod role', function () {
            chai_1.expect(accountUtils_1.isMod(mocks_1.account({ roles: ['mod'] }))).true;
        });
        it('returns true if target account has admin role', function () {
            chai_1.expect(accountUtils_1.isMod(mocks_1.account({ roles: ['admin'] }))).true;
        });
        it('returns true if target account has superadmin role', function () {
            chai_1.expect(accountUtils_1.isMod(mocks_1.account({ roles: ['superadmin'] }))).true;
        });
        it('returns false if target account has no roles', function () {
            chai_1.expect(accountUtils_1.isMod(mocks_1.account({}))).false;
        });
        it('returns false if target account has no admin or superadmin roles', function () {
            chai_1.expect(accountUtils_1.isMod(mocks_1.account({ roles: ['foo'] }))).false;
        });
    });
    describe('isDev()', function () {
        it('returns true if target account has dev role', function () {
            chai_1.expect(accountUtils_1.isDev(mocks_1.account({ roles: ['dev'] }))).true;
        });
        it('returns false if target account has no roles', function () {
            chai_1.expect(accountUtils_1.isDev(mocks_1.account({}))).false;
        });
        it('returns false if target account has no dev role', function () {
            chai_1.expect(accountUtils_1.isDev(mocks_1.account({ roles: ['foo'] }))).false;
        });
    });
    describe('meetsRequirement()', function () {
        it('returns true for undefined requirement', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({}, undefined)).true;
        });
        it('returns true for empty requirement', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({}, '')).true;
        });
        it('returns true if requirement matches role', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({ roles: ['mod'] }, 'mod')).true;
        });
        it('returns true if matches supporter 1 requirement', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({ supporter: 1 /* Supporter1 */ }, 'sup1')).true;
        });
        it('returns true if matches supporter 2 requirement', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({ supporter: 2 /* Supporter2 */ }, 'sup2')).true;
        });
        it('returns true if matches supporter 3 requirement', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({ supporter: 3 /* Supporter3 */ }, 'sup3')).true;
        });
        it('returns false if supporter is lower level', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({ supporter: 1 /* Supporter1 */ }, 'sup2')).false;
        });
        it('returns true if requires supporter but is mod', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({ roles: ['mod'] }, 'sup2')).true;
        });
        it('returns true if requires supporter but is dev', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({ roles: ['dev'] }, 'sup2')).true;
        });
        it('returns false if supporter is undefined', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({}, 'sup2')).false;
        });
        it('returns false if requirement is not met', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({}, 'mod')).false;
        });
        it('returns false if sup2 requirement is not met', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({ supporter: 0 }, 'sup2')).false;
        });
        it('returns false if inv requirement is not met', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({}, 'inv')).false;
        });
        it('returns true if inv requirement is met (supporter)', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({ supporter: 1 /* Supporter1 */ }, 'inv')).true;
        });
        it('returns true if inv requirement is met (role)', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({ roles: ['dev'] }, 'inv')).true;
        });
        it('returns true if inv requirement is met (invited)', function () {
            chai_1.expect(accountUtils_1.meetsRequirement({ supporterInvited: true }, 'inv')).true;
        });
    });
    describe('getSupporterInviteLimit()', function () {
        it('returns 100 for mod', function () {
            chai_1.expect(accountUtils_1.getSupporterInviteLimit({ roles: ['mod'] })).equal(100);
        });
        it('returns 100 for dev', function () {
            chai_1.expect(accountUtils_1.getSupporterInviteLimit({ roles: ['dev'] })).equal(100);
        });
        it('returns 1 for supporter level 1', function () {
            chai_1.expect(accountUtils_1.getSupporterInviteLimit({ supporter: 1 })).equal(1);
        });
        it('returns 5 for supporter level 2', function () {
            chai_1.expect(accountUtils_1.getSupporterInviteLimit({ supporter: 2 })).equal(5);
        });
        it('returns 10 for supporter level 3', function () {
            chai_1.expect(accountUtils_1.getSupporterInviteLimit({ supporter: 3 })).equal(10);
        });
        it('returns 0 otherwise', function () {
            chai_1.expect(accountUtils_1.getSupporterInviteLimit({})).equal(0);
        });
    });
});
//# sourceMappingURL=accountUtils.spec.js.map