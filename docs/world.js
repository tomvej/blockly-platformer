import {
    GROUND_TILES,
    TILE_BUSH,
    TILE_COIN,
    TILE_EMPTY,
    TILE_EXIT,
    TILE_GRASS,
    TILE_PLAYER,
    WORLD_HEIGHT,
    WORLD_WIDTH
} from "./constants.js";

export const defaultWorld = `${`${TILE_EMPTY.repeat(20)}\n`.repeat(15)}${TILE_GRASS.repeat(20)}`

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
            if (TILE_GRASS === tile(x,y)) {
                if (GROUND_TILES.includes(tile(x,y-1)) || GROUND_TILES.includes(tile(x,y-2))) {
                    console.warn(`Platform on [${x},${y}] has another platform too close above it. There must be at least two spaces above a platform in order for the player to fit.`);
                }

                const left = GROUND_TILES.includes(tile(x-1,y));
                const right = GROUND_TILES.includes(tile(x+1,y));
                let connection = '';
                if (left && right) {
                    connection = 'Mid';
                } else if (left) {
                    connection = 'Right';
                } else if (right) {
                    connection = 'Left';
                }
                entities.push({type: 'platform', x, y, connection, left, right});
            } else if (TILE_COIN === tile(x,y)) {
                const grounded = GROUND_TILES.includes(tile(x,y+1));
                entities.push({type: 'coin', x, y, grounded});
            } else if (TILE_EXIT === tile(x,y)) {
                if (tile(x,y-1) !== TILE_EMPTY) {
                    console.error(`Exit on [${x},${y}] has another object directly above it! Exit is always two spaces high.`);
                    entities.push({type: 'error', x, y});
                } else {
                    entities.push({type: 'exit', x, y});
                }
            } else if (TILE_PLAYER === tile(x,y)) {
                if (tile(x,y-1) !== TILE_EMPTY) {
                    console.error(`Player on [${x},${y}] has another object directly above it! Player is always two spaces high.`);
                    entities.push({type: 'error', x, y});
                } else if (hasPlayer) {
                    console.error(`There can be only one player! Extra player on [${x},${y}].`)
                    entities.push({type: 'error', x, y});
                } else {
                    hasPlayer = true;
                    entities.push({type: 'player', x, y});
                }
            } else if (TILE_BUSH === tile(x, y)) {
                const grounded = GROUND_TILES.includes(tile(x,y+1));
                entities.push({type: 'bush', x, y, grounded});
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