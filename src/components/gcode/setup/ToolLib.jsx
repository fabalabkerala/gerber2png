import { useApp } from "../../context/AppContext"
import PCB from "./PCB";
import { useState } from "react";
import Select from "../../ui/Select";
import PropTypes from "prop-types";
import VBitIcon from "../../icons/VBitIcon";

const options = [
    { id: '4x6', label: '4in X 6in', width: 101.6, length: 152.4 }, 
    { id: '5x8', label: '5in X 8in', width: 127, length: 203.2 }, 
    { id: '6x8', label: '6in X 8in', width: 152.4, length: 203.2 }, 
];

const sideOption = [
    { id: 'single' , label : 'Single Side' },
    { id: 'double' , label : 'Double Side' },
]

const labels = {
    type: "Doubleside",
    length: "Length",
    width: "Width",
    thickness: "Thickness",
    copperThickness: "Copper Thickness",
    cutOffset: "Additional Cut Offset"
};
  

const ToolLibrary = () => {
    const { pcbConf, setPCBConf } = useApp();
    const [ preset, setPreset ] = useState('Choose Preset');
    const [ pcbSide, setPCBSide ] = useState(sideOption[0].id);

    const handleInput = (name, value, maxValue) => {
        if (value === '') {
            setPCBConf(prev => ({ ...prev, [name]: { ...prev[name], value: '' }}));
            return;
        }

        let num = parseFloat(value);
        if (num > maxValue) num = maxValue;

        num = Math.round(num * 100) / 100;

        setPCBConf(prev => ({
            ...prev,
            [name]: { ...prev[name], value: num }
        }));
    }

    return (
        <>
            <div className="flex gap-3 p-3 h-full">
                <div className="flex-1 py-3 px-2">
                    <div className=" bg-zinc-50 border flex-1 p-4 mx-2 my-1 flex flex-col gap-3 rounded h-full">
                        
                        
                    </div>
                </div>
                <div className="flex-1 p-3">
                    <div className="flex-1 h-44">
                        <VBitIcon className={'h-full rotate-180 p-3'} />

                        {/* <PCB 
                            className={'w-full h-full p-4'} 
                            doubleSide={ pcbSide === 'single' ? false : true } 
                            cutOffsetRatio={ pcbConf.cutOffset.value / pcbConf.thickness.value } 
                            copperRatio={ pcbConf.copperThickness.value / pcbConf.thickness.value } 
                        /> */}
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-3">
                        <div className="flex flex-col gap-2">
                            {Object.entries(labels).map(([key, label]) => (
                                <div key={key} className="flex gap-3 py-1">
                                    <p className="text-xs w-32">{label}</p>
                                    <p className="text-xs font-medium">
                                        {key === "type"
                                        ? pcbConf[key] === "double" ? "Yes" : "No"
                                        : pcbConf[key].value}
                                        {key !== "type" && (
                                        <span className="text-gray-500 font-normal text-[10px]">mm</span>
                                        )}
                                    </p>
                                </div>
                            ))}
                            <div className="flex gap-3 py-1">
                                <p className="text-xs w-32">Cut Depth</p>
                                <p className="text-xs font-medium">
                                    { pcbConf.copperThickness.value + pcbConf.cutOffset.value }<span className="text-gray-500 font-normal text-[10px]">mm</span>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
export default ToolLibrary;

const InputField = ({name, label, value, maxValue, handleInput, defaultValue = 0}) => {
    return (
        <>
            <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">{ label } <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                <input 
                    value={value}
                    className="rounded w-32 focus:outline-none text-center text-xs py-1 border" 
                    type="number"
                    min={0}
                    step={0.1}
                    onInput={(e) => {
                        let value = e.target.value;
                        if (value < 0) value = 0;  
                        handleInput(name, value, maxValue)
                    }}
                    onBlur={(e) => {
                        if (e.target.value === '' || isNaN(e.target.value)) {
                            handleInput(name, defaultValue, maxValue);
                        }
                    }}  
                />
            </div>
        </>
    )
}
InputField.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string,
    value: PropTypes.number.isRequired,
    maxValue: PropTypes.number,
    handleInput: PropTypes.func.isRequired,
    defaultValue: PropTypes.number
}