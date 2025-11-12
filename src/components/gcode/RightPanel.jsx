import { useEffect, useState } from "react";
import JobDirectory from "../ui/JobDirectory";
import Select from "../ui/Select";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";
import VBitIcon from "../icons/VBitIcon";
import NormalBitIcon from "../icons/NormalBitIcon";
const jobsData = [
    {
      name: "Top Layer",
      files: [
        { name: "Traces - Top", id: "v2-traces-top" },
        { name: "Drill - Top", id: "v2-drill-top" },
        { name: "Outline", id: "v2-outline" },
      ],
    },
    {
      name: "Bottom Layer",
      files: [
        { name: "Traces - Top", id: "v3-traces-top" },
        { name: "Drill - Top", id: "v3-drill-top" },
        { name: "Outline", id: "v3-outline" },
      ],
    },
  ];

const RightPanel = () => {
  const { toolLib } = useApp();
    const [ selectedTool, setSelectedTool ] = useState('Selecte Tool');
    const [ currentTool, setCurrentTool ] = useState(null)

    const toolOptions = toolLib.map(tool => ({ ...tool, label: tool.name }));

    useEffect(() => {
      const updatedTool = toolLib.find(tool => tool.id === selectedTool)
      setCurrentTool(updatedTool)
    }, [selectedTool, toolLib])


    return (
        <div className="flex flex-col h-full bg-white pb-3 rounded-md shadow overflow-y-auto">
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-t-md border-b">
                <p className="font-medium text-sm text-gray-700">Setup</p>
            </div>

            <div className="flex flex-col mt-2 gap-3 px-4">
              <div className="flex justify-between items-center gap-2 mt-3">
                  <p className="text-xs text-black text-nowrap tracking-wide">Type</p>
                  <div className="bg-white w-44">
                      <Select 
                          options={toolOptions} 
                          selected={selectedTool} 
                          setSelected={setSelectedTool}
                      />
                  </div>
              </div>

              { currentTool && currentTool.type && 
                <div className="flex items-center gap-3 border border-x-orange-500 px-2 rounded-md mt-2">
                  { currentTool.type === 'vbit' ? (
                    <VBitIcon angle={currentTool.angle} className={'w-12 h-12 p-1'} />
                  ):(
                    <NormalBitIcon className={'w-12 h-12 p-1'} />
                  )}
                  <p className="truncate text-sm">{currentTool.name}</p>
                </div>
              }
              <div className="flex justify-between items-center gap-2 mt-2">
                <label className="text-xs text-black">Tool Number</label>
                <input 
                  value={1}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">Diameter <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                <input 
                  value={3}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">Maximum Cut Depth <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                <input 
                  value={3}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">Offset Stepover<span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                <input 
                  value={3}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>

              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center">
                  <label className="text-xs text-black">Offset Number</label>
                  <motion.button
                    // onClick={() => handleInput("offsetNum", tool.offsetNum === 0 ? 1 : 0)}
                    whileTap={{ scale: 0.9 }}
                    className="relative w-4 h-4 ml-4 flex items-center justify-center border rounded bg-white border-gray-400 hover:border-orange-500 transition-colors"
                  >
                    <motion.div
                      initial={false}
                      animate={{
                          // scale: tool.offsetNum === 0 ? 1 : 0,
                          // opacity: tool.offsetNum === 0 ? 1 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="absolute w-3 h-3 bg-orange-500 rounded-sm"
                    />
                  </motion.button>

                  <span className="text-xs pl-1 font-medium text-black tracking-wider">Fill</span>
                </div>
                <input
                  className={cn(
                      "rounded w-20 text-center focus:outline-none text-xs py-1 border px-2 transition-all duration-300 focus:border-l-2 focus:border-l-orange-500",
                      // tool.offsetNum === 0 ? "opacity-90 cursor-not-allowed border-white" : ""
                  )}
                  type="number"
                  min={1}
                  step={0.1}
                  // value={tool.offsetNum}
                  onChange={e => handleInput('offsetNum', e.target.value)}
                  onBlur={() => cleanInput('offsetNum', 1, 1)}
                  // disabled={tool.offsetNum === 0}
                />
              </div>

              <div className="h-px border my-2" />

              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">Feed Rate<span className="text-gray-500 font-normal text-[10px]">(mm/s)</span></label>
                <input 
                  value={3}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">Plunge Rate<span className="text-gray-500 font-normal text-[10px]">(mm/s)</span></label>
                <input 
                  value={3}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">RPM<span className="text-gray-500 font-normal text-[10px]">(mm/s)</span></label>
                <input 
                  value={3}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>
            </div>
        </div>
    );
};

export default RightPanel;
