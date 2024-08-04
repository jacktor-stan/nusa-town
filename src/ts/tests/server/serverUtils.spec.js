"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../lib");
var sinon_1 = require("sinon");
var chai_1 = require("chai");
var mongoose_1 = require("mongoose");
var serverUtils_1 = require("../../server/serverUtils");
var mocks_1 = require("../mocks");
describe('serverUtils', function () {
    describe('tokenService()', function () {
        var service;
        var socket;
        beforeEach(function () {
            socket = {
                clearTokens: sinon_1.stub(),
                token: sinon_1.stub(),
            };
            service = serverUtils_1.tokenService(socket);
        });
        it('clears tokens for account', function () {
            service.clearTokensForAccount('foo');
            var filter = socket.clearTokens.args[0][0];
            chai_1.expect(filter('', { accountId: 'foo' })).true;
            chai_1.expect(filter('', { accountId: 'bar' })).false;
            sinon_1.assert.calledOnce(socket.clearTokens);
        });
        it('clears all tokens', function () {
            service.clearTokensAll();
            var filter = socket.clearTokens.args[0][0];
            chai_1.expect(filter('', {})).true;
            sinon_1.assert.calledOnce(socket.clearTokens);
        });
        it('creates token', function () {
            var token = { account: {}, character: {} };
            service.createToken(token);
            sinon_1.assert.calledWith(socket.token, token);
        });
    });
    describe('toPonyObject()', function () {
        it('returns pony object', function () {
            var id = mocks_1.genId();
            chai_1.expect(serverUtils_1.toPonyObject(mocks_1.character({
                _id: mongoose_1.Types.ObjectId(id),
                name: 'foo',
                desc: 'aaa',
                info: 'info',
                site: mongoose_1.Types.ObjectId('000000000000000000000002'),
                tag: 'tag',
                lastUsed: new Date(123),
            }))).eql({
                id: id,
                name: 'foo',
                desc: 'aaa',
                info: 'info',
                site: '000000000000000000000002',
                tag: 'tag',
                lastUsed: '1970-01-01T00:00:00.123Z',
                hideSupport: undefined,
                respawnAtSpawn: undefined,
            });
        });
        it('handles empty fields', function () {
            var id = mocks_1.genId();
            chai_1.expect(serverUtils_1.toPonyObject(mocks_1.character({
                _id: mongoose_1.Types.ObjectId(id),
                name: 'foo',
            }))).eql({
                id: id,
                name: 'foo',
                desc: '',
                info: '',
                site: undefined,
                tag: undefined,
                lastUsed: undefined,
                hideSupport: undefined,
                respawnAtSpawn: undefined,
            });
        });
        it('sets hide support field', function () {
            var output = serverUtils_1.toPonyObject(mocks_1.character({
                _id: mongoose_1.Types.ObjectId(mocks_1.genId()),
                name: 'foo',
                flags: 4 /* HideSupport */,
            }));
            chai_1.expect(output.hideSupport).true;
        });
        it('sets respawn at spawn field', function () {
            var output = serverUtils_1.toPonyObject(mocks_1.character({
                _id: mongoose_1.Types.ObjectId(mocks_1.genId()),
                name: 'foo',
                flags: 8 /* RespawnAtSpawn */,
            }));
            chai_1.expect(output.respawnAtSpawn).true;
        });
        it('returns null for undefined character', function () {
            chai_1.expect(serverUtils_1.toPonyObject(undefined)).null;
        });
    });
    describe('toPonyObjectAdmin()', function () {
        it('returns pony object', function () {
            var id = mocks_1.genId();
            chai_1.expect(serverUtils_1.toPonyObjectAdmin(mocks_1.character({
                _id: mongoose_1.Types.ObjectId(id),
                name: 'foo',
                desc: 'aaa',
                info: 'info',
                site: mongoose_1.Types.ObjectId('000000000000000000000001'),
                tag: 'tag',
                lastUsed: new Date(123),
                creator: 'foo bar',
            }))).eql({
                id: id,
                name: 'foo',
                desc: 'aaa',
                info: 'info',
                site: '000000000000000000000001',
                tag: 'tag',
                lastUsed: '1970-01-01T00:00:00.123Z',
                hideSupport: undefined,
                respawnAtSpawn: undefined,
                creator: 'foo bar',
            });
        });
        it('returns null for undefined character', function () {
            chai_1.expect(serverUtils_1.toPonyObjectAdmin(undefined)).null;
        });
    });
    describe('toSocialSite()', function () {
        it('returns site object', function () {
            var id = mocks_1.genId();
            chai_1.expect(serverUtils_1.toSocialSite(mocks_1.auth({
                _id: mongoose_1.Types.ObjectId(id),
                name: 'foo',
                provider: 'github',
                url: 'foo.com',
            }))).eql({
                id: id,
                name: 'foo',
                provider: 'github',
                url: 'foo.com',
            });
        });
    });
});
//# sourceMappingURL=serverUtils.spec.js.map