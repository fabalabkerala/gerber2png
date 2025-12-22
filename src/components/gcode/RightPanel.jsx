import { useEffect,  useState } from "react";
import Select from "../ui/Select";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";
import { cn } from "../../utils/cn";
import VBitIcon from "../icons/VBitIcon";
import NormalBitIcon from "../icons/NormalBitIcon";
import { useGcode } from "../context/GCodeContext";
import { CogIcon } from "@heroicons/react/20/solid";

const RightPanel = () => {
  const { toolLib, setupCompleted, setPngFiles, pngFiles } = useApp();
  const { currentPngFile, setCurrentPngFile, handleGeneration } = useGcode();
    const [ selectedTool, setSelectedTool ] = useState('Select Tool');
    const [ currentTool, setCurrentTool ] = useState(null)

    const toolOptions = toolLib.map(tool => ({ ...tool, label: tool.name }));

    useEffect(() => {
      if (!currentPngFile) return;

      const updatedTool = toolLib.find(tool => tool.id === selectedTool || tool.id === currentPngFile.tool)
      setCurrentTool(updatedTool)
    }, [selectedTool, toolLib, currentPngFile])

    useEffect(() => {
      if (setupCompleted) {
        const updatedPng = pngFiles.map(png => {
          if (png.job === 'trace') {
              const selectedTool = toolLib
                  .filter(tool => tool.diameter >= 0.3 && tool.diameter <= 0.8)
                  .sort((a, b) => a.diameter - b.diameter)[0] || null;

              return {
                  ...png,
                  tool: selectedTool.id || null,   // in case nothing matches
                  offsetNumber: 1
              }; 
          } else if (png.job === 'drill' || png.job === 'outline') {
              const selectedTool = toolLib
                  .filter(tool => tool.diameter >= 0.3 && tool.diameter <= 0.8)
                  .sort((a, b) => b.diameter - a.diameter)[0] || null;

              return {
                  ...png,
                  tool: selectedTool.id || null,   // in case nothing matches
                  offsetNumber: 1
              }; 
          }

          const defaultTool = toolLib
                  .filter(tool => tool.diameter >= 0.3 && tool.diameter <= 0.8)
                  .sort((a, b) => b.diameter - a.diameter)[0] || null;

          return {
            ...png,
            tool: defaultTool.id,
            offsetNumber: 1
          }
        })
        setPngFiles(updatedPng);
      }
    }, [])


    return (
        <div className="flex flex-col h-full bg-white pb-3 rounded-md shadow overflow-y-auto">
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-t-md border-b">
                <p className="font-medium text-sm text-gray-700">Setup</p>
            </div>

            { currentPngFile ? (
              <div className="flex flex-col mt-2 gap-3 px-4">
                <div className="flex justify-between items-center gap-2 mt-3">
                  <p className="text-xs text-black text-nowrap tracking-wide">Type</p>
                  <div className="bg-white w-44">
                    <Select 
                      options={toolOptions} 
                      selected={currentPngFile.tool || selectedTool} 
                      setSelected={setSelectedTool}
                      onSelect={(id) => {
                        setCurrentPngFile(prev => ({ ...prev, tool: id }))
                      }}
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
                  value={currentTool?.toolNo}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">Diameter <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                <input 
                  value={currentTool?.diameter}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">Maximum Cut Depth <span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                <input 
                  value={currentTool?.maxCutDepth}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">Offset Stepover<span className="text-gray-500 font-normal text-[10px]">(mm)</span></label>
                <input 
                  value={currentTool?.offsetStepOver}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>

              <div className="flex justify-between items-center gap-2">
                <div className="flex items-center">
                  <label className="text-xs text-black">Offset Number</label>
                  <motion.button
                    onClick={() => {
                      setCurrentPngFile(prev => ({ ...prev, offsetNumber: prev.offsetNumber === 0 ? 1 : 0 }))
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="relative w-4 h-4 ml-4 flex items-center justify-center border rounded bg-white border-gray-400 hover:border-orange-500 transition-colors"
                  >
                    <motion.div
                      initial={false}
                      animate={{
                          scale: currentPngFile.offsetNumber === 0 ? 1 : 0,
                          opacity: currentPngFile.offsetNumber === 0 ? 1 : 0,
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
                      currentPngFile.offsetNumber === 0 ? "opacity-90 cursor-not-allowed border-white" : ""
                  )}
                  type="number"
                  min={1}
                  step={0.1}
                  value={currentPngFile.offsetNumber}
                  onInput={(e) => {
                    const val = parseInt(e.target.value);
                    setCurrentPngFile(prev => ({ ...prev, offsetNumber: prev.offsetNumber < 0 ? 0 : val }))
                  }}
                  // onChange={e => handleInput('offsetNum', e.target.value)}
                  // onBlur={() => cleanInput('offsetNum', 1, 1)}
                  // disabled={tool.offsetNum === 0}
                />
              </div>

              <div className="h-px border my-2" />

              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">Feed Rate<span className="text-gray-500 font-normal text-[10px]">(mm/s)</span></label>
                <input 
                  value={currentTool?.feedRate}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">Plunge Rate<span className="text-gray-500 font-normal text-[10px]">(mm/s)</span></label>
                <input 
                  value={currentTool?.plungeRate}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>
              <div className="flex justify-between items-center gap-2">
                <label className="text-xs text-black">RPM<span className="text-gray-500 font-normal text-[10px]">(mm/s)</span></label>
                <input 
                  value={currentTool?.rpm}
                  className="rounded w-20 focus:outline-none text-center text-xs py-0.5 border bg-gray-200" 
                  type="number" 
                  disabled
                />
              </div>

              <div className="flex justify-center items-center gap-2 mt-6 bg-blue-50 py-5 rounded-md">
                <motion.button
                  className="flex justify-center items-center gap-2   bg-sky-500 px-2 py-1.5 rounded shadow" 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleGeneration(currentPngFile)}
                >
                  <p className="text-[0.72rem] ps-0.5 text-white tracking-wider">Generate G-Code</p>
                  <CogIcon width={16} height={16} fill="white" />
                </motion.button>
              </div>
            </div>
            ): (
              <div className="flex flex-col justify-center items-center h-full mt-2 gap-3 px-4">
                  <p className="text-xs text-black text-nowrap tracking-wide">No Data Available</p>              
              </div>
            )}
        </div>
    );
};

export default RightPanel;
