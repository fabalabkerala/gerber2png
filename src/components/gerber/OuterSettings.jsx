import LayerToggle from "../ui/LayerToggle";
import Select from "../ui/Select";
import { useGerberLayer, useGerberSettings } from "../context/GerberContext";
import { getLayerGroups, toggleLayerVisibility } from "../../utils/svgConverter/layerUtils";

const options = [
    { id: 'black', label: 'Black' }, 
    { id: 'white', label: 'White' }, 
];

const OuterSettings = () => {
    const { topstack, bottomstack, fullLayers } = useGerberLayer();
    const { isToggled, layertype, handleToggleCick, canvasBg, setCanvasBg, doubleSide } = useGerberSettings()

    const handleOuterlayer = (isVisible) => {
        const layerGroups = getLayerGroups(layertype, topstack, bottomstack, fullLayers);

        toggleLayerVisibility(layerGroups, 'outer', isVisible)
        handleToggleCick('commonlayer', 'outlayer')
    }

    return (
        <>
            <div className="flex flex-col  bg-white pb-3 rounded shadow">
                {/* Heading */}
                <div className="flex justify-between items-center bg-[#F5F5F5] px-2 py-1 rounded-tl-md rounded-tr-md">
                    <p className="font-medium text-sm ps-0.5 text-gray-700">Outer</p>
                </div>

                <div className="flex flex-col gap-2 px-3 pt-3">
                    <LayerToggle 
                        layerName={'Outerlayer'} 
                        enabled={!isToggled.commonlayer.outlayer} 
                        onChange={(isVisible) => handleOuterlayer(isVisible)}
                        className={ doubleSide ? '' : 'opacity-60 pointer-events-none'}
                    />
                    <div className="flex justify-between items-center gap-4">
                        <p className="font-medium text-sm ps-1.5 text-nowrap">Canvas Background</p>
                        <Select 
                            options={options} 
                            selected={canvasBg} 
                            setSelected={setCanvasBg} 
                            variant="top" 
                        />
                    </div>
                </div>

            </div>
        </>
    )
}
export default OuterSettings;
