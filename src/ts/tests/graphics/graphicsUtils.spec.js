"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("../lib");
var path = require("path");
var rect_1 = require("../../common/rect");
var graphicsUtils_1 = require("../../graphics/graphicsUtils");
var contextSpriteBatch_1 = require("../../graphics/contextSpriteBatch");
var colors_1 = require("../../common/colors");
var mocks_1 = require("../mocks");
var paths_1 = require("../../server/paths");
var sprites_1 = require("../../generated/sprites");
var ponyInfo_1 = require("../../common/ponyInfo");
var baseFilePath = paths_1.pathTo('src', 'tests', 'graphics');
var palettes = graphicsUtils_1.createCommonPalettes(ponyInfo_1.mockPaletteManager);
var created = Date.now();
function test(file, draw) {
    return function () {
        var filePath = path.join(baseFilePath, file);
        var expected = lib_1.loadImageAsCanvas(filePath);
        var actual = contextSpriteBatch_1.drawCanvas(100, 50, sprites_1.paletteSpriteSheet, undefined, draw);
        lib_1.compareCanvases(expected, actual, filePath, 'graphics');
    };
}
describe('graphicsUtils', function () {
    before(lib_1.loadSprites);
    before(function () { return lib_1.clearCompareResults('graphics'); });
    describe('drawBaloon()', function () {
        it('draws regular text', test('hello.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'hello', created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('draws regular text with emoji', test('hello-apple.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'hello 🍎', created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('draws text with new lines', test('newline.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'hello\nworld!', created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('does not draw if outside bounds', test('outside.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'cant see me', created: created }, 50, 25, rect_1.rect(0, 0, 10, 10), palettes);
        }));
        it('draws party message', test('party.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'party', type: 4 /* Party */, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('draws moderator message', test('mod.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'moderator', type: 3 /* Mod */, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('draws admin message', test('admin.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'admin', type: 2 /* Admin */, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('draws supporter1 message', test('sup1.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'supporter 1', type: 9 /* Supporter1 */, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('draws supporter2 message', test('sup2.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'supporter 2', type: 10 /* Supporter2 */, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('draws supporter3 message', test('sup3.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'supporter 3', type: 11 /* Supporter3 */, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('draws announcement message', test('announcement.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'announcement', type: 7 /* Announcement */, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('draws party announcement message', test('party-announcement.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'announcement', type: 8 /* PartyAnnouncement */, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('draws system message', test('system.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'system', type: 1 /* System */, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('draws thinking bubble', test('thinking.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'thinking...', type: 5 /* Thinking */, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('draws party thinking bubble', test('party-thinking.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'party thinking...', type: 6 /* PartyThinking */, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('fades in text bubble (time: 10)', test('fade-in-0.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'fade', timer: 10, total: 10, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('fades in text bubble (time: 9.95)', test('fade-in-1.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'fade', timer: 9.95, total: 10, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('fades in text bubble (time: 9.7)', test('fade-in-2.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'fade', timer: 9.7, total: 10, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('fades out text bubble (time: 0)', test('fade-out-0.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'fade', timer: 0, total: 10, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('fades out text bubble (time: 0.05)', test('fade-out-1.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'fade', timer: 0.05, total: 10, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        it('fades out text bubble (time: 0.3)', test('fade-out-2.png', function (batch) {
            graphicsUtils_1.drawBaloon(batch, { message: 'fade', timer: 0.3, total: 10, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
        }));
        var chatTypes = [
            ['chat', 0 /* Chat */],
            ['think', 5 /* Thinking */],
        ];
        chatTypes.forEach(function (_a) {
            var name = _a[0], type = _a[1];
            it("breaks words on small screen (" + name + ")", test("break-" + name + ".png", function (batch) {
                graphicsUtils_1.drawBaloon(batch, { message: 'too long to fit in one line', type: type, created: created }, 50, 25, rect_1.rect(0, 0, 100, 100), palettes);
            }));
            it("moves ballon right to fit on screen (" + name + ")", test("move-right-" + name + ".png", function (batch) {
                graphicsUtils_1.drawBaloon(batch, { message: 'too long to fit', type: type, created: created }, 25, 25, rect_1.rect(0, 0, 100, 100), palettes);
            }));
            it("moves ballon left to fit on screen (" + name + ")", test("move-left-" + name + ".png", function (batch) {
                graphicsUtils_1.drawBaloon(batch, { message: 'too long to fit', type: type, created: created }, 75, 25, rect_1.rect(0, 0, 100, 100), palettes);
            }));
            it("does not move baloon originating from outside bounds (" + name + ")", test("outside-" + name + ".png", function (batch) {
                graphicsUtils_1.drawBaloon(batch, { message: 'too long to fit', type: type, created: created }, -25, 25, rect_1.rect(0, 0, 100, 100), palettes);
            }));
            it("adjusts nipple when moving baloon (" + name + ")", test("move-right-nipple-" + name + ".png", function (batch) {
                graphicsUtils_1.drawBaloon(batch, { message: 'too long to fit', type: type, created: created }, 1, 25, rect_1.rect(0, 0, 100, 100), palettes);
            }));
        });
    });
    describe('drawBounds()', function () {
        it('draws bounds', test('bounds.png', function (batch) {
            graphicsUtils_1.drawBounds(batch, mocks_1.entity(0, 0.1, 0.2), rect_1.rect(5, 6, 25, 20), colors_1.ORANGE);
        }));
        it('draws nothing if rect is missing', test('bounds-none.png', function (batch) {
            graphicsUtils_1.drawBounds(batch, mocks_1.entity(0, 0.1, 0.2), undefined, colors_1.ORANGE);
        }));
    });
    describe('drawOutline()', function () {
        it('draws outline', test('outline.png', function (batch) {
            graphicsUtils_1.drawOutline(batch, colors_1.ORANGE, 10, 15, 30, 20);
        }));
    });
    describe('drawNamePlate()', function () {
        it('draws name', test('name.png', function (batch) {
            graphicsUtils_1.drawNamePlate(batch, 'name', 50, 25, graphicsUtils_1.DrawNameFlags.None, palettes, undefined);
        }));
        it('draws name with emoji', test('name-apple.png', function (batch) {
            graphicsUtils_1.drawNamePlate(batch, 'name 🍎', 50, 25, graphicsUtils_1.DrawNameFlags.None, palettes, undefined);
        }));
        it('draws party member name', test('name-party.png', function (batch) {
            graphicsUtils_1.drawNamePlate(batch, 'party', 50, 25, graphicsUtils_1.DrawNameFlags.Party, palettes, undefined);
        }));
        var tags = ['mod', 'dev', 'sup1', 'sup2', 'sup3'];
        tags.forEach(function (tag) { return it("draws name with " + tag + " tag", test("name-" + tag + ".png", function (batch) {
            graphicsUtils_1.drawNamePlate(batch, "A " + tag, 50, 25, graphicsUtils_1.DrawNameFlags.None, palettes, tag);
        })); });
    });
    describe('drawPixelText()', function () {
        it('draws numbers', test('pixel-numbers.png', function (batch) {
            graphicsUtils_1.drawPixelText(batch, 20, 20, 0x20B2AAff, '0 123456789X');
        }));
    });
});
//# sourceMappingURL=graphicsUtils.spec.js.map