import {
    ArrowRightEndOnRectangleIcon,
    CheckBadgeIcon,
    DocumentArrowUpIcon,
    DocumentCheckIcon,
    LinkIcon,
    PhotoIcon,
    ArrowRightIcon,
    PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "motion/react"
import PropTypes from "prop-types";
import { useEffect, useMemo, useRef, useState } from "react";
import ModalHeader from "../../ui/ModalHeader";
import Select from "../../ui/Select";
import { cn } from "../../../utils/cn";
import { useGerberSettings } from "../../context/GerberContext";
import ProcessSteps from "./ProcessSteps";
import CustomProgramModal from "./CustomProgramModal";

const machineOption = [
    { id: 'carbide-nomad', label: 'Carbide Nomad', url: 'https://modsproject.org/?program=programs/machines/Carbide+Nomad/PCB' },
    { id: 'carvera', label: 'Carvera', url: 'https://modsproject.org/?program=programs/machines/Carvera/mill+2D+PCB' },
    { id: 'carvera-all', label: 'Carvera · PCB All', url: 'https://modsproject.org/?program=programs/machines/Carvera/mill+2D+PCB+all' },
    { id: 'carvera-air', label: 'Carvera Air', url: 'https://modsproject.org/?program=programs/machines/Carvera+Air/PCB' },
    { id: 'gcode', label: 'G-code', url: 'https://modsproject.org/?program=programs/machines/G-code/mill+2D+PCB' },
    { id: 'gcode-leveler', label: 'G-code · PCB Leveler', url: 'https://modsproject.org/?program=programs/machines/G-code/mill+2D+PCB+leveler' },
    { id: 'othermill-bantam', label: 'Othermill-Bantam Tools', url: 'https://modsproject.org/?program=programs/machines/Othermill-Bantam+Tools/PCB' },
    { id: 'roland-mdx', label: 'Roland/MDX mill', url: 'https://modsproject.org/?program=programs/machines/Roland/MDX+mill/PCB' },
    { id: 'mdx', label: 'Roland/SRM-20 mill', url: 'https://modsproject.org/?program=programs/machines/Roland/SRM-20+mill/mill+2D+PCB' },
    { id: 'roland-imodela', label: 'Roland/iModela mill', url: 'https://modsproject.org/?program=programs/machines/Roland/iModela+mill/PCB' },
    { id: 'shopbot', label: 'ShopBot', url: 'https://modsproject.org/?program=programs/machines/ShopBot/mill+2D+PCB' },
]

const CUSTOM_PROGRAM_CREATE_ID = 'custom-program-create';
const CUSTOM_PROGRAM_STORAGE_KEY = 'modsCustomPrograms';
const LEGACY_CUSTOM_PROGRAM_STORAGE_KEY = 'modsCustomProgram';
const PREFERRED_MACHINE_STORAGE_KEY = 'modsPreferredMachine';

const buildCustomProgramUrl = (customProgram) => {
    if (!customProgram) return null;
    if (customProgram.type === 'url') return customProgram.value;

    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(customProgram.value)}`;
    return `https://modsproject.org/?program=${encodeURIComponent(dataUrl)}`;
};

const ModsPanel = ({showModsPanel, setShowModsPanel, selectedPng, setSelectedPng}) => {
    const [ modsStatus, setModsStatus ] = useState('initial');
    const { modsMachine, setModsMachine } = useGerberSettings();

    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [customName, setCustomName] = useState('');
    const [customMode, setCustomMode] = useState('url');
    const [customUrl, setCustomUrl] = useState('');
    const [customJsonName, setCustomJsonName] = useState('');
    const [customJsonContent, setCustomJsonContent] = useState('');
    const [customPrograms, setCustomPrograms] = useState([]);
    const [isCustomProgramModalOpen, setIsCustomProgramModalOpen] = useState(false);

    const modsWindowRef = useRef(null);
    const lastSelectedMachineRef = useRef(machineOption[0].id);

    const resetCustomProgramDraft = () => {
        setCustomName('');
        setCustomMode('url');
        setCustomUrl('');
        setCustomJsonName('');
        setCustomJsonContent('');
    };

    const closeCustomProgramModal = () => {
        resetCustomProgramDraft();
        setIsCustomProgramModalOpen(false);
    };

    useEffect(() => {
        const savedCustomPrograms = localStorage.getItem(CUSTOM_PROGRAM_STORAGE_KEY);
        const legacyCustomProgram = localStorage.getItem(LEGACY_CUSTOM_PROGRAM_STORAGE_KEY);
        const savedPreferredMachine = localStorage.getItem(PREFERRED_MACHINE_STORAGE_KEY);

        let parsedPrograms = [];

        if (savedCustomPrograms) {
            try {
                const parsed = JSON.parse(savedCustomPrograms);
                parsedPrograms = Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                console.warn('Invalid saved Mods custom programs');
            }
        } else if (legacyCustomProgram) {
            try {
                const parsed = JSON.parse(legacyCustomProgram);
                parsedPrograms = [{
                    id: `custom-program-${Date.now()}`,
                    label: parsed.label || 'Imported Custom Program',
                    type: parsed.type,
                    value: parsed.value,
                }];
            } catch (error) {
                console.warn('Invalid legacy Mods custom program');
            }
        }

        setCustomPrograms(parsedPrograms);

        if (savedPreferredMachine) {
            setModsMachine(savedPreferredMachine);
            return;
        }

        if (parsedPrograms.length > 0) {
            setModsMachine(parsedPrograms[0].id);
        }
    }, [setModsMachine]);

    useEffect(() => {
        if (!modsMachine || modsMachine === CUSTOM_PROGRAM_CREATE_ID) return;
        localStorage.setItem(PREFERRED_MACHINE_STORAGE_KEY, modsMachine);
        lastSelectedMachineRef.current = modsMachine;
    }, [modsMachine]);

    useEffect(() => {
        localStorage.setItem(CUSTOM_PROGRAM_STORAGE_KEY, JSON.stringify(customPrograms));
    }, [customPrograms]);

    const customProgramOptions = useMemo(() => (
        customPrograms.map((program) => ({
            ...program,
            id: program.id,
            label: `Custom · ${program.label}`,
            url: buildCustomProgramUrl(program),
            icon: program.type === 'json' ? DocumentArrowUpIcon : LinkIcon,
        }))
    ), [customPrograms]);

    const customProgramName = useMemo(() => (
        customName.trim() || (customMode === 'json'
            ? (customJsonName ? customJsonName.replace(/\.json$/i, '') : 'Custom JSON Program')
            : 'Custom Program')
    ), [customJsonName, customMode, customName]);

    const trimmedCustomUrl = customUrl.trim();

    const customUrlError = useMemo(() => {
        if (customMode !== 'url' || !trimmedCustomUrl) return '';

        try {
            const parsedUrl = new URL(trimmedCustomUrl);
            if (!parsedUrl.protocol.startsWith('http')) {
                return 'Enter a valid http or https URL.';
            }
        } catch (error) {
            return 'Enter a valid program URL.';
        }

        if (customPrograms.some((program) => program.type === 'url' && program.value === trimmedCustomUrl)) {
            return 'This Mods URL is already saved.';
        }

        return '';
    }, [customMode, customPrograms, trimmedCustomUrl]);

    const customJsonError = useMemo(() => {
        if (customMode !== 'json' || !customJsonContent.trim()) return '';

        try {
            JSON.parse(customJsonContent);
        } catch (error) {
            return 'Upload a valid JSON program file.';
        }

        if (customPrograms.some((program) => program.type === 'json' && program.value === customJsonContent)) {
            return 'This JSON program is already saved.';
        }

        return '';
    }, [customJsonContent, customMode, customPrograms]);

    const customProgramHelper = customMode === 'url'
        ? (trimmedCustomUrl
            ? 'Save this Mods link and use it as a selectable machine preset.'
            : 'Paste any Mods program URL to save it as a reusable preset.')
        : (customJsonName
            ? 'Your JSON program is loaded and ready to save.'
            : 'Upload a Mods JSON program file to store it locally.');

    const isCustomProgramReady = customMode === 'url'
        ? Boolean(trimmedCustomUrl) && !customUrlError
        : Boolean(customJsonContent.trim()) && !customJsonError;

    const machineOptions = useMemo(() => {
        const createOption = {
            id: CUSTOM_PROGRAM_CREATE_ID,
            label: 'Add Custom Program…',
            url: null,
            icon: PlusCircleIcon,
        };
        return [...machineOption, ...customProgramOptions, createOption];
    }, [customProgramOptions]);

    const activeMachine = useMemo(
        () => machineOptions.find((option) => option.id === modsMachine) || machineOption[0],
        [machineOptions, modsMachine]
    );

    const hasModsWindow = Boolean(modsWindowRef.current?.window);
    const isModsConnected = modsStatus === 'connected' && hasModsWindow;
    const previewImageUrl = modsWindowRef.current?.image || selectedPng?.url;

    const modsStatusCopy = {
        initial: {
            label: 'Mods not connected',
            tone: 'muted',
            helper: 'Open Mods to unlock the workflow steps and send files.',
        },
        opening: {
            label: 'Opening Mods window',
            tone: 'pending',
            helper: 'Waiting for the Mods program to open in a new tab.',
        },
        sending: {
            label: 'Sending PNG to Mods',
            tone: 'pending',
            helper: 'The selected PNG is being transferred to the Mods workspace.',
        },
        connected: {
            label: 'Mods is connected',
            tone: 'connected',
            helper: 'The workflow is ready. Continue sending each step to Mods.',
        },
        error: {
            label: 'Connection failed',
            tone: 'error',
            helper: 'Mods did not respond in time. Try opening the program again.',
        },
    };

    const currentModsStatus = modsStatusCopy[modsStatus] || modsStatusCopy.initial;

    const saveCustomProgram = () => {
        if (!isCustomProgramReady) return;

        if (customMode === 'url') {
            const payload = {
                id: `custom-program-${Date.now()}`,
                type: 'url',
                value: trimmedCustomUrl,
                label: customProgramName,
            };

            setCustomPrograms((prev) => [...prev, payload]);
            setModsMachine(payload.id);
            closeCustomProgramModal();
            return;
        }

        const payload = {
            id: `custom-program-${Date.now()}`,
            type: 'json',
            value: customJsonContent,
            label: customProgramName,
        };

        setCustomPrograms((prev) => [...prev, payload]);
        setModsMachine(payload.id);
        closeCustomProgramModal();
    };

    const handleJsonUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        setCustomMode('json');
        setCustomJsonName(file.name);
        console.log(
                text
        )
        setCustomJsonContent(text);
        setCustomName(file.name.replace(/\.json$/i, ''));
    };

    const removeCustomProgram = (programId) => {
        setCustomPrograms((prev) => prev.filter((program) => program.id !== programId));

        if (modsMachine === programId) {
            setModsMachine(machineOption[0].id);
            localStorage.setItem(PREFERRED_MACHINE_STORAGE_KEY, machineOption[0].id);
        }
    };

    const handleMachineSelect = (value) => {
        if (value !== CUSTOM_PROGRAM_CREATE_ID) return;

        setModsMachine(lastSelectedMachineRef.current || machineOption[0].id);
        resetCustomProgramDraft();
        setIsCustomProgramModalOpen(true);
    };

    const useCustomProgram = (programId) => {
        setModsMachine(programId);
        closeCustomProgramModal();
    };

    const openMods = async (modsMachine, file) => {
        if (!file?.url) return;

        let modsWindow = modsWindowRef.current?.window;
        const machine = machineOptions.find(opt => opt.id === modsMachine);
        if (!machine) return;
        if (!machine.url) return;

        if (!modsWindow || modsWindow.closed) {
            modsWindow = window.open(machine.url, '_blank');
            setModsStatus('opening');

            if (!modsWindow) {
                setModsStatus('error');
                return;
            }
        }

        modsWindowRef.current = { window: modsWindow, machine: machine, image: file.url };

        const buffer = await fetch(file.url).then(res => res.arrayBuffer());
        setModsStatus('sending');

        const sendInterval = setInterval(() => {
            if (!modsWindowRef.current || modsWindowRef.current.window.closed) {
                clearInterval(sendInterval);
                setModsStatus('initial');
                modsWindowRef.current = null;
                return;
            } 
            modsWindowRef.current.window.postMessage(
                { type: 'png', data: buffer }, 
                'https://modsproject.org'
            );
            modsWindowRef.current.window.focus();
        }, 500);

        const handler = (event) => {
            if (event.origin !== "https://modsproject.org") return;

            if (event.data === "ready") {
                setModsStatus("connected");
                clearInterval(sendInterval);
                clearTimeout(timeout);
            }
        };
        window.addEventListener("message", handler);

        const timeout = setTimeout(() => {
            setModsStatus('error');
            window.removeEventListener("message", handler);
            if (modsWindowRef.current) {
                modsWindowRef.current.window.close();
                modsWindowRef.current = null;
            }
        }, 15000);

        const polling = setInterval(() => {
            if (modsWindow && modsWindow.closed) {
                setModsStatus('initial');
                setCurrentStep(0);
                setCompletedSteps([]);
                window.removeEventListener("message", handler);
                modsWindowRef.current = null;
                clearInterval(polling);
            }
        }, 1000);
    }
    
    return (
        <>
            <AnimatePresence>
                {showModsPanel && (
                    <motion.div
                        className="fixed inset-0 bg-black/10 bg-blend-color-burn flex justify-center items-center z-50 dark:bg-slate-950/70"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white rounded-xl shadow-xl md:w-[900px] flex flex-col overflow-hidden relative max-h-[80vh] dark:bg-slate-900 dark:border dark:border-slate-800"
                            initial={{ y: -30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -30, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ModalHeader title="Mods Workflow" onClose={() => setShowModsPanel(false)} />
                            
                            <div className="overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col gap-2 p-3 pb-8">
                                    <div className="flex gap-4 p-2">
                                        <div className="pt-6 pb-8 pl-8 pr-10 h-44 flex flex-col justify-center items-center border border-dashed rounded-xl dark:border-slate-700 dark:bg-slate-950/40">
                                            { selectedPng.url ? (
                                                <>
                                                <div className="flex h-full w-full">
                                                    <div className="relative h-full w-fit mx-auto">
                                                        <img src={selectedPng.url} alt="dsdfsd" className="h-full object-contain" />

                                                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full h-px bg-zinc-300 my-3" />
                                                        <p className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] text-nowrap font-medium dark:bg-slate-900 dark:text-slate-200">
                                                            {/* {dimension.width} */}
                                                            {selectedPng.width}
                                                            <span className="text-gray-500 font-normal dark:text-slate-400"> mm</span>
                                                        </p>

                                                        <div className="absolute top-0 -right-6 w-px h-full bg-zinc-300 mx-3" />
                                                        <p className="absolute top-1/2 -translate-y-1/2 -right-[48px] bg-white px-2 text-[10px] text-nowrap -rotate-90 origin-center font-medium dark:bg-slate-900 dark:text-slate-200">
                                                            {/* {dimension.height} */}
                                                            {selectedPng.height}
                                                            <span className="text-gray-500 font-normal dark:text-slate-400"> mm</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                </>
                                                
                                            ): (
                                                <>
                                                    <PhotoIcon width={20} height={20} strokeWidth={2} stroke="gray" />
                                                    <p className="text-xs font-medium dark:text-slate-300">No Preview Available</p>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col min-w-96">
                                            <div className={cn(
                                                "mb-3 flex items-center justify-between rounded-xl border px-3 py-3 transition",
                                                isModsConnected
                                                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-500/20 dark:from-slate-950 dark:to-slate-900"
                                                    : "border-slate-200 bg-gradient-to-br from-slate-50 to-white dark:border-slate-800 dark:from-slate-950 dark:to-slate-900"
                                            )}>
                                                <div className={cn("min-w-0", !isModsConnected && "opacity-70")}>
                                                    <p className="truncate text-base font-semibold text-gray-800 dark:text-slate-100">
                                                        {activeMachine?.label || 'Select a machine'}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-1.5">
                                                        <span
                                                            className={cn(
                                                                "h-2.5 w-2.5 rounded-full",
                                                                currentModsStatus.tone === 'connected' && "bg-emerald-500",
                                                                currentModsStatus.tone === 'pending' && "bg-amber-400",
                                                                currentModsStatus.tone === 'error' && "bg-rose-500",
                                                                currentModsStatus.tone === 'muted' && "bg-slate-300 dark:bg-slate-600"
                                                            )}
                                                        />
                                                        <CheckBadgeIcon
                                                            width={14}
                                                            height={14}
                                                            className={cn(
                                                                currentModsStatus.tone === 'connected' ? "text-emerald-600 dark:text-emerald-300" : "text-slate-400 dark:text-slate-500"
                                                            )}
                                                        />
                                                        <p
                                                            className={cn(
                                                                "text-xs font-medium",
                                                                currentModsStatus.tone === 'connected' && "text-emerald-700 dark:text-emerald-300",
                                                                currentModsStatus.tone === 'pending' && "text-amber-700 dark:text-amber-300",
                                                                currentModsStatus.tone === 'error' && "text-rose-700 dark:text-rose-300",
                                                                currentModsStatus.tone === 'muted' && "text-slate-500 dark:text-slate-400"
                                                            )}
                                                        >
                                                            {currentModsStatus.label}
                                                        </p>
                                                    </div>
                                                    <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                                        {currentModsStatus.helper}
                                                    </p>
                                                </div>
                                                <div className={cn(
                                                    "flex items-center rounded-xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm transition dark:border-slate-700 dark:bg-slate-900/80",
                                                    !isModsConnected && "opacity-50 saturate-0"
                                                )}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col items-center justify-center gap-1">
                                                            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                                                {previewImageUrl ? (
                                                                    <img src={previewImageUrl} className="h-full w-full object-contain" />
                                                                ) : (
                                                                    <PhotoIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ArrowRightIcon className="h-3 w-3 text-gray-400 dark:text-slate-500" />
                                                        <div className="flex flex-col items-center justify-center gap-1">
                                                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                                                {selectedPng.url ? (
                                                                    <img src={selectedPng.url} className="h-full w-full object-contain" />
                                                                ) : (
                                                                    <PhotoIcon className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 flex-1 p-4 flex flex-col rounded-xl dark:bg-slate-950/60">
                                                <div className="flex gap-3">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <p className="text-xs w-24 text-black text-nowrap dark:text-slate-200">Machine</p>
                                                        <div className={cn("w-full", hasModsWindow ? "pointer-events-none opacity-60" : "")}>
                                                            <Select 
                                                                options={machineOptions} 
                                                                selected={modsMachine} 
                                                                setSelected={setModsMachine} 
                                                                onSelect={handleMachineSelect}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> 
                                    </div>

                                    { !hasModsWindow && (
                                        <div className={cn("flex gap-2 items-center mx-2 bg-gradient-to-br from-slate-50 to-teal-100 rounded-xl flex-1 px-3 py-3 dark:from-slate-950/70 dark:to-emerald-500/10", selectedPng.url ? "opacity-100 pointer-events-auto" : "opacity-60 pointer-events-none")}>
                                            <div className={cn(
                                                "flex items-end justify-center gap-1 py-1 rounded h-fit mr-auto pr-20",
                                                selectedPng.url ? "opacity-100" : "opacity-0"
                                            )}>
                                                <DocumentCheckIcon width={15} height={15} strokeWidth={2} stroke="green" />
                                                <p className="text-[10px] text-gray-500 max-w-[140px] truncate dark:text-slate-400">{selectedPng.name}.png</p>
                                            </div>
                                            <motion.button
                                                className={cn(
                                                    "flex justify-center items-center gap-2 px-2 py-1.5 rounded-lg shadow bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-500",
                                                    modsMachine === CUSTOM_PROGRAM_CREATE_ID ? "opacity-60 pointer-events-none" : ""
                                                )} 
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => openMods(modsMachine, selectedPng)}
                                            >
                                                <p className="font-medium text-xs ps-0.5 text-white tracking-wider ">Open Mods</p>
                                                <ArrowRightEndOnRectangleIcon width={18} height={18} strokeWidth={2} stroke="white" />
                                            </motion.button>
                                        </div>
                                    )}

                                    <ProcessSteps 
                                        isConnected={isModsConnected}
                                        selectedPng={selectedPng} 
                                        openMods={openMods} 
                                        currentStep={currentStep} 
                                        completedSteps={completedSteps} 
                                        setCurrentStep={setCurrentStep} 
                                        setCompletedSteps={setCompletedSteps}
                                        setSelectedPng={setSelectedPng}
                                    />
                                </div>
                            </div>
                            <AnimatePresence>
                                { modsStatus === 'sending' && (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.25, ease: "easeOut" }}
                                        className="absolute inset-0 bg-white/40 flex items-center justify-center z-[9999] dark:bg-slate-950/50"
                                    >
                                        <motion.div
                                            className="w-12 h-12 border-4 border-[#5545e5] border-t-transparent rounded-full dark:border-cyan-400"
                                            animate={{
                                                rotate: [0, 360],
                                                scale: [1, 1.1, 1],
                                            }}
                                            transition={{
                                                rotate: {
                                                    repeat: Infinity,
                                                    duration: 1,
                                                    ease: "linear",
                                                },
                                                scale: {
                                                    repeat: Infinity,
                                                    duration: 1.2,
                                                    ease: "easeInOut",
                                                },
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                        <CustomProgramModal
                            isOpen={isCustomProgramModalOpen}
                            onClose={closeCustomProgramModal}
                            customMode={customMode}
                            setCustomMode={setCustomMode}
                            customName={customName}
                            setCustomName={setCustomName}
                            customUrl={customUrl}
                            setCustomUrl={setCustomUrl}
                            customJsonName={customJsonName}
                            customPrograms={customPrograms}
                            customProgramHelper={customProgramHelper}
                            customUrlError={customUrlError}
                            customJsonError={customJsonError}
                            customProgramName={customProgramName}
                            isCustomProgramReady={isCustomProgramReady}
                            handleJsonUpload={handleJsonUpload}
                            saveCustomProgram={saveCustomProgram}
                            removeCustomProgram={removeCustomProgram}
                            useCustomProgram={useCustomProgram}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

ModsPanel.propTypes = {
    showModsPanel: PropTypes.bool,
    setShowModsPanel: PropTypes.func
}
export default ModsPanel;
