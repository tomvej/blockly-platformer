import {maxInstancesMap, toolbox} from './blocks.js';
import {PLAYER_HEIGHT, SCALE, TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH} from './constants.js';
import {defaultWorld, parseWorld} from './world.js';
import {setToOverwrite} from "./editorOverwrite.js";

const worldEditor = document.getElementById('world-editor');
let world = localStorage.getItem('editorValue') ?? defaultWorld;
worldEditor.value = world;
worldEditor.addEventListener('change', () => {
    localStorage.setItem('editorValue', worldEditor.value);
})
document.getElementById('regenerate').addEventListener('click', () => {
    world = worldEditor.value;
    game.game.scene.start('default');
})
document.getElementById('clear').addEventListener('click', () => {
    worldEditor.value = defaultWorld;
});
setToOverwrite(worldEditor);

const width = WORLD_WIDTH * TILE_SIZE;
const height = WORLD_HEIGHT * TILE_SIZE;

const game = {};

game.game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: document.getElementById('game'),
    width: width,
    height: height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 300},
            debug: false,
        }
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

const scale = (object) => object.setScale(SCALE).refreshBody();

game.control = {
    jump() {
        if (game.running && game.player.body.onFloor()) {
            game.player.setVelocityY(-240);
        }
    },
    turn() {
        if (game.running && game.player.body.onFloor()) {
            game.player.toggleFlipX();
        }
    }
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
    this.anims.create({
        key: 'door-open',
        frames: [{key: 'sprites', frame: 'doorOpen'}],
        frameRate: 15,
    });

    game.platforms = this.physics.add.staticGroup();
    game.edges = this.physics.add.staticGroup();
    game.coins = this.physics.add.staticGroup();
    game.exits = this.physics.add.staticGroup();

    const createEdge = (x, y, type) => {
        const edge = this.add.rectangle(x, y-TILE_SIZE, 10, TILE_SIZE);
        edge.setData('type', type);
        game.edges.add(edge);
    }

    const entities = parseWorld(world);
    entities.forEach((entity) => {
        const x = entity.x * TILE_SIZE + TILE_SIZE / 2;
        const y2 = entity.y * TILE_SIZE;
        const y = y2 + TILE_SIZE / 2;
        switch (entity.type) {
            case 'platform':
                scale(game.platforms.create(x, y, 'sprites', `grass${entity.connection}`))
                !entity.left && createEdge(x - TILE_SIZE / 2, y, 'left');
                !entity.right && createEdge(x + TILE_SIZE / 2, y, 'right');
                break;
            case 'coin': {
                const coin = scale(game.coins.create(x, y, 'sprites', 'coinGold'));
                coin.setData('grounded', entity.grounded);
            }
                break;
            case 'player':
                game.player = this.physics.add.sprite(x, y2, 'sprites', 'alienGreen_front')
                    .setScale(SCALE).setSize(null, PLAYER_HEIGHT).setOffset(0, -2*TILE_SIZE + PLAYER_HEIGHT).refreshBody();
                break;
            case 'exit':
                scale(game.exits.create(x, y2, 'sprites', 'doorClosed'));
                break;
            case 'error':
                scale(this.add.image(x, y, 'sprites', 'hudX'));
        }
    });

    game.player.setDepth(1);
    game.player.setCollideWorldBounds(true);
    this.physics.add.collider(game.platforms, game.player);
    this.physics.add.overlap(game.player, game.coins, collectCoin);
    this.physics.add.overlap(game.player, game.edges, jumpOnEdge);
    this.physics.add.overlap(game.player, game.exits, exit, null, this);

    game.running = false;
    this.scene.pause();
}

function update() {
    if (game.player.body.onFloor()) {
        if (game.player.flipX) {
            game.player.setVelocityX(-160);
        } else {
            game.player.setVelocityX(160);
        }
        game.player.anims.play('playerWalk', true);
    } else {
        game.player.anims.play('playerJump', true);
    }

}

function collectCoin(player, coin) {
    const grounded = coin.getData('grounded');
    if (!grounded || player.body.onFloor()) {
        coin.disableBody(true, true);
    }
    game.events.onCoin();
}

function jumpOnEdge(player, edge) {
    const type = edge.getData('type');
    const touching = player.body.touching;

    if (player.body.onFloor() && ((type === 'left' && touching.left) || (type === 'right' && touching.right))) {
        game.events.onEdge();
    }
}

function exit(player, exit) {
    if (game.coins.countActive(true) === 0) {
        player.disableBody(true, true);
        exit.anims.play('door-open', true);
        const camera = this.cameras.main;
        camera.flash(350);
        camera.once('cameraflashcomplete', () => camera.flash(350));
    }
}

function clearEvents() {
    game.events = {
        onCoin: () => {},
        onEdge: () => {},
    }
}

const workspace = Blockly.inject('workspace', {
    toolbox,
    maxInstances: maxInstancesMap,
});
workspace.addChangeListener(() => {
    const blocks = Blockly.serialization.workspaces.save(workspace);
    localStorage.setItem('workspaceValue', JSON.stringify(blocks));
});
try {
    const blocks = localStorage.getItem('workspaceValue');
    if (blocks) {
        Blockly.serialization.workspaces.load(JSON.parse(blocks), workspace);
    }
} catch (e) {
    console.error(e);
}

document.getElementById('start').addEventListener('click', () => {
    const code = Blockly.JavaScript.workspaceToCode(workspace);
    console.log(code);
    try {
        clearEvents();
        eval(code);
        game.running = true;
        game.game.scene.resume('default');
    } catch (e) {
        console.error('Cannot start', e);
    }
});
document.getElementById('reset').addEventListener('click', () => {
    game.game.scene.start('default');
});