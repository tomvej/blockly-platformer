import {toolbox} from './blocks.js';

const WORLD_WIDTH = 20;
const WORLD_HEIGHT = 16;
const TILE_SIZE = 128;
const TILE_EMPTY = ' ';
const TILE_PLATFORM = '=';
const TILE_COIN = 'o';
const TILE_EXIT = '@';
const TILE_PLAYER = '&';

// 20x16
const world = `
  o   &      @
====================
`.split('\n').slice(1,-1).join('\n');

function parseWorld(worldString) {
    const result = Array(WORLD_HEIGHT);
    const lines = worldString.split('\n').map((line) => line.split(''));

    if (lines.length < WORLD_HEIGHT) {
        console.warn(`Game world has too few rows (${lines.length}, expected ${WORLD_HEIGHT}). Topmost rows will be blank.`);
    } else if (lines.length > WORLD_HEIGHT) {
        console.warn(`Game world has too many rows (${lines.length}, expected ${WORLD_HEIGHT}). Topmost rows will be dropped.`);
    }

    for (let y = 1; y <= WORLD_HEIGHT; y++) {
        const row = Array(WORLD_WIDTH);
        result[WORLD_HEIGHT-y] = row;
        if (y > lines.length) {
            row.fill(TILE_EMPTY);
        } else {
            const line = lines[lines.length - y];
            if (line.length < WORLD_WIDTH) {
                console.warn(`Game world has too few columns on line ${lines.length - y} (${line.length}, expected ${WORLD_WIDTH}). Rightmost columns will be blank.`);
            } else if (line.length > WORLD_WIDTH) {
                console.warn(`Game world has too many columns on line ${lines.length - y} (${line.length}, expected ${WORLD_WIDTH}). Rightmost columns will be dropped.`);
            }

            for (let x = 0; x < WORLD_WIDTH; x++) {
                if (x >= line.length) {
                    row[x] = TILE_EMPTY;
                } else {
                    row[x] = line[x];
                }
            }
        }
    }
    return result;
}

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

    const tiles = parseWorld(world);

    for (let y = 0; y < WORLD_HEIGHT; y++) {
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const tile = tiles[y][x];
            const xPos = x * TILE_SIZE + TILE_SIZE / 2;
            const yPos = y * TILE_SIZE + TILE_SIZE / 2;
            if (tile === TILE_PLATFORM) {
                const left = x === 0 || tiles[y][x - 1] === TILE_PLATFORM;
                const right = x === WORLD_WIDTH - 1 || tiles[y][x + 1] === TILE_PLATFORM;
                let image = 'grass';
                if (left && right) {
                    image = 'grassMid';
                } else if (left) {
                    image = 'grassRight';
                } else if (right) {
                    image = 'grassLeft';
                }
                this.add.image(xPos, yPos, 'sprites', image);
            } else if (tile === TILE_COIN) {
                this.add.image(xPos, yPos, 'sprites', 'coinGold');
            } else if (tile === TILE_EXIT) {
                if (y === 0 || tiles[y - 1][x] !== ' ') {
                    throw new Error('Tile above the door must be empty');
                }
                this.add.image(xPos, yPos, 'sprites', 'doorClosed_mid');
                this.add.image(xPos, yPos - TILE_SIZE, 'sprites', 'doorClosed_top');
            } else if (tile === TILE_PLAYER) { // player
                if (y === 0 || tiles[y - 1][x] !== ' ') {
                    throw new Error('Player must have free space above him.');
                }
                this.add.image(xPos, yPos - TILE_SIZE / 2, 'sprites', 'alienGreen_front');
            }
        }
    }
}