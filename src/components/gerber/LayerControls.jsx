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
            <div className="flex flex-col h-full bg-white pb-3 rounded shadow">
                {/* Heading */}
                <div className="flex justify-between items-center bg-[#F5F5F5] px-2 py-1 rounded-tl-md rounded-tr-md">
                    <p className="font-medium text-sm ps-0.5 text-gray-700">Layers</p>
                </div>

                <div className="flex flex-col gap-3 px-3 pt-5 pb-4">
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

                <div className="w-full px-3 mt-3">
                    <div className="grid grid-cols-[1fr_auto_auto] gap-3 mb-2">
                        <p className="text-xs font-semibold text-gray-500 px-2">Layers</p>
                        <p className="text-xs text-gray-500 text-center w-14">Top</p>
                        <p className="text-xs text-gray-500 text-center w-14">Bottom</p>
                    </div>
                    { layers.map((layer) => (
                        <div key={layer.type} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center mb-2">
                            <div className={cn("flex justify-between items-center border w-full h-fit rounded")}>
                                <p className="text-xs px-2 py-1 text-gray-700 capitalize">{layer.type}</p>
                            </div>

                            { layer.properties.map((property) => (
                                <motion.button
                                    key={property}
                                    className={cn(
                                        "px-3 py-1.5 rounded border w-14 text-center",
                                        !isToggled[property.layer][layer.type] ? "bg-zinc-100" : "bg-zinc-50 text-orange-400",
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
                                        <EyeIcon width={18} height={12} className="mx-auto" />
                                    ) : (
                                        <EyeSlashIcon width={18} height={12} className="mx-auto" />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-3 px-3 pt-2 mt-4">
                    { commonLayers.map((layer, id) => (
                        <div key={id} className="flex gap-3 items-center justify-between">
                            <div className={cn("flex justify-between items-center border w-full h-fit rounded flex-1")}>
                                <p className="text-xs px-2 py-1 text-gray-700 capitalize">{ layer }</p>
                            </div>

                            <motion.button
                                className={cn(
                                    "px-3 py-1.5 rounded border w-14 text-center",
                                    !isToggled['commonlayer'][layer] ?  "bg-zinc-100" : "bg-zinc-50 text-orange-400",
                                )}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    handleToggle('commonlayer', layer, isToggled['commonlayer'][layer], layer);
                                    setChangeSelect('custom');
                                }}
                            >
                                {!isToggled['commonlayer'][layer] ? (
                                    <EyeIcon width={18} height={12} className="mx-auto" />
                                ) : (
                                    <EyeSlashIcon width={18} height={12} className="mx-auto" />
                                )}
                            </motion.button>
                        </div>
                    ))}
                    <div className={cn("flex gap-3 items-center justify-between", doubleSide ? '' : 'opacity-60 pointer-events-none')}>
                        <div className={cn("flex justify-between items-center border w-full h-fit rounded flex-1")}>
                            <p className="text-xs px-2 py-1 text-gray-700 capitalize">Double side outerlayer</p>
                        </div>

                        <motion.button
                            className={cn(
                                "px-3 py-1.5 rounded border w-14 text-center",
                                !isToggled.commonlayer.outlayer ?  "bg-zinc-100" : "bg-zinc-50 text-orange-400",
                            )}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                handleToggle('commonlayer', 'outlayer', isToggled['commonlayer']['outlayer'], 'outer');
                                setChangeSelect('custom');
                            }}
                        >
                            {!isToggled.commonlayer.outlayer ? (
                                <EyeIcon width={18} height={12} className="mx-auto" />
                            ) : (
                                <EyeSlashIcon width={18} height={12} className="mx-auto" />
                            )}
                        </motion.button>
                    </div>
                    <div className="flex justify-between items-center gap-4 mt-2">
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


