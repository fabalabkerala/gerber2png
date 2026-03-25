import { useState } from "react";
import { motion } from "motion/react";
import { useGerberSettings } from "../../context/GerberContext";
import { cn } from "../../../utils/cn";
import { ArrowRightEndOnRectangleIcon, ArrowRightIcon, CheckCircleIcon, DocumentCheckIcon, PhotoIcon } from "@heroicons/react/24/outline";

const ProcessSteps = ({ 
    modsWindowRef, 
    selectedPng, 
    openMods, 
    currentStep, 
    completedSteps, 
    setCurrentStep, 
    setCompletedSteps 
}) => {
    const { 
        doubleSide,
        modsMachine,
        toolConfig,
        updateToolConfig,
        saveSettings,
        resetToolConfig
    } = useGerberSettings();

    const [isDirty, setIsDirty] = useState(false);
    const [saved, setSaved] = useState(false);

    // ------------------------
    // Steps
    // ------------------------
    const steps = doubleSide
        ? [
            { label: "Top", sub: "Trace", key: "trace" },
            { label: "Drill", sub: "Holes", key: "drill" },
            { label: "Flip", sub: "Align", key: null },
            { label: "Bottom", sub: "Trace", key: "trace" },
            { label: "Cut", sub: "Outline", key: "outline" },
        ]
        : [
            { label: "Trace", sub: "Copper", key: "trace" },
            { label: "Drill", sub: "Holes", key: "drill" },
            { label: "Cut", sub: "Outline", key: "outline" },
        ];

    const current = steps[currentStep];
    const configKey = current?.key;
    const config = toolConfig?.[modsMachine]?.[configKey];

    // ------------------------
    // Handlers
    // ------------------------
    const handleChange = (key, value) => {
        if (!configKey) return;
        updateToolConfig(configKey, key, value);
        setIsDirty(true);
        setSaved(false);
    };

    const handleSave = () => {
        saveSettings();
        setIsDirty(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
    };

    const handleComplete = () => {
        setCompletedSteps(prev => [...prev, currentStep]);
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleUndo = () => {
        if (!completedSteps.length) return;
        const last = completedSteps[completedSteps.length - 1];
        setCompletedSteps(prev => prev.slice(0, -1));
        setCurrentStep(last);
    };

    return (
        <>
            { modsWindowRef?.current?.window && (
                <div className="pb-5 px-2 my-2">
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl py-4 mb-4">
                        <div className="flex items-center justify-between relative">
                            {/* Base line */}
                            <div className="absolute top-4 left-0 right-0 h-[1px] bg-slate-200" />

                            {/* Progress line */}
                            <motion.div
                                className="absolute top-4 left-0 h-[1px] bg-indigo-500"
                                animate={{
                                    width: `${(currentStep / (steps.length - 1)) * 100}%`
                                }}
                                transition={{ duration: 0.4 }}
                            />

                            {steps.map((step, index) => {
                                const isActive = index === currentStep;
                                const isCompleted = completedSteps.includes(index);
                                const isLocked = index > currentStep;
                                const isLastCompleted = completedSteps[completedSteps.length - 1] === index;

                                return (
                                    <div key={index} className="flex flex-col items-center z-10 w-full">

                                        {/* NODE */}
                                        <motion.div
                                            animate={{ scale: isActive ? 1.15 : 1 }}
                                            className={`
                                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border transition-all
                                                ${isCompleted && "bg-teal-500 text-white border-teal-500"}
                                                ${isActive && "bg-indigo-500 text-white border-indigo-500 ring-4 ring-indigo-100"}
                                                ${isLocked && "bg-gray-100 text-gray-400"}
                                            `}
                                        >
                                            {isCompleted ? "✓" : index + 1}
                                        </motion.div>

                                        {/* LABEL */}
                                        <div className="mt-2 text-center">
                                            <p className={`text-xs font-semibold ${isActive ? "text-indigo-600" : "text-gray-700"}`}>
                                                {step.label}
                                            </p>
                                            <p className="text-[10px] text-gray-400">
                                                {step.sub}
                                            </p>
                                        </div>

                                        {/* ACTION AREA (KEY CHANGE 🔥) */}
                                        <div className="mt-2 h-6 flex items-center justify-center gap-1">

                                            {/* COMPLETE → only active */}
                                            {isActive && !completedSteps.includes(index) && (
                                                <>
                                                    <motion.button
                                                        className="flex justify-center text-[10px] px-2 py-1 rounded-md items-center gap-2 shadow bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-500" 
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => openMods(modsMachine)}
                                                    >
                                                        <p className="font-medium ps-0.5 text-white">Send to Mods</p>
                                                    </motion.button>
                                                    <motion.button
                                                        whileTap={{ scale: 0.92 }}
                                                        onClick={handleComplete}
                                                        className="
                                                            text-[10px] px-2 py-1 rounded-md
                                                            bg-indigo-50 text-indigo-600 border border-indigo-200
                                                            hover:bg-indigo-100 transition
                                                        "
                                                    >
                                                        Mark as Completed
                                                    </motion.button>
                                                </>
                                            )}

                                            {/* UNDO → only last completed */}
                                            {isCompleted && isLastCompleted && (
                                                <motion.button
                                                    whileTap={{ scale: 0.92 }}
                                                    onClick={handleUndo}
                                                    className="
                                                        text-[10px] px-2 py-1 rounded-md
                                                        bg-red-50 text-red-500 border border-red-200
                                                        hover:bg-red-100 transition
                                                    "
                                                >
                                                    Undo
                                                </motion.button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                    </div>

                    <motion.div
                        key={configKey}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="min-h-[200px] hidden"
                    >
                        {!configKey && (
                            <div className="bg-slate-100 rounded-xl p-4 text-center text-xs text-gray-400">
                                No configuration required
                            </div>
                        )}

                        {configKey && config && (
                            <>
                                <div className="flex flex-col rounded-xl gap-3">
                                    <motion.div
                                        whileHover={{ y: -2 }}
                                        className="flex gap-4 items-start mb-3 rounded-xl transition"
                                    >                                   
                                        <div className="bg-slate-50 rounded-xl p-4 flex-1">
                                            {/* TOOL */}
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs w-24 text-black">Tool</label>
                                                <input
                                                    value={config.tool}
                                                    onChange={(e) => handleChange("tool", e.target.value)}
                                                    className="rounded-lg w-full focus:outline-none text-xs py-1.5 px-2 border bg-white"
                                                />
                                            </div>

                                            {/* DEPTH + FEED */}
                                            <div className="flex gap-4 justify-between">

                                                {config.depth !== undefined && (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <label className="text-xs w-24 text-black">Depth</label>
                                                        <input
                                                            type="number"
                                                            value={config.depth}
                                                            onChange={(e) => handleChange("depth", +e.target.value)}
                                                            className="rounded-lg w-28 text-center text-xs py-1.5 border bg-white"
                                                        />
                                                    </div>
                                                )}

                                                {config.feedRate !== undefined && (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <label className="text-xs w-24 text-black">Feed</label>
                                                        <input
                                                            type="number"
                                                            value={config.feedRate}
                                                            onChange={(e) => handleChange("feedRate", +e.target.value)}
                                                            className="rounded-lg w-28 text-center text-xs py-1.5 border bg-white"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* PASS DEPTH */}
                                            {config.passDepth !== undefined && (
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs w-24 text-black">Pass Depth</label>
                                                    <input
                                                        type="number"
                                                        value={config.passDepth}
                                                        onChange={(e) => handleChange("passDepth", +e.target.value)}
                                                        className="rounded-lg w-28 text-center text-xs py-1.5 border bg-white"
                                                    />
                                                </div>
                                            )}

                                            {/* TABS */}
                                            {config.tabs !== undefined && (
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs w-24 text-black">Tabs</label>
                                                    <input
                                                        type="checkbox"
                                                        checked={config.tabs}
                                                        onChange={(e) => handleChange("tabs", e.target.checked)}
                                                    />
                                                </div>
                                            )}

                                            {/* ACTION ROW */}
                                            <div className="flex items-center mt-4">

                                                {/* FILE PREVIEW STYLE (match LayoutSetup) */}
                                                <div className={cn(
                                                    "flex items-center gap-1 bg-white border py-1 px-2 rounded text-[10px] text-gray-500 mr-auto",
                                                    isDirty ? "opacity-100" : "opacity-60"
                                                )}>
                                                    <DocumentCheckIcon width={14} height={14} stroke="green" />
                                                    {isDirty ? "Unsaved changes" : "Saved config"}
                                                </div>

                                                {/* RESET */}
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={resetToolConfig}
                                                    className="flex items-center gap-1 border bg-white rounded-lg overflow-hidden mr-2"
                                                >
                                                    <div className="bg-gray-100 px-2 py-1.5 border-2 border-white">
                                                        ↺
                                                    </div>
                                                    <p className="text-xs text-gray-600 pr-3">Reset</p>
                                                </motion.button>

                                                {/* SAVE (MATCH PRIMARY BUTTON STYLE) */}
                                                <motion.button
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={handleSave}
                                                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg shadow bg-gradient-to-r from-[#D3346E] to-[#B81D50] hover:from-[#B81D50] hover:to-[#D3346E]"
                                                >
                                                    <p className="font-medium text-xs text-white tracking-wider px-2">
                                                        {saved ? "Saved" : "Save"}
                                                    </p>
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div> 
            )}
        </>
    );
};

export default ProcessSteps;