import {Builder, By} from "selenium-webdriver";

const sleep = async (time) => new Promise((resolve) => setTimeout(resolve, time));

const world = `
....................
....................
....................
....................
....................
....................
....................
....................
....................
....................
...........o........
....===...===.......
....................
.a.k..............e.
====================
....................
`.trim();

const blocks = '{"blocks":{"languageVersion":0,"blocks":[{"type":"events_edge","id":"^^Vh|*kT70ukEPrp!EyG","x":57,"y":34,"next":{"block":{"type":"actions_jump","id":"MF|#Qy[p1(Vl+KM@t5L+","fields":{"TYPE":"LONG"}}}},{"type":"events_bush","id":"0^oJ:r@f/FUHYVW7rZ1k","x":206,"y":37,"next":{"block":{"type":"actions_jump","id":"{NGD}GK19%xZ5lZv^GZt","fields":{"TYPE":"HIGH"}}}}]}}';

(async function test() {
    try {
        const driver = await new Builder().forBrowser('firefox').build();
        try {
            await driver.get('http://localhost:8080');

            const worldEditor = await driver.findElement(By.id('world-editor'));
            const regenerateWorld = await driver.findElement(By.id('regenerate'));
            const blocklyEditor = await driver.findElement(By.id('blockly-editor'));
            const importBlocks = await driver.findElement(By.id('blockly-import'));
            const start = await driver.findElement(By.id('start'));
            const reset = await driver.findElement(By.id('reset'));

            await worldEditor.clear();
            await worldEditor.sendKeys(world);
            await regenerateWorld.click();

            await blocklyEditor.clear();
            await blocklyEditor.sendKeys(blocks);
            await importBlocks.click();

            await reset.click();
            await start.click();

            await sleep(15000);


        } finally {
            await driver.quit();
        }
    } catch (err) {
        console.error(err);
    }
})();