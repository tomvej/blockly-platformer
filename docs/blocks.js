const defineBlock = (config) => ({
    init: function() {
        this.jsonInit(config);
    }
});

export const maxInstancesMap = {};

Blockly.Themes.Classic.startHats = true;
const COLOUR_ACTIONS = 110;
const COLOUR_EVENTS = 55;

Blockly.Blocks.actions_turn = defineBlock({
    message0: 'otoč se',
    previousStatement: null,
    nextStatement: null,
    colour: COLOUR_ACTIONS,
});
Blockly.JavaScript.actions_turn = function() {
    return 'game.control.turn();\n';
}

Blockly.Blocks.actions_jump = defineBlock({
    message0: 'skoč %1',
    args0: [{name: 'TYPE', type: 'field_dropdown', options: [['vysoko', 'HIGH'], ['daleko', 'LONG']]}],
    previousStatement: null,
    colour: COLOUR_ACTIONS,
});
Blockly.JavaScript.actions_jump = function() {
    return `game.control.jump();\n`;
}

Blockly.Blocks.events_edge = defineBlock({
    message0: 'hrana',
    nextStatement: null,
    colour: COLOUR_EVENTS,
});
maxInstancesMap.events_edge = 1;
Blockly.JavaScript.events_edge = function(block) {
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
        return `game.events.onEdge = function onEdge() {\n${Blockly.JavaScript.blockToCode(nextBlock)}};\n`;
    } else {
        return null;
    }
}

Blockly.Blocks.events_coin = defineBlock({
    message0: 'mince',
    nextStatement: null,
    colour: COLOUR_EVENTS,
})
maxInstancesMap.events_coin = 1;
Blockly.JavaScript.events_coin = function(block) {
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
        return `game.events.onCoin = function onCoin() {\n${Blockly.JavaScript.blockToCode(nextBlock)}};\n`;
    } else {
        return null;
    }
}

export const toolbox = {
    contents: [{
        kind: 'category',
        name: 'Akce',
        colour: COLOUR_ACTIONS,
        contents: [{
            kind: 'block',
            type: 'actions_turn',
        }, {
            kind: 'block',
            type: 'actions_jump',
            fields: {
                TYPE: 'HIGH',
            },
        }, {
            kind: 'block',
            type: 'actions_jump',
            fields: {
                TYPE: 'LONG',
            },
        }]
    }, {
        kind: 'category',
        name: 'Události',
        colour: COLOUR_EVENTS,
        contents: [{
            kind: 'block',
            type: 'events_edge',
        }, {
            kind: 'block',
            type: 'events_coin',
        }],
    }],
}