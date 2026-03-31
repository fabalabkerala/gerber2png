export const DEFAULT_MACHINE_CONF = [
    {
        name: "Carvera",
        id: 'carvera',
        url: "https://www.makera.com/cdn/shop/files/Makera_Carvera_1.jpg",
        width: 300,
        height: 250,
    },
    {
        machine: 'Roland MDX-20',
        id: 'mdx20',
        url: 'https://image.rolanddga.com/-/media/roland/images/support/product_shots/mdx20.jpg',
        width: 300,
        height: 300
    },
]

export const DEFAULT_PCB_CONF = {
    type: "single",
    length: { value: 100, maxValue: 400 },
    width: { value: 100, maxValue: 400 },
    thickness: { value: 2, maxValue: 4 },
    copperThickness: { value: 0.03, maxValue: 0.1 },
    cutOffset: { value: 0.5, maxValue: 1 },
};

export const DEFAULT_TOOL_LIB = [
    // Roland MDX20
    {
        name: "1/64 Mill - MDX20",
        toolNo: 1,
        type: "normal",
        angle: null,
        diameter: 0.39624,
        feedRate: 4,
        plungeRate: 4,
        rpm: 6000,
        maxCutDepth: 0.1,
        offsetStepOver: 0.5,
        offsetNum: 1,
        machine: 'mdx20',
        // id: 'mdx20-1'
    },
    {
        name: "1/32 Mill - MDX20",
        toolNo: 2,
        type: "normal",
        angle: null,
        diameter: 0.8,
        feedRate: 4,
        plungeRate: 4,
        rpm: 6000,
        maxCutDepth: 0.6,
        offsetStepOver: 0.5,
        offsetNum: 1,
        machine: 'mdx20',
        // id: 'mdx20-1'
    },
    {
        name: "1/100 Mill - MDX20",
        toolNo: 3,
        type: "normal",
        angle: null,
        diameter: 0.254,
        feedRate: 2,
        plungeRate: 2,
        rpm: 6000,
        maxCutDepth: 0.1,
        offsetStepOver: 0.5,
        offsetNum: 4,
        machine: 'mdx20'
    },
    {
        name: "V-Bit - MDX20",
        toolNo: 4,
        type: "vbit",
        angle: 60,
        diameter: 0.1,
        feedRate: 4,
        plungeRate: 4,
        rpm: 6000,
        maxCutDepth: 1.14,
        offsetStepOver: 0.2,
        offsetNum: 4,
        machine: 'mdx20'
    },

    // Carvera
    {
        name: "1/64 Mill - Carvera",
        toolNo: 1,
        type: "normal",
        angle: null,
        diameter: 0.39624,
        feedRate: 8,
        plungeRate: 4,
        rpm: 16000,
        maxCutDepth: 0.1,
        offsetStepOver: 0.5,
        offsetNum: 1,
        machine: 'carvera'
    },
    {
        name: "1/32 Mill - Carvera",
        toolNo: 2,
        type: "normal",
        angle: null,
        diameter: 0.8,
        feedRate: 8,
        plungeRate: 4,
        rpm: 16000,
        maxCutDepth: 0.6,
        offsetStepOver: 0.5,
        offsetNum: 1,
        machine: 'carvera'
    },
    {
        name: "1/100 Mill - Carvera",
        toolNo: 3,
        type: "normal",
        angle: null,
        diameter: 0.254,
        feedRate: 4,
        plungeRate: 2,
        rpm: 16000,
        maxCutDepth: 0.1,
        offsetStepOver: 0.5,
        offsetNum: 4,
        machine: 'carvera'
    },
    {
        name: "V-Bit - Carvera",
        toolNo: 4,
        type: "vbit",
        angle: 60,
        diameter: 0.1,
        feedRate: 8,
        plungeRate: 4,
        rpm: 16000,
        maxCutDepth: 1.14,
        offsetStepOver: 0.2,
        offsetNum: 4,
        machine: 'carvera'
    },
];

export const MDX20_TOOL_LIB = [
    {
        name: "1/64 Mill - MDX20",
        toolNo: 1,
        type: "normal",
        angle: null,
        diameter: 0.39624,
        feedRate: 4,
        plungeRate: 4,
        rpm: 6000,
        maxCutDepth: 0.1,
        offsetStepOver: 0.5,
        offsetNum: 1,
        machine: 'mdx20',
        id: 'mdx20-1'
    },
    {
        name: "1/32 Mill - MDX20",
        toolNo: 2,
        type: "normal",
        angle: null,
        diameter: 0.8,
        feedRate: 4,
        plungeRate: 4,
        rpm: 6000,
        maxCutDepth: 0.6,
        offsetStepOver: 0.5,
        offsetNum: 1,
        machine: 'mdx20',
        id: 'mdx20-2'
    },
    {
        name: "1/100 Mill - MDX20",
        toolNo: 3,
        type: "normal",
        angle: null,
        diameter: 0.254,
        feedRate: 2,
        plungeRate: 2,
        rpm: 6000,
        maxCutDepth: 0.1,
        offsetStepOver: 0.5,
        offsetNum: 4,
        machine: 'mdx20',
        id: 'mdx20-3'
    },
    {
        name: "V-Bit - MDX20",
        toolNo: 4,
        type: "vbit",
        angle: 60,
        diameter: 0.1,
        feedRate: 4,
        plungeRate: 4,
        rpm: 6000,
        maxCutDepth: 1.14,
        offsetStepOver: 0.2,
        offsetNum: 4,
        machine: 'mdx20',
        id: 'mdx20-4'
    },
]

export const CARVERA_TOOL_LIB = [
    {
        name: "1/64 Mill - Carvera",
        toolNo: 1,
        type: "normal",
        angle: null,
        diameter: 0.39624,
        feedRate: 8,
        plungeRate: 4,
        rpm: 16000,
        maxCutDepth: 0.1,
        offsetStepOver: 0.5,
        offsetNum: 1,
        machine: 'carvera',
        id: 'carvera-1'
    },
    {
        name: "1/32 Mill - Carvera",
        toolNo: 2,
        type: "normal",
        angle: null,
        diameter: 0.8,
        feedRate: 8,
        plungeRate: 4,
        rpm: 16000,
        maxCutDepth: 0.6,
        offsetStepOver: 0.5,
        offsetNum: 1,
        machine: 'carvera',
        id: 'carvera-2'
    },
    {
        name: "1/100 Mill - Carvera",
        toolNo: 3,
        type: "normal",
        angle: null,
        diameter: 0.254,
        feedRate: 4,
        plungeRate: 2,
        rpm: 16000,
        maxCutDepth: 0.1,
        offsetStepOver: 0.5,
        offsetNum: 4,
        machine: 'carvera',
        id: 'carvera-3'
    },
    {
        name: "V-Bit - Carvera",
        toolNo: 4,
        type: "vbit",
        angle: 60,
        diameter: 0.1,
        feedRate: 8,
        plungeRate: 4,
        rpm: 16000,
        maxCutDepth: 1.14,
        offsetStepOver: 0.2,
        offsetNum: 4,
        machine: 'carvera',
        id: 'carvera-4'
    },
]


export const MACHINE_PRESETS = {
    mdx: {
        trace: { tool: "V-Bit (0.2mm)", depth: 0.1, feedRate: 4 },
        drill: { tool: "0.8mm", depth: 1.6, feedRate: 6 },
        outline: { tool: "1mm End Mill", passDepth: 0.5, tabs: true }
    },
    carvera: {
        trace: { tool: "0.2mm End Mill", depth: 0.08, feedRate: 5 },
        drill: { tool: "0.6mm", depth: 1.6, feedRate: 7 },
        outline: { tool: "1mm End Mill", passDepth: 0.6, tabs: false }
    }
};

// 1/8" 0.8mm corn bit
// 1/8" 0.2mm v-bit
