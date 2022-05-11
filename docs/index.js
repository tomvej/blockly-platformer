import {maxInstancesMap, toolbox} from './blocks.js';
import {PLAYER_HEIGHT, SCALE, TILE_SIZE, WORLD_HEIGHT, WORLD_WIDTH} from './constants.js';
import {defaultWorld, fixWorldInput, parseWorld} from './world.js';
import {setToOverwrite} from "./editorOverwrite.js";

const worldEditor = document.getElementById('world-editor');
let world = localStorage.getItem('editorValue') ?? defaultWorld;
worldEditor.value = world;
document.getElementById('regenerate').addEventListener('click', () => {
    world = worldEditor.value;
    localStorage.setItem('editorValue', worldEditor.value);
    game.game.scene.start('default');
})
document.getElementById('clear').addEventListener('click', () => {
    worldEditor.value = defaultWorld;
});
document.getElementById('repair').addEventListener('click', () => {
    worldEditor.value = fixWorldInput(worldEditor.value);
});
setToOverwrite(worldEditor, fixWorldInput);

const width = WORLD_WIDTH * TILE_SIZE;
const height = WORLD_HEIGHT * TILE_SIZE;

const game = {
    get direction() {
        return game.player.flipX ? -1 : 1;
    },
    state: {},
    game: new Phaser.Game({
        type: Phaser.AUTO,
        parent: document.getElementById('game'),
        width: width,
        height: height,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {y: 300},
                debug: true,
            }
        },
        scene: {
            preload,
            create,
            update,
        }
    }),
}

function preload() {
    this.load.image('background', 'images/blue_grass.png');
    this.load.atlasXML('sprites', 'images/spritesheet_complete.png', 'images/spritesheet_complete.xml');
}

const scale = (object) => object.setScale(SCALE).refreshBody();

game.control = {
    jump(type) {
        if (game.running && game.player.body.onFloor()) {
            switch (type) {
                case 'LONG':
                    game.player.setVelocity(game.direction * 160, -120);
                    break;
                case 'HIGH':
                    game.player.setVelocity(game.direction * 60, -260);
                    break;
            }
        }
    },
    turn() {
        if (game.running && game.player.body.onFloor()) {
            game.player.toggleFlipX();
        }
    },
    hasDirection(direction) {
        switch(direction) {
            case 'LEFT':
                return game.player.flipX;
            case 'RIGHT':
                return !game.player.flipX;
        }
    },
    isOnGround(groundType) {
        return game.state.groundType === groundType;
    },
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
    game.bushes = this.physics.add.staticGroup();

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
                scale(game.platforms.create(x, y, 'sprites', `${entity.kind}${entity.connection}`)).setData('kind', entity.kind);
                !entity.left && createEdge(x - TILE_SIZE / 2, y, 'left');
                !entity.right && createEdge(x + TILE_SIZE / 2, y, 'right');
                break;
            case 'coin':
                game.coins.create(x, y, 'sprites', 'coinGold')
                    .setData('grounded', entity.grounded)
                    .setScale(SCALE)
                    .refreshBody()
                    .body.setSize(10, TILE_SIZE);
                break;
            case 'player':
                game.player = this.physics.add.sprite(x, y2, 'sprites', 'alienGreen_front')
                    .setScale(SCALE)
                    .setSize(null, PLAYER_HEIGHT)
                    .setOffset(0, -2*TILE_SIZE + PLAYER_HEIGHT)
                    .refreshBody();
                break;
            case 'exit':
                scale(game.exits.create(x, y2, 'sprites', 'doorClosed'));
                break;
            case 'bush': {
                game.bushes.create(x, y, 'sprites', 'bush')
                    .setData('grounded', entity.grounded)
                    .setScale(SCALE)
                    .refreshBody()
                    .body.setSize(10, TILE_SIZE);
            }break;
            case 'error':
                scale(this.add.image(x, y, 'sprites', 'hudX'));
                break;
        }
    });

    game.player.setDepth(1);
    this.physics.add.collider(game.platforms, game.player, onGround);
    this.physics.add.overlap(game.player, game.coins, onCoin);
    this.physics.add.overlap(game.player, game.edges, onEdge);
    this.physics.add.overlap(game.player, game.exits, exit, null, this);
    this.physics.add.overlap(game.player, game.bushes, onBush);

    game.running = false;
    this.scene.pause();
}

function onGround(player, ground) {
    game.player.setVelocityX(game.direction * 160);
    game.state.groundType = ground.getData('kind');
}

function update() {
    if (game.player.body.onFloor()) {
        game.player.anims.play('playerWalk', true);
    } else {
        game.player.anims.play('playerJump', true);
        game.state.groundType = null;
    }
    if (game.state.edge && !this.physics.overlap(game.player, game.state.edge)) {
        game.state.edge = null;
    }
    if (game.state.bush && !this.physics.overlap(game.player, game.state.bush)) {
        game.state.bush = null;
    }
}

function onCoin(player, coin) {
    const grounded = coin.getData('grounded');
    if (!grounded || player.body.onFloor()) {
        coin.disableBody(true, true);
    }
    game.events.onCoin();
}

function onEdge(player, edge) {
    const type = edge.getData('type');
    const touching = player.body.touching;

    if (player.body.onFloor() && game.state.edge !== edge && ((type === 'left' && touching.left) || (type === 'right' && touching.right))) {
        game.events.onEdge();
    }
    game.state.edge = edge;
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

function onBush(player, bush) {
    const grounded = bush.getData('grounded');
    if (!grounded || player.body.onFloor()) {
        if (game.state.bush !== bush) {
            game.events.onBush();
        }
        game.state.bush = bush;
    }
}

function clearEvents() {
    game.events = {
        onCoin: () => {},
        onEdge: () => {},
        onBush: () => {},
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