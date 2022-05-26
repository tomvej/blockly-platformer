export const WORLD_WIDTH = 20;
export const WORLD_HEIGHT = 16;
export const TILE_SIZE = 32;
export const SCALE = 0.25;

export const EDGE_WIDTH = TILE_SIZE / 6;

export const PLAYER_HEIGHT = 164;
export const DOOR_HEIGHT = 208;

export const TILE_EMPTY = '.';
export const TILE_GRASS = '=';
export const TILE_SAND = '-';
export const TILE_STONE = '#'
export const TILE_COIN = 'o';
export const TILE_EXIT = 'e';
export const TILE_PLAYER = 'a';
export const TILE_BUSH = 'k';
export const TILE_CACTUS = 'c';
export const TILE_SPIKES_UP = 'x';
export const TILE_SPIKES_DOWN = 'v';
export const TILE_MUSHROOM = 'h';

export const GROUND_TILES = [TILE_GRASS, TILE_SAND, TILE_STONE];

export const COEFFICIENTS = {
    longJumpX: 5.2,
    longJumpY: 3.8,
    highJumpX: 1.2,
    highJumpY: 8.7,
    velocity: 4,
    fallX: 1.6,
}
export const GRAVITY_COEFFICIENT = 10;