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
    colour: COLOUR_ACTIONS,
});
Blockly.JavaScript.actions_turn = function() {
    return 'game.control.turn();\n';
}

Blockly.Blocks.actions_jump = defineBlock({
    message0: 'skoč %1',
    args0: [{name: 'TYPE', type: 'field_dropdown', options: [['vysoko', 'high'], ['daleko', 'long']]}],
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

Blockly.Blocks.events_cactus = defineBlock({
    message0: 'kaktus',
    nextStatement: null,
    colour: COLOUR_EVENTS,
});
maxInstancesMap.events_cactus = 1
Blockly.JavaScript.events_cactus = createEventGenerator('onCactus');

Blockly.Blocks.events_landing = defineBlock({
    message0: 'dopad',
    nextStatement: null,
    colour: COLOUR_EVENTS,
});
maxInstancesMap.events_landing = 1;
Blockly.JavaScript.events_landing = createEventGenerator('onLanding');

Blockly.Blocks.events_mushroom = defineBlock({
    message0: 'houba',
    nextStatement: null,
    colour: COLOUR_EVENTS,
})
maxInstancesMap.events_mushroom = 1;
Blockly.JavaScript.events_mushroom = createEventGenerator('onMushroom');

Blockly.Blocks.events_click = defineBlock({
    message0: 'kliknutí',
    nextStatement: null,
    colour: COLOUR_EVENTS,
});
maxInstancesMap.events_click = 1;
Blockly.JavaScript.events_click = createEventGenerator('onClick');

Blockly.Blocks.conditions_direction = defineBlock({
    message0: 'jdu %1',
    args0: [{name: 'DIRECTION', type: 'field_dropdown', options: [['doleva', 'left'], ['doprava', 'right']]}],
    output: 'Boolean',
    colour: COLOUR_LOGIC,
});
Blockly.JavaScript.conditions_direction = function(block) {
    const direction = block.getFieldValue('DIRECTION');
    return [`game.control.hasDirection('${direction}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
}

Blockly.Blocks.conditions_ground = defineBlock({
    message0: 'jsem na %1',
    args0: [{name: 'TYPE', type: 'field_dropdown', options: [['trávě', 'grass'], ['písku', 'sand'], ['skále', 'stone']]}],
    output: 'Boolean',
    colour: COLOUR_LOGIC,
});
Blockly.JavaScript.conditions_ground = function(block) {
    const groundType = block.getFieldValue('TYPE');
    return [`game.control.isOnGround('${groundType}')`, Blockly.JavaScript.ORDER_FUNCTION_CALL];
}

Blockly.Blocks.conditions_coins = defineBlock({
    message0: 'počet mincí %1 %2',
    args0: [
        {name: 'OP', type: 'field_dropdown', options: [['>', '>'], ['<', '<'], ['≤', '<='], ['≥', '>='], ['=', '==='], ['≠', '!==']]},
        {name: 'VALUE', type: 'field_dropdown', options: [['0', '0'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']]},
    ],
    output: 'Boolean',
    colour: COLOUR_LOGIC,
});
Blockly.JavaScript.conditions_coins = function (block) {
    return [`game.control.collectedCoins ${block.getFieldValue('OP')} ${block.getFieldValue('VALUE')}`, Blockly.JavaScript.ORDER_RELATIONAL];
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

const getState = (value) => {
    switch (value) {
        case 'on':
            return true;
        case 'off':
            return false;
    }
}

Blockly.Blocks.state_ghost = defineBlock({
    message0: '%1 duchem',
    args0: [{name: 'SWITCH', type: 'field_dropdown', options: [['stan se', 'on'], ['přestaň být', 'off']]}],
    previousStatement: null,
    colour: COLOUR_ACTIONS,
});
Blockly.JavaScript.state_ghost = function(block) {
    const value = block.getFieldValue('SWITCH');
    return `game.control.setGhost(${getState(value)});\n`
}

Blockly.Blocks.conditions_ghost = defineBlock({
    message0: '%1 duch',
    args0: [{name: 'SWITCH', type: 'field_dropdown', options: [['jsem', 'on'], ['nejsem', 'off']]}],
    output: 'Boolean',
    colour: COLOUR_LOGIC,
});
Blockly.JavaScript.conditions_ghost = function(block) {
    const value = block.getFieldValue('SWITCH');
    return [`game.control.isGhost === ${getState(value)}`, Blockly.JavaScript.ORDER_EQUALITY];
}

Blockly.Blocks.controls_custom_if = defineBlock({
    message0: '%{BKY_CONTROLS_IF_MSG_IF} %1',
    args0: [{name: 'IF0', type: 'input_value', check: 'Boolean'}],
    message1: '%1',
    args1: [{name: 'DO0', type: 'input_statement'}],
    previousStatement: null,
    colour: COLOUR_LOGIC,
});
Blockly.Blocks.controls_custom_ifelse = defineBlock({
    message0: '%{BKY_CONTROLS_IF_MSG_IF} %1',
    args0: [{name: 'IF0', type: 'input_value', check: 'Boolean'}],
    message1: '%1',
    args1: [{name: 'DO0', type: 'input_statement'}],
    message2: '%{BKY_CONTROLS_IF_MSG_ELSE}',
    message3: '%1',
    args3: [{name: 'ELSE', type: 'input_statement'}],
    previousStatement: null,
    colour: COLOUR_LOGIC,
})
Blockly.Blocks.controls_custom_ifelseifelse = defineBlock({
    message0: '%{BKY_CONTROLS_IF_MSG_IF} %1',
    args0: [{name: 'IF0', type: 'input_value', check: 'Boolean'}],
    message1: '%1',
    args1: [{name: 'DO0', type: 'input_statement'}],
    message2: '%{BKY_CONTROLS_IF_MSG_ELSEIF} %1',
    args2: [{name: 'IF1', type: 'input_value', check: 'Boolean'}],
    message3: '%1',
    args3: [{name: 'DO1', type: 'input_statement'}],
    message4: '%{BKY_CONTROLS_IF_MSG_ELSE}',
    message5: '%1',
    args5: [{name: 'ELSE', type: 'input_statement'}],
    previousStatement: null,
    colour: COLOUR_LOGIC,
});
Blockly.JavaScript.controls_custom_if = Blockly.JavaScript.controls_if;
Blockly.JavaScript.controls_custom_ifelse = Blockly.JavaScript.controls_if;
Blockly.JavaScript.controls_custom_ifelseifelse = Blockly.JavaScript.controls_if;

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
                TYPE: 'high',
            },
        }, {
            kind: 'block',
            type: 'actions_jump',
            fields: {
                TYPE: 'long',
            },
        }, {
            kind: 'block',
            type: 'state_ghost',
            fields: {
                SWITCH: 'on',
            },
        }, {
            kind: 'block',
            type: 'state_ghost',
            fields: {
                SWITCH: 'off',
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
            type: 'events_cactus',
        }, {
            kind: 'block',
            type: 'events_landing',
        }, {
            kind: 'block',
            type: 'events_click',
        }, {
            kind: 'block',
            type: 'events_mushroom',
        }],
    }, {
        kind: 'category',
        name: 'Podmínky',
        colour: COLOUR_LOGIC,
        contents: [{
            kind: 'block',
            type: 'conditions_direction',
        }, {
            kind: 'block',
            type: 'conditions_ground',
        }, {
            kind: 'block',
            type: 'conditions_coins',
            fields: {
                OP: '>=',
                VALUE: '1',
            }
        }, {
            kind: 'block',
            type: 'conditions_ghost',
        }],
    }, {
        kind: 'category',
        name: 'Větvení',
        colour: COLOUR_LOGIC,
        contents: [{
            kind: 'block',
            type: 'controls_if',
        }, {
            kind: 'block',
            type: 'controls_custom_if',
        }, {
            kind: 'block',
            type: 'controls_custom_ifelse',
        }, {
            kind: 'block',
            type: 'controls_custom_ifelseifelse',
        }]
    }],
}