import {toolbox} from './blocks.js';

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

    this.add.image(width/2, height/2, 'sprites', 'planet');
    this.add.image(width/2, height/2-128*1.5, 'sprites', 'alienGreen_front');
}