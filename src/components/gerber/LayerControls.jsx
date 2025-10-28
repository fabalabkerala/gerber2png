// import { useEffect } from "react";
import { getLayerGroups, handleOutlineVisibility, toggleLayerVisibility } from "../../utils/svgConverter/layerUtils";
import handleColorChange from "../../utils/svgConverter/svgColorChange";
import { 
    // useGerber ,
    useGerberLayer,
    useGerberSettings,
    useGerberView
} from "../context/GerberContext";
import LayerToggle from "../ui/LayerToggle";
import ThreeWaySlider from "../ui/ThreeWaySlider";


const LayerControls = () => {
    const { topstack, bottomstack, fullLayers } = useGerberLayer();
    const { layerType, setLayerType, setChangeSelect, handleToggleCick, isToggled, doubleSide } = useGerberSettings();
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
        { type: 'toplayer', label: 'Top Layer', colors: ['#ced8cd', '#b9a323', '#348f9b'], properties: ['trace', 'pads', 'silkscreen'], ids: ['top_copper', 'top_solderpaste', 'top_silkscreen'] },
        { type: 'bottomlayer', label: 'Bottom Layer', colors: ['#206b19', '#b9a323', '#348f9b'], properties: ['trace', 'pads', 'silkscreen'], ids: ['bottom_copper', 'bottom_solderpaste', 'bottom_silkscreen'] },
        { type: 'commonlayer', label: null, colors: ['#206b19', '#b9a323'], properties: ['outline', 'drill'], ids: ['outline', 'drill'] },
    ]
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

    return (
        <>
            <div className="flex flex-col bg-white pb-3 rounded shadow">
                {/* Heading */}
                <div className="flex justify-between items-center bg-[#F5F5F5] px-2 py-1 rounded-tl-md rounded-tr-md">
                    <p className="font-medium text-sm ps-0.5 text-gray-700">Layers</p>
                </div>

                <div className="flex flex-col gap-3 px-3 pt-4 pb-3">
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

                { layers.map((layer, id) => (
                    <div key={id} className="flex flex-col gap-2 px-3 py-2">
                        <p className="font-medium text-sm px-1">{ layer.label }</p>
                        { layer.properties.map((property, id) => (
                            <LayerToggle 
                                key={id} 
                                layerName={property} 
                                onChange={(isToggled) => {
                                    handleToggle(
                                        layer.type,
                                        property,
                                        isToggled,
                                        layer.ids[id]
                                    );
                                    setChangeSelect('custom')
                                }}
                                enabled={!isToggled[layer.type][property]}
                                className={ !doubleSide && layer.ids[id].includes('bottom') ? 'pointer-events-none opacity-40' : '' }
                            />
                        ))}
                    </div>
                ))}
            </div>
        </>
    )
}
export default LayerControls;


