import {toolbox} from './blocks.js';

const WORLD_WIDTH = 20;
const WORLD_HEIGHT = 16;
const DEFAULT_TILE = ' ';

// 20x16
const world = `                    
                  
                    
                                        
                    
                    
                    
                    
                    
                    
                    
                    
                    
====================`;

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
        if (y >= lines.length) {
            row.fill(DEFAULT_TILE);
        } else {
            const line = lines[lines.length - y];
            if (line.length < WORLD_WIDTH) {
                console.warn(`Game world has too few columns on line ${lines.length - y} (${line.length}, expected ${WORLD_WIDTH}). Rightmost columns will be blank.`);
            } else if (line.length > WORLD_WIDTH) {
                console.warn(`Game world has too many columns on line ${lines.length - y} (${line.length}, expected ${WORLD_WIDTH}). Rightmost columns will be dropped.`);
            }

            for (let x = 0; x < WORLD_WIDTH; x++) {
                if (x >= line.length) {
                    row[x] = DEFAULT_TILE;
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
    this.add.image(width/2, height/2, 'background').setDisplaySize(width, height);

    const parsed = parseWorld(world);
    console.log(parsed);

    this.add.image(width/2, height/2, 'sprites', 'planet');
    this.add.image(width/2, height/2-128*1.5, 'sprites', 'alienGreen_front');
}