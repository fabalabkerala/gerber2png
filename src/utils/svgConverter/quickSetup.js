const setUpConfig = (topstack, bottomstack) => {
    return {
        'top-trace': {
            side: 'toplayer',
            button: 'trace',
            toggleButtons: [
                { side: 'toplayer', button: 'pads' },
                { side: 'toplayer', button: 'silkscreen' },
                { side: 'commonlayer', button: 'outline' },
                { side: 'commonlayer', button: 'drill' },
                { side: 'commonlayer', button: 'outlayer' },
            ],
            stack: topstack, 
            // id: 'top_layer_traces',
            id: 'traces_top_layer',
            color: 'bw',
            layerid: 'top_copper',
            canvas: 'black',
        },
        'top-drill': {
            side: 'commonlayer',
            button: 'drill',
            toggleButtons: [
                { side: 'toplayer', button: 'trace' },
                { side: 'toplayer', button: 'pads' },
                { side: 'toplayer', button: 'silkscreen' },
                { side: 'commonlayer', button: 'outline' },
                { side: 'commonlayer', button: 'outlayer' },
            ],
            stack:topstack,
            id: 'drills_top_layer',
            color: 'bwInvert',
            layerid: 'drill', 
            canvas: 'white',
        },
        'top-cut': {
            side: 'commonlayer',
            button: 'outline',
            toggleButtons: [
                { side: 'toplayer', button: 'trace' },
                { side: 'toplayer', button: 'pads' },
                { side: 'toplayer', button: 'silkscreen' },
                { side: 'commonlayer', button: 'drill' },
            ],
            stack: topstack,
            id: 'outline_top_layer',
            color: 'bwInvert',
            layerid: 'outline',
            canvas: 'black',
        },
        'bottom-trace': {
            side: 'bottomlayer',
            button: 'trace',
            toggleButtons: [
                { side: 'bottomlayer', button: 'pads' },
                { side: 'bottomlayer', button: 'silkscreen' },
                { side: 'commonlayer', button: 'outline' },
                { side: 'commonlayer', button: 'drill' },
                { side: 'commonlayer', button: 'outlayer' },
            ],
            stack: bottomstack,
            id: 'traces_bottom_layer',
            color: 'bw',
            layerid: 'bottom_copper',
            canvas: 'black',
        },
        'bottom-cut': {
            side: 'commonlayer',
            button: 'outline',
            toggleButtons: [
                { side: 'bottomlayer', button: 'pads' },
                { side: 'bottomlayer', button: 'silkscreen' },
                { side: 'commonlayer', button: 'drill' },
                { side: 'commonlayer', button: 'outlayer' },
            ],
            stack: bottomstack,
            id: 'outline_bottom_layer',
            color: 'bwInvert',
            layerid: 'outline',
            canvas: 'black',
        }
    }
}
export default setUpConfig;