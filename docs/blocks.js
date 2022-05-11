const defineBlock = (config) => ({
    init: function() {
        this.jsonInit(config);
    }
});

export const maxInstancesMap = {};

Blockly.Themes.Classic.startHats = true;
const COLOUR_ACTIONS = 110;
const COLOUR_EVENTS = 55;
const COLOUR_LOGIC = Blockly.Msg.LOGIC_HUE;

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

const createEventGenerator = (eventName) => function (block) {
    const nextBlock = block.getNextBlock();
    if (nextBlock) {
        return `game.events.${eventName} = function ${eventName}() {\n${Blockly.JavaScript.blockToCode(nextBlock)}};\n`;
    } else {
        return null;
    }
}

Blockly.Blocks.actions_log = defineBlock({
    message0: 'vypiš %1',
    args0: [{name: 'TEXT', type: 'field_input'}],
    previousStatement: null,
    nextStatement: null,
    colour: 0,
});
Blockly.JavaScript.actions_log = function(block) {
    const value = block.getFieldValue('TEXT');
    return `game.control.log('${value.replaceAll('\'', '"')}');\n`;
}

Blockly.Blocks.events_edge = defineBlock({
    message0: 'hrana',
    nextStatement: null,
    colour: COLOUR_EVENTS,
});
maxInstancesMap.events_edge = 1;
Blockly.JavaScript.events_edge = createEventGenerator('onEdge');

Blockly.Blocks.events_coin = defineBlock({
    message0: 'mince',
    nextStatement: null,
    colour: COLOUR_EVENTS,
})
maxInstancesMap.events_coin = 1;
Blockly.JavaScript.events_coin = createEventGenerator('onCoin')

Blockly.Blocks.events_bush = defineBlock({
    message0: 'keř',
    nextStatement: null,
    colour: COLOUR_EVENTS,
});
maxInstancesMap.events_bush = 1;
Blockly.JavaScript.events_bush = createEventGenerator('onBush');

Blockly.Blocks.events_landing = defineBlock({
    message0: 'dopad',
    nextStatement: null,
    colour: COLOUR_EVENTS,
});
maxInstancesMap.events_landing = 1;
Blockly.JavaScript.events_landing = createEventGenerator('onLanding');

Blockly.Blocks.conditions_direction = defineBlock({
    message0: 'jdu %1',
    args0: [{name: 'DIRECTION', type: 'field_dropdown', options: [['doleva', 'LEFT'], ['doprava', 'RIGHT']]}],
    output: 'Boolean',
    colour: COLOUR_LOGIC,
});
Blockly.JavaScript.conditions_direction = function(block) {
    const direction = block.getFieldValue('DIRECTION');
    return [`game.control.hasDirection('${direction}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
}

Blockly.Blocks.conditions_ground = defineBlock({
    message0: 'jsem na %1',
    args0: [{name: 'KIND', type: 'field_dropdown', options: [['trávě', 'grass'], ['písku', 'sand'], ['skále', 'stone']]}],
    output: 'Boolean',
    colour: COLOUR_LOGIC,
});
Blockly.JavaScript.conditions_ground = function(block) {
    const groundType = block.getFieldValue('KIND');
    return [`game.control.isOnGround('${groundType}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
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
        }, {
            kind: 'block',
            type: 'actions_log',
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
        }, {
            kind: 'block',
            type: 'events_bush',
        }, {
            kind: 'block',
            type: 'events_landing',
        }],
    }, {
        kind: 'category',
        name: 'Podmínky',
        colour: COLOUR_LOGIC,
        contents: [{
            kind: 'block',
            type: 'controls_if',
        }, {
            kind: 'block',
            type: 'controls_if',
            extraState: {hasElse: true},
        }, {
            kind: 'block',
            type: 'conditions_direction',
            fields: {
                DIRECTION: 'RIGHT'
            }
        }, {
            kind: 'block',
            type: 'conditions_direction',
            fields: {
                DIRECTION: 'LEFT'
            }
        }, {
            kind: 'block',
            type: 'conditions_ground',
            fields: {
                KIND: 'grass',
            }
        }, {
            kind: 'block',
            type: 'conditions_ground',
            fields: {
                KIND: 'sand',
            }
        }, {
            kind: 'block',
            type: 'conditions_ground',
            fields: {
                KIND: 'stone',
            }
        }],
    }],
}