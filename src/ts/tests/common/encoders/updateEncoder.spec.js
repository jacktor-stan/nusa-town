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
require("../../lib");
var chai_1 = require("chai");
var updateEncoder_1 = require("../../../common/encoders/updateEncoder");
var mocks_1 = require("../../mocks");
var utf8_1 = require("ag-sockets/dist/utf8");
var updateDecoder_1 = require("../../../common/encoders/updateDecoder");
var serverRegion_1 = require("../../../server/serverRegion");
var entityUtils_1 = require("../../../server/entityUtils");
var compress_1 = require("../../../common/compress");
var constants_1 = require("../../../common/constants");
describe('updateEncoder', function () {
    describe('encodeUpdate() + decodeUpdate()', function () {
        var def = { x: 0, y: 0, vx: 0, vy: 0, action: 0, playerState: 0, options: undefined };
        var out = updateDecoder_1.emptyUpdate(0);
        var exp = { x: 0, y: 0, updates: [], removes: [], tiles: [], tileData: null };
        var region;
        function testEncodeDecode(input, expected) {
            var encoded = updateEncoder_1.encodeUpdateSimple(input);
            var decoded = updateDecoder_1.decodeUpdate(encoded);
            chai_1.expect(decoded).eql(expected);
        }
        beforeEach(function () {
            region = serverRegion_1.createServerRegion(0, 0);
        });
        it('encodes empty updates', function () {
            testEncodeDecode(region, __assign({}, exp));
        });
        it('encodes region x, y', function () {
            region.x = 1;
            region.y = 2;
            testEncodeDecode(region, __assign(__assign({}, exp), { x: 1, y: 2 }));
        });
        it('encodes empty removes', function () {
            testEncodeDecode(region, __assign(__assign({}, exp), { removes: [] }));
        });
        it('encodes removes', function () {
            region.entityRemoves.push(1, 2, 3);
            testEncodeDecode(region, __assign(__assign({}, exp), { removes: [1, 2, 3] }));
        });
        it('encodes empty tiles', function () {
            testEncodeDecode(region, __assign(__assign({}, exp), { tiles: [] }));
        });
        it('encodes tiles', function () {
            region.tileUpdates.push({ x: 1, y: 2, type: 3 }, { x: 7, y: 56, type: 2 });
            testEncodeDecode(region, __assign(__assign({}, exp), { tiles: [{ x: 1, y: 2, type: 3 }, { x: 7, y: 56, type: 2 }] }));
        });
        it('encodes flags', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: __assign(__assign({}, mocks_1.entity(123)), { state: 48 /* PonySitting */ }), flags: 4 /* State */ }));
            testEncodeDecode(region, __assign(__assign({}, exp), { updates: [__assign(__assign({}, out), { id: 123, state: 48 /* PonySitting */ })] }));
        });
        it('encodes flags with switch region', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: __assign(__assign({}, mocks_1.entity(123)), { state: 48 /* PonySitting */ }), flags: 4 /* State */ | 2048 /* SwitchRegion */ }));
            testEncodeDecode(region, __assign(__assign({}, exp), { updates: [__assign(__assign({}, out), { id: 123, state: 48 /* PonySitting */, switchRegion: true })] }));
        });
        it('encodes expression', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: __assign(__assign({}, mocks_1.entity(123)), { options: { expr: 555 } }), flags: 8 /* Expression */ }));
            testEncodeDecode(region, __assign(__assign({}, exp), { updates: [__assign(__assign({}, out), { id: 123, expression: 555 })] }));
        });
        it('encodes position', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: mocks_1.entity(123), flags: 1 /* Position */, x: 11, y: 22 }));
            testEncodeDecode(region, __assign(__assign({}, exp), { updates: [__assign(__assign({}, out), { id: 123, x: 11, y: 22, state: 0 })] }));
        });
        it('encodes type', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: mocks_1.entity(123, 0, 0, 111), flags: 16 /* Type */ }));
            testEncodeDecode(region, __assign(__assign({}, exp), { updates: [__assign(__assign({}, out), { id: 123, type: 111 })] }));
        });
        it('encodes options', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: mocks_1.entity(123), flags: 32 /* Options */, options: { tag: 'bar' } }));
            testEncodeDecode(region, __assign(__assign({}, exp), { updates: [__assign(__assign({}, out), { id: 123, options: { tag: 'bar' } })] }));
        });
        it('encodes info', function () {
            var e = mocks_1.serverEntity(123);
            e.encryptedInfoSafe = new Uint8Array([1, 2, 3, 4, 5]);
            region.entityUpdates.push(__assign(__assign({}, def), { entity: e, flags: 64 /* Info */ }));
            var decoded = updateDecoder_1.decodeUpdate(updateEncoder_1.encodeUpdateSimple(region));
            chai_1.expect(Array.from(decoded.updates[0].info)).eql([1, 2, 3, 4, 5]);
        });
        it('encodes action', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: mocks_1.entity(123), action: 5, flags: 128 /* Action */ }));
            testEncodeDecode(region, __assign(__assign({}, exp), { updates: [__assign(__assign({}, out), { id: 123, action: 5 })] }));
        });
        it('encodes name', function () {
            var e = mocks_1.serverEntity(123);
            e.encodedName = utf8_1.encodeString('foobar');
            region.entityUpdates.push(__assign(__assign({}, def), { entity: e, flags: 256 /* Name */ }));
            var decoded = updateDecoder_1.decodeUpdate(updateEncoder_1.encodeUpdateSimple(region));
            chai_1.expect(decoded.updates[0].name).eql('foobar');
        });
        it('encodes bad name', function () {
            var e = mocks_1.serverEntity(123);
            e.encodedName = utf8_1.encodeString('foobar');
            e.nameBad = true;
            region.entityUpdates.push(__assign(__assign({}, def), { entity: e, flags: 256 /* Name */ }));
            var decoded = updateDecoder_1.decodeUpdate(updateEncoder_1.encodeUpdateSimple(region));
            chai_1.expect(decoded.updates[0].name).eql('foobar');
            chai_1.expect(decoded.updates[0].filterName).true;
        });
        it('encodes position and velocity', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: mocks_1.entity(123), flags: 1 /* Position */, x: 11, y: 22, vx: 1, vy: 1 }));
            testEncodeDecode(region, __assign(__assign({}, exp), { updates: [__assign(__assign({}, out), { id: 123, x: 11, y: 22, vx: 1, vy: 1, state: 0 })] }));
        });
        it('encodes position and velocity (2)', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: mocks_1.entity(123), flags: 1 /* Position */, x: 11.125, y: 22.5, vx: 0.125, vy: 2.5 }));
            testEncodeDecode(region, __assign(__assign({}, exp), { updates: [__assign(__assign({}, out), { id: 123, x: 11.125, y: 22.5, vx: 0.125, vy: 2.5, state: 0 })] }));
        });
        it('encodes position and velocity (3)', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: mocks_1.entity(123), flags: 1 /* Position */, x: -11.125, y: -22.5, vx: -0.125, vy: -2.5 }));
            testEncodeDecode(region, __assign(__assign({}, exp), { updates: [__assign(__assign({}, out), { id: 123, x: -11.125, y: -22.5, vx: -0.125, vy: -2.5, state: 0 })] }));
        });
        it('throws on invalid velocity', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: mocks_1.entity(123), flags: 1 /* Position */, x: 0, y: 0, vx: 100, vy: 0 }));
            chai_1.expect(function () { return testEncodeDecode(region, __assign(__assign({}, exp), { updates: [] })); })
                .throw('Exceeded max velocity (100)');
        });
        it('encodes update with all fields', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: __assign(__assign({}, mocks_1.entity(123, 0, 0, 111)), { state: 48 /* PonySitting */ }), flags: 1 /* Position */ | 16 /* Type */ | 32 /* Options */ | 128 /* Action */, x: 11, y: 22, vx: 1, vy: 1, action: 5, options: { tag: 'bar' } }));
            testEncodeDecode(region, __assign(__assign({}, exp), { updates: [__assign(__assign({}, out), { id: 123, type: 111, x: 11, y: 22, vx: 1, vy: 1, state: 48 /* PonySitting */, action: 5, playerState: undefined, options: { tag: 'bar' } })] }));
        });
        it('encodes multiple updates', function () {
            region.entityUpdates.push(__assign(__assign({}, def), { entity: mocks_1.entity(123), flags: 1 /* Position */, x: 11, y: 22 }), __assign(__assign({}, def), { entity: __assign(__assign({}, mocks_1.entity(321)), { state: 48 /* PonySitting */ }), flags: 4 /* State */ }));
            testEncodeDecode(region, __assign(__assign({}, exp), { updates: [
                    __assign(__assign({}, out), { id: 123, x: 11, y: 22, state: 0 }),
                    __assign(__assign({}, out), { id: 321, state: 48 /* PonySitting */ }),
                ] }));
        });
    });
    describe('writeRegion() + decodeUpdate()', function () {
        var tiles = new Uint8Array(constants_1.REGION_SIZE * constants_1.REGION_SIZE);
        tiles.fill(1 /* Dirt */);
        var emptyTileData = compress_1.compressTiles(tiles);
        function testEncodeDecode(region, client, expected) {
            var encoded = updateEncoder_1.encodeRegionSimple(region, client);
            var decoded = updateDecoder_1.decodeUpdate(encoded);
            chai_1.expect(decoded).eql(expected);
        }
        it('empty region', function () {
            var region = serverRegion_1.createServerRegion(1, 2);
            var client = mocks_1.mockClient();
            testEncodeDecode(region, client, { x: 1, y: 2, removes: [], tiles: [], tileData: emptyTileData, updates: [] });
        });
        it('encodes single entity', function () {
            var region = serverRegion_1.createServerRegion(1, 2);
            var entity = mocks_1.serverEntity(123, 10, 20, 32);
            var client = mocks_1.mockClient();
            region.entities.push(entity);
            testEncodeDecode(region, client, {
                x: 1, y: 2, removes: [], tiles: [], tileData: emptyTileData, updates: [
                    {
                        id: 123, x: 10, y: 20, vx: 0, vy: 0, type: 32,
                        name: undefined, switchRegion: false, crc: undefined, info: undefined,
                        state: 0, expression: undefined, action: undefined, options: undefined,
                        playerState: undefined, filterName: false,
                    },
                ]
            });
        });
        it('encodes single entity with more fields', function () {
            var region = serverRegion_1.createServerRegion(1, 2);
            var entity = mocks_1.serverEntity(123, 10, 20, 32);
            var client = mocks_1.mockClient();
            region.entities.push(entity);
            entityUtils_1.setEntityName(entity, 'foo');
            var info = new Uint8Array([1, 2, 3]);
            entity.client = mocks_1.mockClient();
            entity.state = 123;
            entity.options = { toy: 5, expr: 123 };
            entity.encryptedInfoSafe = info;
            entity.vx = 1;
            entity.vy = 2;
            client.hides.add(entity.client.accountId);
            testEncodeDecode(region, client, {
                x: 1, y: 2, removes: [], tiles: [], tileData: emptyTileData, updates: [
                    {
                        id: 123, x: 10, y: 20, vx: 1, vy: 2, type: 32,
                        name: 'foo', switchRegion: false, crc: 0,
                        info: info,
                        state: 123, expression: undefined, action: undefined, options: { toy: 5, expr: 123 },
                        playerState: 2, filterName: false,
                    },
                ],
            });
        });
        it('skips shadowed entities', function () {
            var region = serverRegion_1.createServerRegion(1, 2);
            var entity = mocks_1.serverEntity(123, 10, 20, 32);
            var client = mocks_1.mockClient();
            region.entities.push(entity);
            entity.client = mocks_1.mockClient();
            entity.client.shadowed = true;
            testEncodeDecode(region, client, { x: 1, y: 2, removes: [], tiles: [], updates: [], tileData: emptyTileData });
        });
    });
});
//# sourceMappingURL=updateEncoder.spec.js.map