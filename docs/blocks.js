const defineBlock = (config) => ({
    init: function() {
        this.jsonInit(config);
    }
});

const ACTION_COLOUR = 110;

Blockly.Blocks.actions_turn = defineBlock({
    message0: 'otoč se',
    previousStatement: null,
    nextStatement: null,
    colour: ACTION_COLOUR,
});

Blockly.Blocks.actions_jump = defineBlock({
    message0: 'skoč %1',
    args0: [{name: 'TYPE', type: 'field_dropdown', options: [['vysoko', 'HIGH'], ['daleko', 'LONG']]}],
    previousStatement: null,
    colour: ACTION_COLOUR,
})

export const toolbox = {
    contents: [{
        kind: 'category',
        name: 'Akce',
        colour: ACTION_COLOUR,
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
    }],
}