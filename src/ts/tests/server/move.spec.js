"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../lib");
var chai_1 = require("chai");
var sinon_1 = require("sinon");
var movementUtils_1 = require("../../common/movementUtils");
var move_1 = require("../../server/move");
var lib_1 = require("../lib");
var mocks_1 = require("../mocks");
var counter_1 = require("../../server/services/counter");
var camera_1 = require("../../common/camera");
var expressionEncoder_1 = require("../../common/encoders/expressionEncoder");
var serverRegion_1 = require("../../server/serverRegion");
var serverMap_1 = require("../../server/serverMap");
var rect_1 = require("../../common/rect");
var constants_1 = require("../../common/constants");
var collision = require("../../common/collision");
describe('move', function () {
    describe('move()', function () {
        var camera;
        var client;
        var counter = lib_1.stubClass(counter_1.CounterService);
        var move;
        var isStaticCollision;
        beforeEach(function () {
            lib_1.resetStubMethods(counter, 'add', 'remove');
            isStaticCollision = sinon_1.stub(collision, 'isStaticCollision');
            camera = camera_1.createCamera();
            client = mocks_1.mockClient();
            client.map = serverMap_1.createServerMap('', 0, 10, 10);
            move = move_1.createMove(counter);
        });
        afterEach(function () {
            isStaticCollision.restore();
        });
        it('does nothing if loading flag is true', function () {
            client.loading = true;
            move(client, 0, 1, 2, 3, 4, 5, {});
            chai_1.expect(client.pony.x).equal(0, 'x');
            chai_1.expect(client.pony.y).equal(0, 'y');
        });
        it('does nothing if fixing position', function () {
            client.loading = true;
            move(client, 0, 1, 2, 3, 4, 5, {});
            chai_1.expect(client.pony.x).equal(0, 'x');
            chai_1.expect(client.pony.y).equal(0, 'y');
        });
        it('updates pony coordinates', function () {
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 0 /* None */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.pony.x).equal(12.015625, 'x');
            chai_1.expect(client.pony.y).equal(34.020833333333336, 'y');
        });
        it('updates last coordinates, velocity and time', function () {
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 0 /* None */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.lastX).equal(12.015625, 'lastX');
            chai_1.expect(client.lastY).equal(34.020833333333336, 'lastY');
            chai_1.expect(client.lastVX).equal(0, 'lastVX');
            chai_1.expect(client.lastVY).equal(0, 'lastVY');
            chai_1.expect(client.lastTime).equal(123, 'lastTime');
        });
        it('updates pony coordinates (has last time)', function () {
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 0 /* None */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            client.lastTime = 1;
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.pony.x).equal(12.015625, 'x');
            chai_1.expect(client.pony.y).equal(34.020833333333336, 'y');
        });
        it('updates pony velocity', function () {
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 32 /* PonyTrotting */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.pony.vx).equal(constants_1.PONY_SPEED_TROT, 'vx');
            chai_1.expect(client.pony.vy).equal(-constants_1.PONY_SPEED_TROT, 'vy');
        });
        it('updates safe position if not colliding', function () {
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 32 /* PonyTrotting */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            isStaticCollision.returns(false);
            client.pony.x = 10;
            client.pony.y = 30;
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.safeX).equal(10, 'safeX');
            chai_1.expect(client.safeY).equal(30, 'safeY');
            sinon_1.assert.calledWith(isStaticCollision, client.pony, client.map, true);
        });
        it('does not update safe position if colliding', function () {
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 32 /* PonyTrotting */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            isStaticCollision.returns(false);
            isStaticCollision.withArgs(client.pony, client.map, true).returns(true);
            client.pony.x = 10;
            client.pony.y = 30;
            client.safeX = 1;
            client.safeY = 3;
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.safeX).equal(1, 'safeX');
            chai_1.expect(client.safeY).equal(3, 'safeY');
        });
        it('resets pony to safe position if colliding', function () {
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 32 /* PonyTrotting */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            var fixPositionStub = sinon_1.stub(client, 'fixPosition');
            isStaticCollision.onCall(0).returns(true);
            isStaticCollision.onCall(1).returns(true);
            isStaticCollision.onCall(2).returns(false);
            client.safeX = 1;
            client.safeY = 3;
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.pony.x).equal(1, 'x');
            chai_1.expect(client.pony.y).equal(3, 'y');
            sinon_1.assert.calledWith(fixPositionStub, 1, 3, false);
        });
        it('does not reset pony to safe position if safe position is colliding', function () {
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 32 /* PonyTrotting */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            var fixPositionStub = sinon_1.stub(client, 'fixPosition');
            isStaticCollision.onCall(0).returns(true);
            isStaticCollision.onCall(1).returns(true);
            isStaticCollision.onCall(2).returns(true);
            client.safeX = 1;
            client.safeY = 3;
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.pony.x).equal(12.015625, 'x');
            chai_1.expect(client.pony.y).equal(34.020833333333336, 'y');
            sinon_1.assert.notCalled(fixPositionStub);
        });
        it('updates pony right flag', function () {
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 32 /* PonyTrotting */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.pony.state).equal(2 /* FacingRight */, 'flags');
        });
        it('resets head turned flag if turning', function () {
            client.pony.state = 4 /* HeadTurned */;
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 32 /* PonyTrotting */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.pony.state).equal(2 /* FacingRight */, 'flags');
        });
        it('resets sitting flag', function () {
            client.pony.state = 48 /* PonySitting */;
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 32 /* PonyTrotting */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.pony.state).equal(2 /* FacingRight */, 'flags');
        });
        it('adds entity update', function () {
            var region = serverRegion_1.createServerRegion(0, 0);
            client.pony.region = region;
            var _a = movementUtils_1.encodeMovement(0, 0, 0, 0, 0, rect_1.rect(0, 0, 0, 0)), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(region.entityUpdates).eql([
                {
                    entity: client.pony, flags: 1 /* Position */ | 4 /* State */,
                    x: 0.015625, y: 0.020833333333333332, vx: 0, vy: -0,
                    action: 0, playerState: 0, options: undefined
                },
            ]);
        });
        it('clears cancellable expression', function () {
            client.pony.exprCancellable = true;
            client.pony.options.expr = 123;
            var _a = movementUtils_1.encodeMovement(0, 0, 0, 0, 0, rect_1.rect(0, 0, 0, 0)), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.EMPTY_EXPRESSION);
            chai_1.expect(client.pony.exprCancellable).false;
        });
        it('reports client outside the map', function () {
            var _a = movementUtils_1.encodeMovement(10000, 10000, 0, 0 /* None */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            var warn = sinon_1.stub(client.reporter, 'warn');
            Object.assign(client.map, { id: 'foo', width: 100, height: 100 });
            move(client, 0, a, b, c, d, e, {});
            sinon_1.assert.calledWith(warn, 'Outside map', 'map: [foo] coords: [10000.02, 10000.02]');
        });
        it('logs client outside the map', function () {
            var _a = movementUtils_1.encodeMovement(10000, 10000, 0, 0 /* None */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            Object.assign(client.map, { id: 'foo', width: 100, height: 100 });
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.leaveReason).equal('outside map: [foo] coords: [10000.02, 10000.02]');
        });
        it('disconnects client outside the map', function () {
            var _a = movementUtils_1.encodeMovement(10000, 10000, 0, 0 /* None */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            var disconnect = sinon_1.stub(client, 'disconnect');
            Object.assign(client.map, { id: 'foo', width: 100, height: 100 });
            move(client, 0, a, b, c, d, e, {});
            sinon_1.assert.calledWith(disconnect, true, true);
        });
        it('does not update pony position when coordinates are outside the map', function () {
            var _a = movementUtils_1.encodeMovement(10000, 10000, 0, 0 /* None */, 123, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            Object.assign(client.map, { width: 100, height: 100 });
            move(client, 0, a, b, c, d, e, {});
            chai_1.expect(client.pony.x).equal(0, 'x');
            chai_1.expect(client.pony.y).equal(0, 'y');
        });
        it('logs lagging player if logLagging setting is true', function () {
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 32 /* PonyTrotting */, 16000, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            var systemLog = sinon_1.stub(client.reporter, 'systemLog');
            client.account.name = 'Foo';
            client.accountId = 'foo';
            move(client, 0, a, b, c, d, e, { logLagging: true });
            sinon_1.assert.calledWith(systemLog, 'Time delta > 15s (16000)');
            chai_1.expect(client.logDisconnect).true;
        });
        it('kicks player for lagging if kickLagging setting is true', function () {
            var _a = movementUtils_1.encodeMovement(12, 34, 2, 32 /* PonyTrotting */, 16000, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            var disconnect = sinon_1.stub(client, 'disconnect');
            move(client, 0, a, b, c, d, e, { kickLagging: true });
            sinon_1.assert.calledWith(disconnect, true, true);
            chai_1.expect(client.leaveReason).equal('lagging');
        });
        it('counts teleporting', function () {
            var _a = movementUtils_1.encodeMovement(10, 10, 2, 32 /* PonyTrotting */, 1001, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            counter.add.returns({ count: 1, items: [], date: 0 });
            Object.assign(client, { lastX: 0, lastY: 0, lastVX: 0, lastVY: 0, lastTime: 1 });
            move(client, 0, a, b, c, d, e, { reportTeleporting: true });
            sinon_1.assert.calledWith(counter.add, client.accountId);
        });
        it('reports teleporting if counter exceeded limit', function () {
            var _a = movementUtils_1.encodeMovement(10, 10, 2, 32 /* PonyTrotting */, 1001, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            counter.add.returns({ count: 20, items: [], date: 0 });
            Object.assign(client, { lastX: 0, lastY: 0, lastVX: 0, lastVY: 0, lastTime: 1 });
            var warn = sinon_1.stub(client.reporter, 'warn');
            move(client, 0, a, b, c, d, e, { reportTeleporting: true });
            sinon_1.assert.calledWith(counter.add, client.accountId);
            sinon_1.assert.calledWith(counter.remove, client.accountId);
            sinon_1.assert.calledWith(warn, 'Teleporting (x10)');
        });
        it('kicks player for teleporting', function () {
            var _a = movementUtils_1.encodeMovement(10, 10, 2, 32 /* PonyTrotting */, 1001, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            var disconnect = sinon_1.stub(client, 'disconnect');
            Object.assign(client, { lastX: 0, lastY: 0, lastVX: 0, lastVY: 0, lastTime: 1 });
            move(client, 0, a, b, c, d, e, { kickTeleporting: true });
            sinon_1.assert.calledWith(disconnect, true, true);
            chai_1.expect(client.leaveReason).equal('teleporting');
        });
        it('fixes player position if teleporting', function () {
            var _a = movementUtils_1.encodeMovement(10, 10, 2, 32 /* PonyTrotting */, 1001, camera), a = _a[0], b = _a[1], c = _a[2], d = _a[3], e = _a[4];
            var systemLog = sinon_1.stub(client.reporter, 'systemLog');
            var fixPositionStub = sinon_1.stub(client, 'fixPosition');
            Object.assign(client, { lastX: 0, lastY: 0, lastVX: 0, lastVY: 0, lastTime: 1 });
            move(client, 0, a, b, c, d, e, { fixTeleporting: true, logFixingPosition: true });
            chai_1.expect(client.pony.vx).equal(0);
            chai_1.expect(client.pony.vy).equal(0);
            sinon_1.assert.calledWith(fixPositionStub, 0, 0, false);
            sinon_1.assert.calledWith(systemLog, 'Fixed teleporting (10.015625 10.020833333333334) -> (0 0)');
        });
    });
});
//# sourceMappingURL=move.spec.js.map