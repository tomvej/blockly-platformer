import {Builder, By} from 'selenium-webdriver';
import {readdir} from 'fs/promises';
import path from 'path';

const sleep = async (time) => new Promise((resolve) => setTimeout(resolve, time));

(async function test() {
    try {
        const tests = await readdir('test');

        const driver = await new Builder().forBrowser('firefox').build();
        const unsuccessful = [];
        try {
            await driver.get('http://localhost:8080');

            const worldEditor = await driver.findElement(By.id('world-editor'));
            const regenerateWorld = await driver.findElement(By.id('regenerate'));
            const blocklyEditor = await driver.findElement(By.id('blockly-editor'));
            const importBlocks = await driver.findElement(By.id('blockly-import'));
            const start = await driver.findElement(By.id('start'));
            const reset = await driver.findElement(By.id('reset'));
            const game = await driver.findElement(By.id('game'));

            for (let test of tests) {
                try {
                    const {world, solution} = await import(path.resolve('test', test));

                    console.log(`Testing ${test} ...`);

                    await worldEditor.clear();
                    await worldEditor.sendKeys(world.trim());
                    await regenerateWorld.click();

                    await blocklyEditor.clear();
                    await blocklyEditor.sendKeys(solution);
                    await importBlocks.click();

                    await reset.click();
                    await start.click();

                    await driver.wait(async () => {
                        const className = await game.getAttribute('class');
                        return className.includes('correct');
                    }, 45000, 'Simulation would not succeed in 45 s.');

                    console.log(`Test successful for ${test}.`);
                } catch (e) {
                    console.error(e);
                    unsuccessful.push([test, e.message]);
                }
            }

            if (unsuccessful.length) {
                console.log('Test failed for:')
                for (let failure of unsuccessful) {
                    console.log(`\t${failure[0]}: ${failure[1]}`);
                }
            } else {
                console.log('Test successful!');
            }

        } finally {
            await driver.quit();
        }
    } catch (err) {
        console.error(err);
    }
})();