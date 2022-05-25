import {maxInstancesMap, toolbox} from './blocks.js';
import {
    COEFFICIENTS,
    DOOR_HEIGHT,
    EDGE_WIDTH,
    GRAVITY_COEFFICIENT,
    SCALE,
    TILE_SIZE,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from './constants.js';
import {defaultWorld, fixWorldInput, parseWorld} from './world.js';
import {setToOverwrite} from "./editorOverwrite.js";

const urlParams = new URLSearchParams(window.location.search);

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



Object.entries(COEFFICIENTS).forEach(([key, value]) => {
    document.querySelector(`#coefficients input[name='${key}']`).value = value;
});

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
                gravity: {y: GRAVITY_COEFFICIENT * TILE_SIZE},
                debug: urlParams.get('debug') !== null,
            }
        },
        scene: {
            preload,
            create,
            update,
        }
    }),
    get scene() {
        return game.game.scene.getScene('default');
    }
}

function preload() {
    this.load.image('background', 'images/blue_grass.png');
    this.load.atlasXML('sprites', 'images/spritesheet_complete.png', 'images/spritesheet_complete.xml');
    this.load.atlasXML('player', 'images/character_femaleAdventurer_sheetHD.png', 'images/character_femaleAdventurer_sheetHD.xml');
}

const scale = (object) => object.setScale(SCALE).refreshBody();

game.control = {
    jump(type) {
        if (game.running && game.player.body.onFloor()) {
            switch (type) {
                case 'LONG':
                    game.player.setVelocity(game.direction * TILE_SIZE * game.cf.longJumpX, -TILE_SIZE * game.cf.longJumpY);
                    break;
                case 'HIGH':
                    game.player.setVelocity(game.direction * TILE_SIZE * game.cf.highJumpX, -TILE_SIZE * game.cf.highJumpY);
                    break;
            }
            game.state.jumping = true;
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
            case 'left':
                return game.player.flipX;
            case 'RIGHT':
            case 'right':
                return !game.player.flipX;
        }
    },
    isOnGround(groundType) {
        return game.state.groundType === groundType;
    },
    log(string) {
        if (game.running) {
            game.alert.setText(string);
            console.log('USER', string);
            game.hideAlert && game.scene.time.removeEvent(game.hideAlert);
            game.hideAlert = game.scene.time.delayedCall(1000, () => game.alert.setText(''));
        }
    },
    get collectedCoins() {
        return game.coins.countActive(false);
    },
    setGhost(value) {
        if (game.running) {
            game.state.ghost = value;
            game.player.setAlpha(value ? 0.5 : 1);
        }
    },
    get isGhost() {
        return game.state.ghost;
    }
}

function create() {
    this.add.image(width / 2, height / 2, 'background').setDisplaySize(width, height);
    game.alert = this.add.text(16, 16, '', {fontSize: `${TILE_SIZE}px`, fill: '#FF0000'});

    this.anims.create({
        key: 'playerWalk',
        frames: this.anims.generateFrameNames('player', {prefix: 'walk', start: 0, end: 7}),
        frameRate: 15,
        repeat: -1,
    });
    this.anims.create({
        key: 'playerJump',
        frames: [{key: 'player', frame: 'jump'}],
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
    game.markers = this.physics.add.staticGroup();
    game.barriers = this.physics.add.staticGroup();

    const createEdge = (x, y, type) => {
        const edge = this.add.rectangle(x, y-TILE_SIZE, EDGE_WIDTH, TILE_SIZE);
        edge.setData('type', type);
        game.edges.add(edge);
    }

    const entities = parseWorld(world);
    entities.forEach((entity) => {
        const x = entity.x * TILE_SIZE + TILE_SIZE / 2;
        const y2 = entity.y * TILE_SIZE;
        const y = y2 + TILE_SIZE / 2;
        switch (entity.kind) {
            case 'platform':
                scale(game.platforms.create(x, y, 'sprites', `${entity.type}${entity.connection}`)).setData('type', entity.type);
                !entity.left && createEdge(x - TILE_SIZE / 2 + EDGE_WIDTH / 2, y, 'left');
                !entity.right && createEdge(x + TILE_SIZE / 2 - EDGE_WIDTH / 2, y, 'right');
                break;
            case 'coin':
                game.coins.create(x, y, 'sprites', 'coinGold')
                    .setData('grounded', entity.grounded)
                    .setScale(SCALE)
                    .refreshBody()
                    .setSize(TILE_SIZE/3, TILE_SIZE);
                break;
            case 'player':
                game.player = this.physics.add.sprite(x, y2+7, 'player', 'idle')
                    .setScale(0.19)
                    .setSize(164, 200)
                    .setOffset(14, 56)
                break;
            case 'exit':
                game.exits.create(x, y2, 'sprites', 'doorClosed')
                    .setScale(SCALE)
                    .refreshBody()
                    .setSize(TILE_SIZE, DOOR_HEIGHT*SCALE)
                    .setOffset(0, 2*TILE_SIZE - DOOR_HEIGHT*SCALE);
                break;
            case 'marker':
                game.markers.create(x, y, 'sprites', entity.type)
                    .setData('grounded', entity.grounded)
                    .setData('type', entity.type)
                    .setScale(SCALE)
                    .refreshBody()
                    .setSize(TILE_SIZE/3, TILE_SIZE);
                break;
            case 'barrier':
                game.barriers.create(x, y, 'sprites', 'brickBrown').setScale(SCALE).refreshBody();
                break;
            case 'error':
                scale(this.add.image(x, y, 'sprites', 'hudX'));
                break;
        }
    });

    game.player.setDepth(1);
    this.physics.add.collider(game.platforms, game.player, onGround);
    this.physics.add.collider(game.barriers, game.player, onGround, isTangible);
    this.physics.add.overlap(game.player, game.coins, onCoin, isTangible);
    this.physics.add.overlap(game.player, game.markers, onMarker);
    this.physics.add.overlap(game.player, game.exits, exit, null, this);
    this.physics.add.overlap(game.player, game.edges, onEdge);

    this.input.on('pointerdown', () => game.events.onClick());

    game.running = false;
    game.state.starting = true;
    game.state.overlaps = [];

    document.getElementById('game').classList.remove('correct');

    this.scene.pause();
}

function isTangible() {
    return !game.state.ghost;
}

function onGround(player, ground) {
    if (game.player.body.onFloor()) {
        game.player.setVelocityX(game.direction * game.cf.velocity * TILE_SIZE);
        game.state.groundType = ground.getData('type');
        game.state.jumping = false;
    }
}

function update() {
    if (game.player.body.onFloor()) {
        game.player.anims.play('playerWalk', true);

        if (!game.state.onFloor && !game.state.starting) {
            game.events.onLanding();
        }

        game.state.onFloor = true;
        game.state.starting = false;
    } else {
        game.player.anims.play('playerJump', true);

        if (game.player.body.onWall()) {
            game.player.setVelocityY(0);
        }
        if (game.state.onFloor && !game.state.jumping) {
            game.player.setVelocityX(game.direction * TILE_SIZE * game.cf.fallX);
        }

        game.state.groundType = null;
        game.state.onFloor = false;
    }

    game.state.overlaps = game.state.overlaps.filter((overlap) => this.physics.overlap(overlap, game.player));
}

function onCoin(player, coin) {
    const grounded = coin.getData('grounded');
    if (!grounded || player.body.onFloor()) {
        coin.disableBody(true, true);
        game.events.onCoin();
    }
}

function onEdge(player, edge) {
    if (!game.state.overlaps.includes(edge) && game.player.body.onFloor()) {
        game.state.overlaps.push(edge);
        if (game.control.hasDirection(edge.getData('type'))) {
            game.events.onEdge();
        }
    }
}

function exit(player, exit) {
    if (game.coins.countActive(true) === 0) {
        player.disableBody(true, true);
        exit.anims.play('door-open', true);
        const camera = this.cameras.main;
        camera.flash(350);
        camera.once('cameraflashcomplete', () => camera.flash(350));
        document.getElementById('game').classList.add('correct');
    }
}

function onMarker(player, marker) {
    const grounded = marker.getData('grounded');
    if ((!grounded || player.body.onFloor()) && !game.state.overlaps.includes(marker)) {
        game.state.overlaps.push(marker);
        ({
            bush: game.events.onBush,
            cactus: game.events.onCactus,
        })[marker.getData('type')]();
    }
}

function clearEvents() {
    game.events = {
        onCoin: () => {},
        onEdge: () => {},
        onBush: () => {},
        onLanding: () => {},
        onClick: () => {},
        onCactus: () => {},
    }
}

function generateCoefficients() {
    game.cf = Object.fromEntries(Object.keys(COEFFICIENTS).map((key) => [key, document.querySelector(`#coefficients input[name='${key}']`).value]))
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
    try {
        clearEvents();
        generateCoefficients();
        console.log(code);
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

const blocklyEditor = document.getElementById('blockly-editor');
document.getElementById('blockly-export').addEventListener('click', () => {
    const code = Blockly.serialization.workspaces.save(workspace);
    blocklyEditor.value = JSON.stringify(code);
});
document.getElementById('blockly-import').addEventListener('click', () => {
    const code = JSON.parse(blocklyEditor.value);
    Blockly.serialization.workspaces.load(code, workspace)
});
document.getElementById('blockly-clear').addEventListener('click', () => {
    workspace.clear();
});