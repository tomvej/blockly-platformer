import {toolbox} from './blocks.js';

const workspace = Blockly.inject('workspace', {toolbox: toolbox});
document.getElementById('start').addEventListener('click', () => {

});
document.getElementById('reset').addEventListener('click', () => {

});

const gameElement = document.getElementById('game')
const width = gameElement.offsetWidth;
const height = gameElement.offsetHeight;

new Phaser.Game({
    type: Phaser.AUTO,
    parent: gameElement,
    width,
    height,
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
}