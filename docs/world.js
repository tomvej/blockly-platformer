import {
    GROUND_TILES, TILE_BARRIER,
    TILE_BUSH,
    TILE_CACTUS,
    TILE_COIN,
    TILE_EMPTY,
    TILE_EXIT,
    TILE_GRASS,
    TILE_PLAYER,
    TILE_SAND,
    TILE_STONE,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "./constants.js";

export const defaultWorld = `${TILE_EMPTY.repeat(20)}\n`.repeat(16).trim();

function checkWorldSize(rows) {
    if (rows.length < WORLD_HEIGHT) {
        console.warn(`Game world has too few rows (${rows.length}, expected ${WORLD_HEIGHT}). Topmost rows will be blank.`);
    } else if (rows.length > WORLD_HEIGHT) {
        console.warn(`Game world has too many rows (${rows.length}, expected ${WORLD_HEIGHT}). Topmost rows will be dropped.`);
    }

    rows.forEach((row, i) => {
        if (row.length < WORLD_WIDTH) {
            console.warn(`Game world has too few columns on line ${i} (${row.length}, expected ${WORLD_WIDTH}). Rightmost columns will be blank.`);
        } else if (row.length > WORLD_WIDTH) {
            console.warn(`Game world has too many columns on line ${i} (${row.length}, expected ${WORLD_WIDTH}). Rightmost columns will be dropped.`);
        }
    });
}

const createGetTile = (rows) => function tile(x, y) {
    if (x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) {
        return TILE_EMPTY;
    } else {
        const rowNumber = rows.length - (WORLD_HEIGHT - y);
        if (rowNumber < 0 || x >= rows[rowNumber].length) {
            return TILE_EMPTY;
        } else {
            return rows[rowNumber].charAt(x);
        }
    }
}

function printWorld(getTile) {
    let text = '';
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        text += '|';
        for (let x = 0; x < WORLD_WIDTH; x++) {
            text += getTile(x, y);
        }
        text += '|\n';
    }
    console.log(text);
}


export function parseWorld(worldString) {
    console.group('World parsing');
    const rows = worldString.split('\n');
    checkWorldSize(rows);
    const tile = createGetTile(rows);

    const entities = [];
    let hasPlayer = false;
    for (let x = 0; x <= WORLD_WIDTH; x++) {
        for (let y = 0; y <= WORLD_HEIGHT; y++) {
            if (GROUND_TILES.includes(tile(x,y))) {
                if (GROUND_TILES.includes(tile(x,y-1)) || GROUND_TILES.includes(tile(x,y-2))) {
                    console.warn(`Platform on [${x},${y}] has another platform too close above it. There must be at least two spaces above a platform in order for the player to fit.`);
                }

                const type = {
                    [TILE_GRASS]: 'grass',
                    [TILE_SAND]: 'sand',
                    [TILE_STONE]: 'stone',
                }[tile(x, y)];

                const leftConnection = GROUND_TILES.includes(tile(x-1,y)) || x === 0;
                const rightConnection = GROUND_TILES.includes(tile(x+1,y)) || x === WORLD_WIDTH - 1;
                let connection = '';
                if (leftConnection && rightConnection) {
                    connection = 'Mid';
                } else if (leftConnection) {
                    connection = 'Right';
                } else if (rightConnection) {
                    connection = 'Left';
                }
                const left = leftConnection || GROUND_TILES.includes(tile(x-1, y-1));
                const right = rightConnection || GROUND_TILES.includes(tile(x+1,y-1));
                entities.push({kind: 'platform', x, y, connection, left, right, type});
            } else if (TILE_COIN === tile(x,y)) {
                const grounded = GROUND_TILES.includes(tile(x,y+1));
                entities.push({kind: 'coin', x, y, grounded});
            } else if (TILE_EXIT === tile(x,y)) {
                if (tile(x,y-1) !== TILE_EMPTY) {
                    console.error(`Exit on [${x},${y}] has another object directly above it! Exit is always two spaces high.`);
                    entities.push({kind: 'error', x, y});
                } else {
                    entities.push({kind: 'exit', x, y});
                }
            } else if (TILE_PLAYER === tile(x,y)) {
                if (tile(x,y-1) !== TILE_EMPTY) {
                    console.error(`Player on [${x},${y}] has another object directly above it! Player is always two spaces high.`);
                    entities.push({kind: 'error', x, y});
                } else if (hasPlayer) {
                    console.error(`There can be only one player! Extra player on [${x},${y}].`)
                    entities.push({kind: 'error', x, y});
                } else {
                    hasPlayer = true;
                    entities.push({kind: 'player', x, y});
                }
            } else if (TILE_BUSH === tile(x, y)) {
                const grounded = GROUND_TILES.includes(tile(x,y+1));
                entities.push({kind: 'marker', type: 'bush', x, y, grounded});
            } else if (TILE_CACTUS === tile(x, y)) {
                const grounded = GROUND_TILES.includes(tile(x,y+1));
                entities.push({kind: 'marker', type: 'cactus', x, y, grounded});
            } else if (TILE_BARRIER === tile(x, y)) {
                entities.push({kind: 'barrier', x, y});
            }
        }
    }

    if (!hasPlayer) {
        console.error('There is no player! The game can\'t start!');
    }

    console.groupEnd();
    return entities;
}

export function fixWorldInput(worldString) {
    console.group('World input');
    const rows = worldString.split('\n');
    if (rows[rows.length - 1] === '') {
        rows.pop();
    }
    checkWorldSize(rows);
    const getTile = createGetTile(rows);
    printWorld(getTile);

    const output = [];
    for (let y = 0; y < WORLD_HEIGHT; y++) {
        let row = '';
        for (let x = 0; x < WORLD_WIDTH; x++) {
            row += getTile(x, y);
        }
        output.push(row);
    }

    console.groupEnd();
    return output.join('\n');
}