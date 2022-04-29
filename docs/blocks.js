const defineBlock = (config) => ({
    init: function() {
        this.jsonInit(config);
    }
});

Blockly.Blocks.actions_turn = defineBlock({
    message0: 'otoč se',
    previousStatement: null,
    nextStatement: null,
    colour: 110,
});

Blockly.Blocks.actions_jump = defineBlock({
    message0: 'skoč %1',
    args0: [{name: 'TYPE', type: 'field_dropdown', options: [['vysoko', 'HIGH'], ['daleko', 'LONG']]}],
    previousStatement: null,
    colour: 110,
})

export const toolbox = {
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
    }],
}