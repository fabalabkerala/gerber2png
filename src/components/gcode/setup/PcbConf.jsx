import { useApp } from "../../context/AppContext"
import PCB from "./PCB";
import { useState } from "react";
import Select from "../../ui/Select";
import PropTypes from "prop-types";

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
  
const PcbConfiguration = () => {
    const { pcbConf, setPCBConf } = useApp();
    const [ preset, setPreset ] = useState(() => {
        const w = pcbConf.width.value;
        const h = pcbConf.length.value;

        const option = options.find(opt => opt.width === w && opt.length === h) || null;
        if (option === null) return 'Choose Preset';
        else return option.id
    });
    const [ pcbSide, setPCBSide ] = useState(() => {
        if (pcbConf.type === 'double') return 'double';
        else return 'single';
    });

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
                    <div className=" bg-zinc-50 flex-1 p-4 mx-2 my-1 flex flex-col gap-3 rounded h-full dark:bg-slate-950/50">
                        <div className="flex items-center gap-6">
                            <p className="text-xs text-black text-nowrap font-medium tracking-wide dark:text-slate-200">Copper Sheet</p>
                            <div className="w-32">
                                <Select 
                                    options={options} 
                                    selected={preset} 
                                    setSelected={setPreset} 
                                    onSelect={(value) => {
                                        const val = options.find(option => option.id === value);

                                        setPCBConf(prev => ({
                                            ...prev,
                                            length: { ...prev.length, value: val.length },
                                            width: { ...prev.width, value: val.width },
                                        }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center gap-2 mt-3">
                            <p className="text-xs text-black text-nowrap tracking-wide dark:text-slate-200">Type</p>
                            <div className="w-32">
                                <Select 
                                    options={sideOption} 
                                    selected={pcbSide} 
                                    setSelected={setPCBSide} 
                                    onSelect={(value) => {
                                        setPCBConf(prev => ({ ...prev, type: value }))
                                    }}
                                />
                            </div>
                        </div>
                        <InputField 
                            name={'length'} 
                            label={'Length'} 
                            value={pcbConf.length.value}
                            maxValue={pcbConf.length.maxValue} 
                            handleInput={handleInput}
                        />
                        <InputField 
                            name={'width'} 
                            label={'Width'} 
                            value={pcbConf.width.value} 
                            maxValue={pcbConf.width.maxValue} 
                            handleInput={handleInput}
                        />
                        <InputField 
                            name={'thickness'} 
                            label={'Thickness'} 
                            value={pcbConf.thickness.value} 
                            maxValue={pcbConf.thickness.maxValue} 
                            defaultValue={2} 
                            handleInput={handleInput}
                        />
                        <InputField 
                            name={'copperThickness'} 
                            label={'Copper Thickness'} 
                            value={pcbConf.copperThickness.value} 
                            maxValue={pcbConf.copperThickness.maxValue}
                            defaultValue={0.035} 
                            handleInput={handleInput}
                        />
                        <InputField 
                            name={'cutOffset'} 
                            label={'Additional Cut Offset'} 
                            value={pcbConf.cutOffset.value} 
                            maxValue={pcbConf.cutOffset.maxValue} 
                            defaultValue={0.3}
                            handleInput={handleInput}
                        />
                    </div>
                </div>
                <div className="flex-1 p-3">
                    <div className="flex-1 h-44 w-86">
                        <PCB 
                            className={'w-full h-full p-4'} 
                            doubleSide={ pcbSide === 'single' ? false : true } 
                            cutOffsetRatio={ pcbConf.cutOffset.value / pcbConf.thickness.value } 
                            copperRatio={ pcbConf.copperThickness.value / pcbConf.thickness.value } 
                        />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-3">
                        <div className="flex flex-col gap-2">
                            {Object.entries(labels).map(([key, label]) => (
                                <div key={key} className="flex gap-3 py-1">
                                    <p className="text-xs w-32 dark:text-slate-300">{label}</p>
                                    <p className="text-xs font-medium dark:text-slate-100">
                                        {key === "type"
                                        ? pcbConf[key] === "double" ? "Yes" : "No"
                                        : pcbConf[key].value}
                                        {key !== "type" && (
                                        <span className="text-gray-500 font-normal text-[10px] dark:text-slate-400">mm</span>
                                        )}
                                    </p>
                                </div>
                            ))}
                            <div className="flex gap-3 py-1">
                                <p className="text-xs w-32 dark:text-slate-300">Cut Depth</p>
                                <p className="text-xs font-medium dark:text-slate-100">
                                    { pcbConf.copperThickness.value + pcbConf.cutOffset.value }<span className="text-gray-500 font-normal text-[10px] dark:text-slate-400">mm</span>
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
export default PcbConfiguration;

const InputField = ({name, label, value, maxValue, handleInput, defaultValue = 0}) => {
    return (
        <>
            <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black dark:text-slate-200">{ label } <span className="text-gray-500 font-normal text-[10px] dark:text-slate-400">(mm)</span></label>
                <input 
                    value={value}
                    className="rounded w-32 focus:outline-none text-center text-xs py-1 border dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100" 
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
