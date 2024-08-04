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
var sinon_1 = require("sinon");
var mocks_1 = require("../mocks");
var userError_1 = require("../../server/userError");
var commands_1 = require("../../server/commands");
var expressionUtils_1 = require("../../common/expressionUtils");
var expressionEncoder_1 = require("../../common/encoders/expressionEncoder");
var serverMap_1 = require("../../server/serverMap");
var playerUtils = require("../../server/playerUtils");
describe('commands', function () {
    describe('parseCommand()', function () {
        it('returns text and type for regular text', function () {
            chai_1.expect(commands_1.parseCommand('hello', 0 /* Say */)).eql({ args: 'hello', type: 0 /* Say */ });
        });
        it('returns party chat type for /p command', function () {
            chai_1.expect(commands_1.parseCommand('/p hello', 0 /* Say */)).eql({ args: 'hello', type: 1 /* Party */ });
        });
        it('returns supporter chat type for /ss command', function () {
            chai_1.expect(commands_1.parseCommand('/ss hello', 0 /* Say */)).eql({ args: 'hello', type: 4 /* Supporter */ });
        });
        it('returns supporter 1 chat type for /s1 command', function () {
            chai_1.expect(commands_1.parseCommand('/s1 hello', 0 /* Say */)).eql({ args: 'hello', type: 5 /* Supporter1 */ });
        });
        it('returns supporter 2 chat type for /s2 command', function () {
            chai_1.expect(commands_1.parseCommand('/s2 hello', 0 /* Say */)).eql({ args: 'hello', type: 6 /* Supporter2 */ });
        });
        it('returns supporter 3 chat type for /s3 command', function () {
            chai_1.expect(commands_1.parseCommand('/s3 hello', 0 /* Say */)).eql({ args: 'hello', type: 7 /* Supporter3 */ });
        });
        it('returns say chat type for /s command', function () {
            chai_1.expect(commands_1.parseCommand('/s hello', 1 /* Party */)).eql({ args: 'hello', type: 0 /* Say */ });
        });
        it('returns think chat type for /t command', function () {
            chai_1.expect(commands_1.parseCommand('/t hello', 0 /* Say */)).eql({ args: 'hello', type: 2 /* Think */ });
        });
        it('returns think chat type for /T command', function () {
            chai_1.expect(commands_1.parseCommand('/T hello', 0 /* Say */)).eql({ args: 'hello', type: 2 /* Think */ });
        });
        it('returns party think chat type for /t command in party chat', function () {
            chai_1.expect(commands_1.parseCommand('/t hello', 1 /* Party */)).eql({ args: 'hello', type: 3 /* PartyThink */ });
        });
        it('returns correct command', function () {
            chai_1.expect(commands_1.parseCommand('/test hello', 0 /* Say */)).eql({ command: 'test', args: 'hello', type: 0 /* Say */ });
        });
        it('returns correct command with no arguments', function () {
            chai_1.expect(commands_1.parseCommand('/test', 0 /* Say */)).eql({ command: 'test', args: '', type: 0 /* Say */ });
        });
        it('keeps the same chat type for commands', function () {
            chai_1.expect(commands_1.parseCommand('/test', 1 /* Party */)).eql({ command: 'test', args: '', type: 1 /* Party */ });
        });
        it('trims args', function () {
            chai_1.expect(commands_1.parseCommand('/test  foo bar  ', 0 /* Say */)).eql({ command: 'test', args: 'foo bar', type: 0 /* Say */ });
        });
        it('returns command name lowercased', function () {
            chai_1.expect(commands_1.parseCommand('/Te&$St foo', 0 /* Say */)).eql({ command: 'Te&$St', args: 'foo', type: 0 /* Say */ });
        });
    });
    describe('getChatPrefix()', function () {
        it('returns empty string for regular chat', function () {
            chai_1.expect(commands_1.getChatPrefix(0 /* Say */)).equal('');
        });
        it('returns "/p " for party chat', function () {
            chai_1.expect(commands_1.getChatPrefix(1 /* Party */)).equal('/p ');
        });
        it('returns "/p " for party thinking', function () {
            chai_1.expect(commands_1.getChatPrefix(3 /* PartyThink */)).equal('/p ');
        });
        it('returns "" for thinking', function () {
            chai_1.expect(commands_1.getChatPrefix(2 /* Think */)).equal('');
        });
        it('returns "/ss " for supporter chat', function () {
            chai_1.expect(commands_1.getChatPrefix(4 /* Supporter */)).equal('/ss ');
        });
        it('returns "" for supporter 1 chat', function () {
            chai_1.expect(commands_1.getChatPrefix(5 /* Supporter1 */)).equal('');
        });
        it('returns "" for supporter 2 chat', function () {
            chai_1.expect(commands_1.getChatPrefix(6 /* Supporter2 */)).equal('');
        });
        it('returns "" for supporter 3 chat', function () {
            chai_1.expect(commands_1.getChatPrefix(7 /* Supporter3 */)).equal('');
        });
    });
    describe('runCommand()', function () {
        var client;
        var context;
        var command;
        var runCommand;
        var handler;
        beforeEach(function () {
            handler = sinon_1.stub();
            command = { names: ['test'], handler: handler, help: '', role: '' };
            client = mocks_1.mockClient();
            context = {
                liveSettings: {},
                world: { sayTo: function () { } },
                notifications: {},
                party: {},
                random: function () { return 0; },
            };
            runCommand = commands_1.createRunCommand(context, [command]);
        });
        it('runs given command', function () {
            runCommand(client, 'test', 'args', 0 /* Say */, undefined, {});
            sinon_1.assert.calledWith(handler, context, client, 'args', 0 /* Say */);
        });
        it('returns true if run command', function () {
            chai_1.expect(runCommand(client, 'test', '', 0 /* Say */, undefined, {})).true;
        });
        it('returns true if command does not exist', function () {
            chai_1.expect(runCommand(client, 'foo', '', 0 /* Say */, undefined, {})).false;
        });
        it('should not run command if client is missing required role', function () {
            command.role = 'admin';
            chai_1.expect(runCommand(client, 'test', '', 0 /* Say */, undefined, {})).false;
        });
        it('should run command if client has required role', function () {
            client.account.roles = ['admin'];
            command.role = 'admin';
            chai_1.expect(runCommand(client, 'test', '', 0 /* Say */, undefined, {})).true;
        });
        it('sends user error to user', function () {
            handler.throws(new userError_1.UserError('test error'));
            runCommand(client, 'test', '', 0 /* Say */, undefined, {});
            chai_1.expect(client.saysQueue).eql([
                [client.pony.id, 'test error', 1 /* System */],
            ]);
        });
        it('rethrows non-user error', function () {
            chai_1.expect(function () {
                handler.throws(new Error('test error'));
                runCommand(client, 'test', '', 0 /* Say */, undefined, {});
            }).throw('test error');
        });
        it('should find correct command case-insensitive', function () {
            chai_1.expect(runCommand(client, 'TeSt', '', 0 /* Say */, undefined, {})).true;
        });
    });
    describe('individual commands', function () {
        var client;
        var context;
        var runCommand;
        var execAction;
        beforeEach(function () {
            execAction = sinon_1.stub(playerUtils, 'execAction');
            client = mocks_1.mockClient();
            client.map = serverMap_1.createServerMap('', 0, 3, 3);
            client.pony.region = client.map.regions[0];
            client.pony.region.clients.push(client);
            client.account.roles = ['mod', 'admin'];
            client.isMod = true;
            context = {
                liveSettings: {},
                world: {
                    featureFlags: { flying: true, swap: true, friends: true },
                    getSettings: function () { return ({}); },
                    action: function () { },
                    unholdItem: function () { },
                    sayTo: function () { },
                    sayToOthers: function () { },
                    sayToEveryone: function () { },
                    setTime: function () { },
                    resetToSpawn: function () { },
                    kick: function () { },
                    fixPosition: function () { },
                },
                notifications: {},
                party: {},
                random: function () { return 0; },
            };
            var commands = commands_1.createCommands(context.world);
            runCommand = commands_1.createRunCommand(context, commands);
        });
        afterEach(function () {
            execAction.restore();
        });
        describe('/help', function () {
            it('prints commands help', function () {
                runCommand(client, 'help', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue.length).equal(1);
                chai_1.expect(client.saysQueue[0][0]).equal(client.pony.id);
                chai_1.expect(client.saysQueue[0][2]).equal(1 /* System */);
            });
        });
        describe('/roll', function () {
            it('rolls random number from 1 to 100 without args', function () {
                sinon_1.stub(context, 'random').withArgs(1, 100).returns(12);
                runCommand(client, 'roll', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, '🎲 rolled 12 of 100', 7 /* Announcement */]]);
            });
            it('rolls random number from 1 to given number', function () {
                sinon_1.stub(context, 'random').withArgs(1, 50).returns(12);
                runCommand(client, 'roll', '50', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, '🎲 rolled 12 of 50', 7 /* Announcement */]]);
            });
            it('rolls random number between given numbers', function () {
                sinon_1.stub(context, 'random').withArgs(50, 200).returns(123);
                runCommand(client, 'roll', '50-200', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, '🎲 rolled 123 of 50-200', 7 /* Announcement */]]);
            });
            it('clamps minimum and maximum', function () {
                sinon_1.stub(context, 'random').withArgs(1000000, 1000000).returns(1000000);
                runCommand(client, 'roll', '999999999-999999999', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, '🎲 rolled 1000000 of 1000000-1000000', 7 /* Announcement */]]);
            });
            it("uses default behaviour if args don't match pattern", function () {
                sinon_1.stub(context, 'random').withArgs(1, 100).returns(50);
                runCommand(client, 'roll', 'foo bar', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, '🎲 rolled 50 of 100', 7 /* Announcement */]]);
            });
            it('rolls apple', function () {
                runCommand(client, 'roll', '🍎', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, '🎲 rolled 🍎 of 100', 7 /* Announcement */]]);
            });
        });
        describe('/e', function () {
            it('updates permanent expression', function () {
                runCommand(client, 'e', '>:|', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.exprPermanent).eql(expressionUtils_1.parseExpression('>:|'));
            });
            it('resets existing expression', function () {
                runCommand(client, 'e', '>:|', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(expressionUtils_1.parseExpression('>:|')));
            });
        });
        describe('/boop /)', function () {
            it('invokes action', function () {
                runCommand(client, 'boop', '', 0 /* Say */, undefined, {});
                sinon_1.assert.calledWith(execAction, client, 1 /* Boop */);
            });
            it('sets expression', function () {
                runCommand(client, 'boop', '>:|', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(expressionUtils_1.parseExpression('>:|')));
            });
        });
        describe('/drop', function () {
            it('invokes action', function () {
                runCommand(client, 'drop', '', 0 /* Say */, undefined, {});
                sinon_1.assert.calledWith(execAction, client, 14 /* Drop */);
            });
        });
        describe('/turn', function () {
            it('invokes action', function () {
                runCommand(client, 'turn', '', 0 /* Say */, undefined, {});
                sinon_1.assert.calledWith(execAction, client, 2 /* TurnHead */);
            });
        });
        describe('/blush', function () {
            it('sets expression with blush', function () {
                runCommand(client, 'blush', '>:|', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(__assign(__assign({}, expressionUtils_1.parseExpression('>:|')), { extra: 1 /* Blush */ })));
            });
            it('uses current expression if available', function () {
                client.pony.options = { expr: expressionEncoder_1.encodeExpression(expressionUtils_1.parseExpression(':(')) };
                runCommand(client, 'blush', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(__assign(__assign({}, expressionUtils_1.parseExpression(':(')), { extra: 1 /* Blush */ })));
            });
            it('uses default expression if not provided', function () {
                runCommand(client, 'blush', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(__assign(__assign({}, expressionUtils_1.expression(1 /* Neutral */, 1 /* Neutral */, 2 /* Neutral */)), { extra: 1 /* Blush */ })));
            });
            it('passes cancellable flag', function () {
                client.pony.exprCancellable = true;
                runCommand(client, 'blush', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(__assign(__assign({}, expressionUtils_1.expression(1 /* Neutral */, 1 /* Neutral */, 2 /* Neutral */)), { extra: 1 /* Blush */ })));
            });
        });
        describe('/gifts', function () {
            it('announces collected gifts count', function () {
                client.account.state = { gifts: 5 };
                runCommand(client, 'gifts', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, 'collected 5 🎁', 7 /* Announcement */]]);
            });
            it('announces 0 collected gifts if missing gifts entry', function () {
                runCommand(client, 'gifts', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, 'collected 0 🎁', 7 /* Announcement */]]);
            });
        });
        describe('/candies', function () {
            it('announces collected candies count', function () {
                client.account.state = { candies: 5 };
                runCommand(client, 'candies', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, 'collected 5 🍬', 7 /* Announcement */]]);
            });
            it('announces 0 collected candies if missing candies entry', function () {
                runCommand(client, 'candies', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, 'collected 0 🍬', 7 /* Announcement */]]);
            });
        });
        describe('/clovers', function () {
            it('announces collected clovers count', function () {
                client.account.state = { clovers: 5 };
                runCommand(client, 'clovers', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, 'collected 5 🍀', 7 /* Announcement */]]);
            });
            it('announces 0 collected clovers if missing clovers entry', function () {
                runCommand(client, 'clovers', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, 'collected 0 🍀', 7 /* Announcement */]]);
            });
        });
        describe('/unstuck', function () {
            it('resets client to spawn', function () {
                var resetToSpawn = sinon_1.stub(context.world, 'resetToSpawn');
                runCommand(client, 'unstuck', '', 0 /* Say */, undefined, {});
                sinon_1.assert.calledWith(resetToSpawn, client);
            });
            it('kicks client', function () {
                var kick = sinon_1.stub(context.world, 'kick');
                runCommand(client, 'unstuck', '', 0 /* Say */, undefined, {});
                sinon_1.assert.calledWith(kick, client);
            });
        });
        describe('/sleep', function () {
            it('sets expression with sleeping', function () {
                runCommand(client, 'sleep', '>:|', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(__assign(__assign({}, expressionUtils_1.parseExpression('>:|')), { left: 6 /* Closed */, right: 6 /* Closed */, extra: 2 /* Zzz */ })));
            });
            it('uses current expression if available', function () {
                client.pony.options = { expr: expressionEncoder_1.encodeExpression(expressionUtils_1.parseExpression(':(')) };
                runCommand(client, 'sleep', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(__assign(__assign({}, expressionUtils_1.parseExpression(':(')), { left: 6 /* Closed */, right: 6 /* Closed */, extra: 2 /* Zzz */ })));
            });
            it('uses default expression if not provided', function () {
                runCommand(client, 'sleep', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(__assign(__assign({}, expressionUtils_1.expression(6 /* Closed */, 6 /* Closed */, 2 /* Neutral */)), { extra: 2 /* Zzz */ })));
            });
            it('closes mouth', function () {
                runCommand(client, 'sleep', ':D', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(__assign(__assign({}, expressionUtils_1.expression(6 /* Closed */, 6 /* Closed */, 2 /* Neutral */)), { extra: 2 /* Zzz */ })));
            });
            it('does nothing if moving', function () {
                client.pony.vx = 1;
                client.pony.options.expr = 123;
                runCommand(client, 'sleep', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(123);
            });
        });
        describe('/cry', function () {
            it('sets expression with tears', function () {
                runCommand(client, 'cry', '>:|', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(__assign(__assign({}, expressionUtils_1.parseExpression('>:|')), { extra: 4 /* Cry */ })));
            });
            it('uses default expression if not provided', function () {
                runCommand(client, 'cry', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(__assign(__assign({}, expressionUtils_1.expression(15 /* Sad */, 15 /* Sad */, 1 /* Frown */)), { extra: 4 /* Cry */ })));
            });
        });
        describe('/smile', function () {
            it('sets expression', function () {
                runCommand(client, 'smile', '', 0 /* Say */, undefined, {});
                chai_1.expect(client.pony.options.expr).equal(expressionEncoder_1.encodeExpression(expressionUtils_1.parseExpression(':)')));
            });
        });
        describe('/yawn', function () {
            it('invokes action', function () {
                runCommand(client, 'yawn', '', 0 /* Say */, undefined, {});
                sinon_1.assert.calledWith(execAction, client, 3 /* Yawn */);
            });
        });
        describe('/m', function () {
            it('send mod message', function () {
                runCommand(client, 'm', 'message', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, 'message', 3 /* Mod */]]);
            });
        });
        describe('/a', function () {
            it('send admin message', function () {
                runCommand(client, 'a', 'message', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([[client.pony.id, 'message', 2 /* Admin */]]);
            });
        });
        describe('/time', function () {
            it('sets world time', function () {
                var setTime = sinon_1.stub(context.world, 'setTime');
                runCommand(client, 'time', '12', 0 /* Say */, undefined, {});
                sinon_1.assert.calledWith(setTime, 12);
            });
            it('does modulo 24 on hour', function () {
                var setTime = sinon_1.stub(context.world, 'setTime');
                runCommand(client, 'time', '26', 0 /* Say */, undefined, {});
                sinon_1.assert.calledWith(setTime, 2);
            });
            it('prints error if args are invalid', function () {
                runCommand(client, 'time', 'foo', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([
                    [client.pony.id, 'invalid parameter', 1 /* System */],
                ]);
            });
        });
        describe('/tp', function () {
            it('fixes location of player', function () {
                var fixPosition = sinon_1.stub(client, 'fixPosition');
                runCommand(client, 'tp', '10 20', 0 /* Say */, undefined, {});
                sinon_1.assert.calledWith(fixPosition, 10, 20, true);
                chai_1.expect(client.pony.x).equal(10);
                chai_1.expect(client.pony.y).equal(20);
            });
            it('updates safe position', function () {
                client.pony.x = 10;
                client.pony.y = 20;
                runCommand(client, 'tp', '10 20', 0 /* Say */, undefined, {});
                chai_1.expect(client.safeX).equal(10);
                chai_1.expect(client.safeY).equal(20);
            });
            it('resets lastTime to zero', function () {
                runCommand(client, 'tp', '10 20', 0 /* Say */, undefined, {});
                chai_1.expect(client.lastTime).equal(0);
            });
            it('throws on invalid parameters', function () {
                runCommand(client, 'tp', '10', 0 /* Say */, undefined, {});
                chai_1.expect(client.saysQueue).eql([
                    [client.pony.id, 'invalid parameters', 1 /* System */],
                ]);
            });
        });
        var placeholderCommands = [
            's', 'say', 'p', 'party', 't', 'think', 'ss', 's1', 's2', 's3', 'sit', 'stand', 'lie', 'lay', 'fly',
            'w', 'whisper', 'r', 'reply',
        ];
        placeholderCommands.forEach(function (command) {
            describe("/" + command, function () {
                it('throws', function () {
                    chai_1.expect(function () { return runCommand(client, command, 'foo bar', 0 /* Say */, undefined, {}); })
                        .throw('Should not be called');
                });
            });
        });
    });
});
//# sourceMappingURL=commands.spec.js.map