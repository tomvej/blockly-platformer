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
Blockly.JavaScript.actions_jump = function(block) {
    const type = block.getFieldValue('TYPE');
    return `game.control.jump('${type}');\n`;
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

// REMOVE next statements from conditions
const ifInit = Blockly.Blocks.controls_if.init;
Blockly.Blocks.controls_if.init = function() {
    ifInit.apply(this);
    this.setNextStatement(false);
}
const ifElseInit = Blockly.Blocks.controls_ifelse.init;
Blockly.Blocks.controls_ifelse. init = function () {
    ifElseInit.apply(this);
    this.setNextStatement(false);
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
    }, {
        kind: 'category',
        name: 'Podmínky',
        colour: Blockly.Msg.LOGIC_HUE,
        contents: [{
            kind: 'block',
            type: 'controls_if',
        }, {
            kind: 'block',
            type: 'controls_if',
            extraState: {hasElse: true},
        }],
    }],
}