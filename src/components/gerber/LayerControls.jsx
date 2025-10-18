import handleColorChange from "../../utils/svgConverter/svgColorChange";
import { useGerber } from "../context/GerberContext";
import LayerToggle from "../ui/LayerToggle";
import ThreeWaySlider from "../ui/ThreeWaySlider";


const LayerControls = () => {
    const { 
        topstack, 
        bottomstack, 
        fullLayers,
        setLayerType, 
        setChangeSelect, 
        setMainSvg
    } = useGerber();

    const viewOptions = [
        { id: "all", label: "All Layers", svg: fullLayers },
        { id: "top", label: "Top", svg: topstack.svg },
        { id: "bottom", label: "Bottom", svg: bottomstack.svg },
    ];
    const handleSide = (id) => {
        setChangeSelect('custom-setup');
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
        setChangeSelect('custom-setup')
    }

    return (
        <>
            <div className="flex flex-col bg-white pb-3 rounded shadow">
                {/* Heading */}
                <div className="flex justify-between items-center bg-[#F5F5F5] px-2 py-1 rounded-tl-md rounded-tr-md">
                    <p className="font-medium text-sm ps-0.5 text-gray-700">Layers</p>
                </div>

                <div className="flex flex-col gap-3 px-3 pt-4 pb-3">
                    <ThreeWaySlider options={viewOptions} onChange={handleSide} defaultValue={'top'} />
                    <ThreeWaySlider options={colorOptions} variant="secondary" onChange={handleColor} />
                </div>

                <div className="flex flex-col gap-2 px-3 py-2">
                    <p className="font-medium text-sm px-1">Top Layer</p>
                    <LayerToggle layerName={'Traces'} />
                    <LayerToggle layerName={'Pads'} />
                    <LayerToggle layerName={'Silkscreen'} />
                    {/* <LayerToggle layerName={'Soldermask'} /> */}
                </div>

                <div className="flex flex-col gap-2 px-3 py-2">
                    <p className="font-medium text-sm px-1">Bottom Layer</p>
                    <LayerToggle layerName={'Traces'} />
                    <LayerToggle layerName={'Pads'} />
                    <LayerToggle layerName={'Silkscreen'} />
                    {/* <LayerToggle layerName={'Soldermask'} /> */}
                </div>

                <div className="flex flex-col gap-2 px-3 pt-4 pb-1">
                    <LayerToggle layerName={'Outline'} />
                    <LayerToggle layerName={'Drill Holes'} />
                </div>
            </div>
        </>
    )
}
export default LayerControls;


