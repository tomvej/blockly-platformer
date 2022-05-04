import {toolbox} from './blocks.js';
import {TILE_SIZE} from './constants.js';
import {parseWorld} from './world.js';

// 20x16
const world = `
  o   &      @
====================
`.split('\n').slice(1,-1).join('\n');

const workspace = Blockly.inject('workspace', {toolbox: toolbox});
document.getElementById('start').addEventListener('click', () => {

});
document.getElementById('reset').addEventListener('click', () => {

});

const gameElement = document.getElementById('game')

const width = 2560;
const height = 2048;

new Phaser.Game({
    type: Phaser.AUTO,
    parent: gameElement,
    width: gameElement.offsetWidth,
    height: gameElement.offsetHeight,
    scale: {
        width,
        height,
        mode: Phaser.Scale.FIT,
    },
    scene: {
        preload,
        create,
    }
});

function preload() {
    this.load.image('background', 'images/blue_grass.png');
    this.load.atlasXML('sprites', 'images/spritesheet_complete.png', 'images/spritesheet_complete.xml');
}

function create() {
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

    const entities = parseWorld(world);
    entities.forEach((entity) => {
        const x = entity.x * TILE_SIZE + TILE_SIZE / 2;
        const y2 = entity.y * TILE_SIZE;
        const y = y2 + TILE_SIZE / 2;
        switch (entity.type) {
            case 'platform':
                this.add.image(x, y, 'sprites', `grass${entity.connection}`);
                break;
            case 'coin':
                this.add.image(x, y, 'sprites', 'coinGold');
                break;
            case 'player':
                this.add.image(x, y2, 'sprites', 'alienGreen_front');
                break;
            case 'exit':
                this.add.image(x, y2, 'sprites', 'doorClosed');
                break;
            case 'error':
                this.add.image(x, y, 'sprites', 'hudX');
        }
    });
}