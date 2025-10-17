import { useState } from "react";
import LayerToggle from "../ui/LayerToggle";
import Select from "../ui/Select";

const options = ["Black", "White"];

const OuterSettings = () => {
    const [selected, setSelected] = useState(options[0]);

    return (
        <>
            <div className="flex flex-col  bg-white pb-3 rounded shadow">
                {/* Heading */}
                <div className="flex justify-between items-center bg-[#F5F5F5] px-2 py-1 rounded-tl-md rounded-tr-md">
                    <p className="font-medium text-sm ps-0.5 text-gray-700">Outer</p>
                </div>

                <div className="flex flex-col gap-2 px-3 pt-3">
                    <LayerToggle layerName={'Outerlayer'} />
                    <div className="flex justify-between items-center gap-4">
                        <p className="font-medium text-sm ps-1.5 text-nowrap">Canvas Background</p>
                        <Select options={options} selected={selected} setSelected={setSelected} variant="top" />
                    </div>
                </div>

            </div>
        </>
    )
}
export default OuterSettings;
