// import { useEffect } from "react";
import { getLayerGroups, handleOutlineVisibility, toggleLayerVisibility } from "../../utils/svgConverter/layerUtils";
import handleColorChange from "../../utils/svgConverter/svgColorChange";
import { 
    // useGerber ,
    useGerberLayer,
    useGerberSettings,
    useGerberView
} from "../context/GerberContext";
import Select from "../ui/Select";
import ThreeWaySlider from "../ui/ThreeWaySlider";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";


const LayerControls = () => {
    const { topstack, bottomstack, fullLayers } = useGerberLayer();
    const { layerType, setLayerType, setChangeSelect, handleToggleCick, isToggled, doubleSide, canvasBg, setCanvasBg } = useGerberSettings();
    const { side, setMainSvg } = useGerberView();

    const viewOptions = [
        { id: "all", label: "All Layers", svg: fullLayers },
        { id: "top", label: "Top", svg: topstack.svg },
        { id: "bottom", label: "Bottom", svg: bottomstack.svg, class: doubleSide ? 'pointer-events-auto opacity-100': 'pointer-events-none opacity-50' },
    ];
    const handleSide = (id) => {
        setChangeSelect('custom');
        const option = viewOptions.find(opt => opt.id === id)
        if (!option) return;
        setMainSvg({ id: id, svg: option.svg })
    }

    const colorOptions = [
        { id: "original", label: "Original" },
        { id: "bw", label: "B / W" },
        { id: "bwInvert", label: "B / W Invert" },
    ];
    const handleColor = (id) => {
        handleColorChange({
            id: topstack.id,
            color: id,
            svgs: [topstack.svg, bottomstack.svg] 
        });
        setLayerType(id);
        setChangeSelect('custom')
    }

    const layers = [
        { 
            type: 'trace', 
            properties : [
                { layer: 'toplayer', id: 'top_copper' },
                { layer: 'bottomlayer', id: 'bottom_copper' },
            ]
        },
        { 
            type: 'pads', 
            properties : [
                { layer: 'toplayer', id: 'top_solderpaste' },
                { layer: 'bottomlayer', id: 'bottom_solderpaste' },
            ]
        },
        { 
            type: 'silkscreen', 
            properties : [
                { layer: 'toplayer', id: 'top_silkscreen' },
                { layer: 'bottomlayer', id: 'bottom_silkscreen' },
            ]
        }
    ]

    const commonLayers = ['drill', 'outline']

    const handleToggle = (layertype, layerProperty, isToggled, layerId) => {
        const layerGroups = getLayerGroups(
            layertype, 
            topstack, 
            bottomstack, 
            fullLayers
        )

        toggleLayerVisibility(layerGroups, layerId, isToggled);
        if (layerId === 'outline') handleOutlineVisibility([topstack, bottomstack], isToggled);

        handleToggleCick(layertype, layerProperty);
    }

    const options = [
        { id: 'black', label: 'Black' }, 
        { id: 'white', label: 'White' }, 
    ];


    return (
        <>
            <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden overflow-y-auto">
                {/* Heading */}
                <div className="px-4 py-2 bg-slate-50 sticky top-0 z-10">
                    <p className="font-medium text-slate-700 text-sm">Layers</p>
                </div>

                <div className="flex flex-col gap-3 px-3 pt-5 pb-5 bg-slate-50 m-4 rounded-lg">
                    <ThreeWaySlider 
                        options={viewOptions} 
                        onChange={handleSide} 
                        valueSync={side} 
                    />
                    <ThreeWaySlider 
                        options={colorOptions} 
                        variant="secondary" 
                        onChange={handleColor} 
                        valueSync={layerType} 
                    />
                </div>

                <div className="w-full px-5 py-3">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-3  pb-2">
                        <p className="text-xs px-2 text-slate-700 px-">Layers</p>
                        <p className="text-xs text-slate-700 text-center w-14">Top</p>
                        <p className="text-xs text-slate-700 text-center w-14">Bottom</p>
                    </div>
                    { layers.map((layer) => (
                        <div key={layer.type} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center mb-4">
                            <div className={cn("flex justify-between items-center bg-slate-50 w-full h-fit rounded hover:bg-white transition-colors")}>
                                <p className="text-xs px-2 py-1.5 text-slate-700 capitalize">{layer.type}</p>
                            </div>

                            { layer.properties.map((property, id) => (
                                <motion.button
                                key={`${property}_${id}`}
                                    className={cn(
                                        "px-3 py-2 rounded-md transition-colors w-14 text-center",
                                        !isToggled[property.layer][layer.type] ? "bg-emerald-100 text-emerald-500 hover:bg-emerald-50" : "bg-zinc-50 text-gray-400",
                                        !doubleSide && property.layer.includes('bottom') ? 'pointer-events-none opacity-40' : ''
                                    )}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        handleToggle(
                                            property.layer,
                                            layer.type,
                                            isToggled[property.layer][layer.type],
                                            property.id
                                        );
                                        setChangeSelect('custom');
                                    }}
                                >
                                    {!isToggled[property.layer][layer.type] ? (
                                        <EyeIcon width={18} height={12} className="mx-auto" strokeWidth={2.5} />
                                    ) : (
                                        <EyeSlashIcon width={18} height={12} className="mx-auto" strokeWidth={2.5} />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3 px-5">
                    { commonLayers.map((layer, id) => (
                        <div key={id} className="flex gap-3 items-center justify-between">
                            <div className={cn("flex justify-between items-center bg-slate-50 w-full h-fit rounded hover:bg-white transition-colors")}>
                                <p className="text-xs px-2 py-1.5 text-gray-700 capitalize">{ layer }</p>
                            </div>

                            <motion.button
                                className={cn(
                                    "px-3 py-2 rounded-lg w-14 text-center",
                                    !isToggled['commonlayer'][layer] ? "bg-emerald-100 text-emerald-500 hover:bg-emerald-50" : "bg-zinc-50 text-gray-400",
                                )}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    handleToggle('commonlayer', layer, isToggled['commonlayer'][layer], layer);
                                    setChangeSelect('custom');
                                }}
                            >
                                {!isToggled['commonlayer'][layer] ? (
                                    <EyeIcon width={18} height={12} className="mx-auto" strokeWidth={2.5} />
                                ) : (
                                    <EyeSlashIcon width={18} height={12} className="mx-auto" strokeWidth={2.5} />
                                )}
                            </motion.button>
                        </div>
                    ))}
                    <div className={cn("flex gap-3 items-center justify-between", doubleSide ? '' : 'opacity-60 pointer-events-none')}>
                        <div className={cn("flex justify-between items-center bg-slate-50 w-full h-fit rounded hover:bg-white transition-colors")}>
                            <p className="text-xs px-2 py-1.5 text-gray-700 capitalize">Double side outerlayer</p>
                        </div>

                        <motion.button
                            className={cn(
                                "px-3 py-2 rounded-lg w-14 text-center",
                                !isToggled.commonlayer.outlayer ? "bg-emerald-200 text-emerald-500" : "bg-zinc-50 text-gray-400",
                            )}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                handleToggle('commonlayer', 'outlayer', isToggled['commonlayer']['outlayer'], 'outer');
                                setChangeSelect('custom');
                            }}
                        >
                            {!isToggled.commonlayer.outlayer ? (
                                <EyeIcon width={18} height={12} className="mx-auto" strokeWidth={2.5} />
                            ) : (
                                <EyeSlashIcon width={18} height={12} className="mx-auto" strokeWidth={2.5} />
                            )}
                        </motion.button>
                    </div>
                    <div className="flex justify-between items-center gap-4 mt-2 mb-5">
                        <p className="text-xs ps-1.5 text-nowrap">Canvas Background</p>
                        <Select 
                            options={options} 
                            selected={canvasBg} 
                            setSelected={setCanvasBg} 
                            variant="top" 
                            onSelect={() => setChangeSelect('custom')}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
export default LayerControls;


