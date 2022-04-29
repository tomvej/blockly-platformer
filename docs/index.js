import {toolbox} from './blocks.js';

const workspace = Blockly.inject('workspace', {toolbox: toolbox});
document.getElementById('start').addEventListener('click', () => {

});
document.getElementById('reset').addEventListener('click', () => {

});

const gameElement = document.getElementById('game')
new Phaser.Game({
    type: Phaser.AUTO,
    parent: gameElement,
    width: gameElement.offsetWidth,
    height: gameElement.offsetHeight,
});