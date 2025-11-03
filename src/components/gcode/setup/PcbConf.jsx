import { PhotoIcon } from "@heroicons/react/24/outline";
import { useApp } from "../../context/AppContext"
import PCB from "./PCB";
// import ImageSelect from "../../ui/ImageSelect"

const PcbConfiguration = () => {
    const { machineConf, selectedMachine } = useApp();
    // const machineOptions = machineConf.map(item => ({ name: item.machine, url: item.image, ...item }));

    return (
        <>
            <div className="flex gap-3 p-3 h-full">
                <div className="flex-1 py-3 px-2">
                    <div className="bg-zinc-100 flex-1 p-4 mx-2 my-1 flex flex-col gap-3 rounded h-full">
                        <div className="flex justify-between items-center gap-2">
                            <label className="text-xs text-black">Length <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                            <input 
                                className="rounded w-32 focus:outline-none text-center text-xs py-1 border" 
                                type="number"
                            />
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <label className="text-xs text-black">Width <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                            <input 
                                className="rounded w-32 focus:outline-none text-center text-xs py-1 border" 
                                type="number"
                            />
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <label className="text-xs text-black">Thickness <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                            <input 
                                className="rounded w-32 focus:outline-none text-center text-xs py-1 border" 
                                type="number"
                            />
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <label className="text-xs text-black">Copper Thickness <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                            <input 
                                className="rounded w-32 focus:outline-none text-center text-xs py-1 border" 
                                type="number"
                            />
                        </div>
                        <div className="flex justify-between items-center gap-2">
                            <label className="text-xs text-black">Additional Cut Offset <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                            <input 
                                className="rounded w-32 focus:outline-none text-center text-xs py-1 border" 
                                type="number"
                            />
                        </div>

                    </div>
                </div>
                <div className="flex-1 p-3">
                    <PCB className={'w-full p-4 h-auto'} />
                    <div className="flex flex-col gap-2 p-3">
                        <div className="flex gap-3">
                            <p className="text-xs w-32">Doubleside </p>
                            <p className="text-xs font-medium">Yes</p>
                        </div>
                        <div className="flex gap-3">
                            <p className="text-xs w-32">Length </p>
                            <p className="text-xs font-medium">234  <span className="text-gray-500 font-normal text-[10px]">mm</span></p>
                        </div>
                        <div className="flex gap-3">
                            <p className="text-xs w-32">Width </p>
                            <p className="text-xs font-medium">123  <span className="text-gray-500 font-normal text-[10px]">mm</span></p>
                        </div>
                        <div className="flex gap-3">
                            <p className="text-xs w-32">Thickness </p>
                            <p className="text-xs font-medium">3  <span className="text-gray-500 font-normal text-[10px]">mm</span></p>
                        </div>
                        <div className="flex gap-3">
                            <p className="text-xs w-32">Copper Thickness </p>
                            <p className="text-xs font-medium">1  <span className="text-gray-500 font-normal text-[10px]">mm</span></p>
                        </div>
                        <div className="flex gap-3">
                            <p className="text-xs w-32">Additional Cut Offset </p>
                            <p className="text-xs font-medium">1  <span className="text-gray-500 font-normal text-[10px]">mm</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default PcbConfiguration;