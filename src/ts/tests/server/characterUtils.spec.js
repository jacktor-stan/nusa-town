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
require("../lib");
var chai_1 = require("chai");
var utf8_1 = require("ag-sockets/dist/utf8");
var characterUtils_1 = require("../../server/characterUtils");
var mocks_1 = require("../mocks");
var constants_1 = require("../../common/constants");
var entities = require("../../common/entities");
var rect_1 = require("../../common/rect");
var serverMap_1 = require("../../server/serverMap");
var counter_1 = require("../../server/services/counter");
var playerUtils_1 = require("../../server/playerUtils");
var utils_1 = require("../../common/utils");
describe('characterUtils', function () {
    describe('createPony()', function () {
        var defaultState = { x: 0, y: 0, flags: 0 };
        it('creates pony entity', function () {
            var pony = characterUtils_1.createPony(mocks_1.account({ _id: '' }), mocks_1.character({ name: 'foo' }), defaultState);
            chai_1.expect(pony).not.undefined;
            chai_1.expect(pony.type).equal(entities.pony.type);
        });
        it('sets initial position for character from state', function () {
            var main = __assign(__assign({}, defaultState), { x: 1, y: 2 });
            var pony = characterUtils_1.createPony(mocks_1.account({ _id: '' }), mocks_1.character({ name: 'foo' }), main);
            chai_1.expect(pony.x).eql(1, 'x');
            chai_1.expect(pony.y).eql(2, 'y');
        });
        it('sets facing from state', function () {
            var main = __assign(__assign({}, defaultState), { flags: 1 /* Right */ });
            var pony = characterUtils_1.createPony(mocks_1.account({ _id: '' }), mocks_1.character({ name: 'foo' }), main);
            chai_1.expect(pony.state).equal(2 /* FacingRight */);
        });
        it('sets extra flag from state', function () {
            var main = __assign(__assign({}, defaultState), { flags: 2 /* Extra */ });
            var pony = characterUtils_1.createPony(mocks_1.account({ _id: '' }), mocks_1.character({ name: 'foo' }), main);
            chai_1.expect(pony.options.extra).true;
        });
        it('sets held item from state', function () {
            var main = __assign(__assign({}, defaultState), { hold: 'apple' });
            var pony = characterUtils_1.createPony(mocks_1.account({ _id: '' }), mocks_1.character({ name: 'foo' }), main);
            chai_1.expect(pony.options.hold).equal(entities.apple.type);
        });
        it('ignores held item from state if type is invalid', function () {
            var main = __assign(__assign({}, defaultState), { hold: 'does_not_exist' });
            var pony = characterUtils_1.createPony(mocks_1.account({ _id: '' }), mocks_1.character({ name: 'foo' }), main);
            chai_1.expect(pony.options.hold).undefined;
        });
        it('sets canCollide flag', function () {
            var pony = characterUtils_1.createPony(mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'foo', info: constants_1.OFFLINE_PONY }), {});
            chai_1.expect(utils_1.hasFlag(pony.flags, 64 /* CanCollide */)).true;
        });
        it('sets canFly flag to false for ponies without wings', function () {
            var pony = characterUtils_1.createPony(mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'foo', info: constants_1.OFFLINE_PONY }), {});
            chai_1.expect(pony.canFly).false;
        });
        it('sets canFly flag to true for ponies with wings', function () {
            var info = 'CAb///9xcXHaICDHx8eqqqq9vb02QAJkJEIFcADAAwgEnAcgQNiMS4A=';
            var pony = characterUtils_1.createPony(mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'foo', info: info }), {});
            chai_1.expect(pony.canFly).true;
        });
        it('sets character name', function () {
            var pony = characterUtils_1.createPony(mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'foo', info: constants_1.OFFLINE_PONY }), {});
            chai_1.expect(pony.name).equal('foo');
        });
        it('sets extra options name', function () {
            var pony = characterUtils_1.createPony(mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'foo', info: constants_1.OFFLINE_PONY }), {});
            chai_1.expect(pony.extraOptions).eql(characterUtils_1.createExtraOptions(mocks_1.character({ name: 'foo' })));
        });
    });
    describe('updatePony()', function () {
        it('sets name', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'Foo' }));
            chai_1.expect(entity.name).equal('Foo');
        });
        it('sets options', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId(), roles: ['mod'] }), mocks_1.character({ name: 'Foo', tag: 'mod' }));
            chai_1.expect(entity.options).eql({ tag: 'mod' });
        });
        it('sets extra options', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId() }), { name: 'Foo', auth: { provider: 'github', name: 'FooAcc', url: 'foo.com' } });
            chai_1.expect(entity.extraOptions).eql({
                ex: true,
                site: {
                    provider: 'github',
                    name: 'FooAcc',
                    url: 'foo.com',
                }
            });
        });
        it('sets canFly flag', function () {
            var entity1 = mocks_1.serverEntity(1);
            var entity2 = mocks_1.serverEntity(2);
            characterUtils_1.updatePony(entity1, mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'Foo', info: constants_1.OFFLINE_PONY }));
            characterUtils_1.updatePony(entity2, mocks_1.account({ _id: '' }), mocks_1.character({ name: 'Bar', info: 'DAT/AADapSD/1wC7Li42QAJkJEAT8ADAAxADhAYQFGAQAA==' }));
            chai_1.expect(entity1.canFly).false;
            chai_1.expect(entity2.canFly).true;
        });
        it('sets info and encrypted info', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'Foo', info: constants_1.OFFLINE_PONY }));
            chai_1.expect(entity.info).equal(constants_1.OFFLINE_PONY);
            chai_1.expect(entity.encryptedInfoSafe).eql(characterUtils_1.encryptInfo(constants_1.OFFLINE_PONY));
        });
        it('sets encoded name fields', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'Fuck Foo' }));
            chai_1.expect(entity.encodedName).eql(utf8_1.encodeString('Fuck Foo'));
        });
        it('sets info safe fields', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'Foo', info: constants_1.OFFLINE_PONY }));
            chai_1.expect(entity.infoSafe).eql(constants_1.OFFLINE_PONY);
            chai_1.expect(entity.encryptedInfoSafe).eql(characterUtils_1.encryptInfo(constants_1.OFFLINE_PONY));
        });
        it('sets info safe fields to info with removed CM if bad CM flag is true', function () {
            var entity = mocks_1.serverEntity(1);
            var offlinePonyWithoutCM = 'DAKVlZUvLy82QIxomgCfgAYAGIAoQGEBAA==';
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'Foo', info: constants_1.OFFLINE_PONY, flags: 1 /* BadCM */ }));
            chai_1.expect(entity.infoSafe).eql(offlinePonyWithoutCM);
            chai_1.expect(entity.encryptedInfoSafe).eql(characterUtils_1.encryptInfo(offlinePonyWithoutCM));
        });
        it('sets options', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'foo' }));
            chai_1.expect(entity.name).equal('foo');
        });
        it('fills in missing info', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'foo' }));
            chai_1.expect(entity.name).equal('foo');
        });
        it('includes tag', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId(), roles: ['mod'] }), mocks_1.character({ name: 'foo', tag: 'mod' }));
            chai_1.expect(entity.options.tag).equal('mod');
        });
        it('prioritazes set tag', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId(), supporter: 1 /* Supporter1 */, roles: ['mod'] }), mocks_1.character({ name: 'foo', tag: 'mod' }));
            chai_1.expect(entity.options.tag).equal('mod');
        });
        it('creates supporter tag', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId(), supporter: 1 /* Supporter1 */ }), mocks_1.character({ name: 'foo' }));
            chai_1.expect(entity.options.tag).equal('sup1');
        });
        it('does not create support tag if hide support flag is true', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId(), supporter: 1 /* Supporter1 */ }), mocks_1.character({ name: 'foo', flags: 4 /* HideSupport */ }));
            chai_1.expect(entity.options.tag).undefined;
        });
        it('does not include tag if role is missing', function () {
            var entity = mocks_1.serverEntity(1);
            characterUtils_1.updatePony(entity, mocks_1.account({ _id: mocks_1.genObjectId() }), mocks_1.character({ name: 'foo', tag: 'mod' }));
            chai_1.expect(entity.options.tag).undefined;
        });
    });
    describe('createExtraOptions()', function () {
        it('sets ex flag', function () {
            chai_1.expect(characterUtils_1.createExtraOptions(mocks_1.character({}))).eql({
                ex: true,
            });
        });
        it('sets site object from auth', function () {
            chai_1.expect(characterUtils_1.createExtraOptions(mocks_1.character({
                auth: {
                    provider: 'github',
                    name: 'foo',
                    url: 'foo.com',
                },
            }))).eql({
                ex: true,
                site: {
                    provider: 'github',
                    name: 'foo',
                    url: 'foo.com',
                }
            });
        });
    });
    describe('getAndFixCharacterState()', function () {
        it('returns saved state', function () {
            var server = { id: 'srvr' };
            var character = { _id: mocks_1.genObjectId(), state: { srvr: { x: 100, y: 321, map: 'bar' } } };
            var map = { id: 'bar', spawnArea: rect_1.rect(10, 20, 0, 0) };
            var world = { getMainMap: function () { return map; }, getMap: function () { return map; } };
            var states = new counter_1.CounterService(1);
            var state = characterUtils_1.getAndFixCharacterState(server, character, world, states);
            chai_1.expect(state).eql({ x: 100, y: 321, map: 'bar' });
        });
        it('returns state from from counter service if available', function () {
            var server = { id: 'srvr' };
            var character = { _id: mocks_1.genObjectId(), state: { srvr: { x: 100, y: 321, map: 'bar' } } };
            var map = { id: 'bar', spawnArea: rect_1.rect(10, 20, 0, 0) };
            var world = { getMainMap: function () { return map; }, getMap: function () { return map; } };
            var states = new counter_1.CounterService(1);
            states.add(character._id.toString(), {
                x: 4, y: 7, map: 'foo', flags: 1 /* Right */ | 2 /* Extra */
            });
            var state = characterUtils_1.getAndFixCharacterState(server, character, world, states);
            chai_1.expect(state).eql({ x: 4, y: 7, map: 'foo', flags: 1 /* Right */ | 2 /* Extra */ });
        });
        it('creates default state if none is provided', function () {
            var server = {};
            var character = { _id: mocks_1.genObjectId() };
            var map = { id: 'foo', spawnArea: rect_1.rect(10, 20, 0, 0) };
            var world = { getMainMap: function () { return map; }, getMap: function () { return map; } };
            var states = new counter_1.CounterService(1);
            var state = characterUtils_1.getAndFixCharacterState(server, character, world, states);
            chai_1.expect(state).eql({ x: 10, y: 20, map: 'foo' });
        });
        it('spawns on main map at spawn point if RespawnAtSpawn flag is set', function () {
            var server = { id: 'srvr' };
            var character = {
                _id: mocks_1.genObjectId(),
                state: { srvr: { x: 100, y: 321, map: 'bar' } },
                flags: 8 /* RespawnAtSpawn */,
            };
            var map = { id: 'foo', spawnArea: rect_1.rect(10, 20, 0, 0) };
            var world = { getMainMap: function () { return map; }, getMap: function () { return map; } };
            var states = new counter_1.CounterService(1);
            var state = characterUtils_1.getAndFixCharacterState(server, character, world, states);
            chai_1.expect(state).eql({ x: 10, y: 20, map: 'foo' });
        });
    });
    describe('createCharacterState()', function () {
        var map = serverMap_1.createServerMap('foo', 0, 1, 1);
        it('returns state of character', function () {
            chai_1.expect(playerUtils_1.createCharacterState(mocks_1.entity(0, 12, 23), map)).eql({
                x: 12,
                y: 23,
                map: 'foo',
            });
        });
        it('encodes right flag', function () {
            var state = playerUtils_1.createCharacterState(mocks_1.entity(0, 12, 23, 0, { state: 2 /* FacingRight */ }), map);
            chai_1.expect(utils_1.hasFlag(state.flags, 1 /* Right */)).true;
        });
        it('encodes held object', function () {
            var state = playerUtils_1.createCharacterState(mocks_1.entity(0, 12, 23, 0, { options: { hold: entities.apple.type } }), map);
            chai_1.expect(state.hold).equal('apple');
        });
        it('encodes extra flag', function () {
            var state = playerUtils_1.createCharacterState(mocks_1.entity(0, 12, 23, 0, { options: { extra: true } }), map);
            chai_1.expect(utils_1.hasFlag(state.flags, 2 /* Extra */)).true;
        });
    });
});
//# sourceMappingURL=characterUtils.spec.js.map