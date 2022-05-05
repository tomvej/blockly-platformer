import {toolbox} from './blocks.js';
import {TILE_SIZE} from './constants.js';
import {parseWorld, defaultWorld} from './world.js';
import {setToOverwrite} from "./editorOverwrite.js";

const worldEditor = document.getElementById('world-editor');
worldEditor.value = localStorage.getItem('editorValue') ?? defaultWorld;
worldEditor.addEventListener('change', () => {
    localStorage.setItem('editorValue', worldEditor.value);
})
document.getElementById('regenerate').addEventListener('click', () => {
    game.game.scene.start('default');
})
document.getElementById('clear').addEventListener('click', () => {
    worldEditor.value = defaultWorld;
});
setToOverwrite(worldEditor);

const workspace = Blockly.inject('workspace', {toolbox: toolbox});
document.getElementById('start').addEventListener('click', () => {
    game.game.scene.resume('default');
});
document.getElementById('reset').addEventListener('click', () => {
    game.game.scene.start('default');
});

const gameElement = document.getElementById('game')

const width = 2560;
const height = 2048;

const game = {};

game.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: gameElement,
    width: gameElement.offsetWidth,
    height: gameElement.offsetHeight,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false,
        }
    },
    scale: {
        width,
        height,
        mode: Phaser.Scale.FIT,
    },
    scene: {
        preload,
        create,
        update,
    }
});

function preload() {
    this.load.image('background', 'images/blue_grass.png');
    this.load.atlasXML('sprites', 'images/spritesheet_complete.png', 'images/spritesheet_complete.xml');
}

function create() {
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);

    this.anims.create({
        key: 'playerWalk',
        frames: this.anims.generateFrameNames('sprites', {prefix: 'alienGreen_walk', start: 1, end: 2}),
        frameRate: 15,
        repeat: -1,
    });
    this.anims.create({
        key: 'playerJump',
        frames: [{key: 'sprites', frame: 'alienGreen_jump'}],
        frameRate: 15,
    });

    game.platforms = this.physics.add.staticGroup();
    game.coins = this.physics.add.staticGroup();
    game.exits = this.physics.add.staticGroup();

    const entities = parseWorld(worldEditor.value);
    entities.forEach((entity) => {
        const x = entity.x * TILE_SIZE + TILE_SIZE / 2;
        const y2 = entity.y * TILE_SIZE;
        const y = y2 + TILE_SIZE / 2;
        switch (entity.type) {
            case 'platform':
                game.platforms.create(x, y, 'sprites', `grass${entity.connection}`);
                break;
            case 'coin':
                game.coins.create(x, y, 'sprites', 'coinGold');
                break;
            case 'player':
                game.player = this.physics.add.sprite(x, y2, 'sprites', 'alienGreen_front');
                break;
            case 'exit':
                game.exits.create(x, y2, 'sprites', 'doorClosed');
                break;
            case 'error':
                this.add.image(x, y, 'sprites', 'hudX');
        }
    });

    game.player.setCollideWorldBounds(true);
    this.physics.add.collider(game.platforms, game.player);
    this.physics.add.overlap(game.player, game.coins, collectCoin);

    this.scene.pause();
}

function update() {
    if (game.player.body.touching.down) {
        if (game.player.flipX) {
            game.player.setVelocityX(-320);
        } else {
            game.player.setVelocityX(320);
        }
        game.player.anims.play('playerWalk', true);
    } else {
        game.player.anims.play('playerJump', true);
    }

}

function collectCoin(player, coin, ) {
    coin.disableBody(true, true);
    player.toggleFlipX();
}