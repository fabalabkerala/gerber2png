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
import useMods from "./hooks/useMods";
import useModsValidator from "./hooks/useModsValidator";
import { buildCustomProgramUrl, deriveProgramNameFromUrl, validateJsonUrl } from "./utils/modsProgramUtils";
import useCustomPrograms from "./hooks/useCustomPrograms";

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

const ModsPanel = ({showModsPanel, setShowModsPanel, selectedPng, setSelectedPng}) => {
    const [customMode, setCustomMode] = useState('url');
    const [customName, setCustomName] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const [customUrlCheckState, setCustomUrlCheckState] = useState('idle');
    const [customUrlCheckError, setCustomUrlCheckError] = useState('');
    const [customJsonName, setCustomJsonName] = useState('');
    const [customJsonContent, setCustomJsonContent] = useState('');
    const [customJsonCheckState, setCustomJsonCheckState] = useState('idle');
    const [customJsonError, setCustomJsonError] = useState('');
    const [isCustomNameManuallyEdited, setIsCustomNameManuallyEdited] = useState(false);
    const [isCustomProgramModalOpen, setIsCustomProgramModalOpen] = useState(false);

    const lastSelectedMachineRef = useRef(machineOption[0].id);
    const lastNormalizedCustomUrlRef = useRef('');

    const { verifyRemoteFile, validateCustomProgram } = useModsValidator();
    const { 
        programs : customPrograms, 
        preferredMachine, 
        setPreferredMachine, 
        addCustomProgram, 
        removeCustomProgram
    } = useCustomPrograms(machineOption[0].id);

    const resetCustomProgramDraft = () => {
        setCustomMode('url');
        setCustomName('');
        setCustomUrl('');
        setCustomUrlCheckState('idle');
        setCustomUrlCheckError('');
        setCustomJsonName('');
        setCustomJsonContent('');
        setCustomJsonCheckState('idle');
        setCustomJsonError('');
        setIsCustomNameManuallyEdited(false);
    };

    const closeCustomProgramModal = () => {
        resetCustomProgramDraft();
        setIsCustomProgramModalOpen(false);
    };

    const customProgramOptions = useMemo(() => (
        customPrograms.map((program) => ({
            ...program,
            id: program.id,
            label: `Custom · ${program.label}`,
            url: buildCustomProgramUrl(program),
            icon: program.type === 'json' ? DocumentArrowUpIcon : LinkIcon,
        }))
    ), [customPrograms]);

    const trimmedCustomUrl = customUrl.trim();
    const derivedName = customMode === 'json' ? customJsonName.replace(/\.[^/.]+$/, '').trim() : deriveProgramNameFromUrl(trimmedCustomUrl);
    const finalName = customName.trim() || derivedName || 'Custom Program';

    useEffect(() => {
        if (lastNormalizedCustomUrlRef.current === trimmedCustomUrl) return;
        lastNormalizedCustomUrlRef.current = trimmedCustomUrl;
        setIsCustomNameManuallyEdited(false);
    }, [trimmedCustomUrl]);

    const urlError = validateJsonUrl(trimmedCustomUrl, customPrograms);

    useEffect(() => {
        if (customMode !== 'url') return
        if (!trimmedCustomUrl || urlError) return;

        let isActive = true;
        const controller = new AbortController();

        const run = async () => {
            setCustomUrlCheckState('checking');
            setCustomUrlCheckError('');

            try {
                const result = await verifyRemoteFile(trimmedCustomUrl, controller.signal, selectedPng);
                if (!isActive) return;

                if (result.ok) {
                    setCustomUrlCheckState('valid');
                } else {
                    setCustomUrlCheckState('invalid');
                    setCustomUrlCheckError(result.message);
                }

            } catch (error) {
                if (!isActive || error.name === 'AbortError') return;
                setCustomUrlCheckState('invalid');
                setCustomUrlCheckError('An error occurred while checking the URL.');
            }
        }

        const timout = setTimeout(run, 350);

        return () => {
            isActive = false;
            clearTimeout(timout);
            controller.abort();
        }
    }, [customMode, urlError, trimmedCustomUrl]);

    useEffect(() => {
        if (customMode === 'url' && customUrlCheckState !== 'valid') return;
        if (customMode === 'json' && (customJsonCheckState !== 'valid' || !customJsonContent || customJsonError)) return;
        if (customName.trim() || isCustomNameManuallyEdited) return;

        if (derivedName) {
            setCustomName(derivedName);
        }
    }, [customMode, customName, customUrlCheckState, customJsonCheckState, customJsonContent, customJsonError, derivedName, isCustomNameManuallyEdited]);

    const handleCustomNameChange = (value) => {
        setCustomName(value);
        setIsCustomNameManuallyEdited(true);
    };

    const handleCustomModeChange = (value) => {
        setCustomMode(value);
    };

    const customProgramHelper = customMode === 'json'
        ? (customJsonCheckState === 'checking'
            ? 'Checking whether this JSON program can boot in Mods and acknowledge a PNG transfer...'
            : customJsonCheckState === 'valid'
                ? 'JSON file verified. This program responded to the test PNG transfer and is ready to save.'
                : customJsonName
                    ? 'We test the uploaded program in Mods before saving it, so only real message-compatible programs are accepted.'
                    : 'Upload a Mods JSON program file and we will verify the actual Mods connection before saving it.')
        : (!trimmedCustomUrl
            ? 'Paste the public URL of your hosted JSON program. We will verify that the file is reachable before saving it.'
            : customUrlCheckState === 'checking'
                ? 'Checking whether the hosted JSON file is reachable...'
                : customUrlCheckState === 'valid'
                    ? 'File found. This link will open in Mods using the ?program=<link> format.'
                    : 'This hosted JSON link will open in Mods as ?program=<your-link> once the file check passes.');

    const customProgramValidationError = customMode === 'json'
        ? customJsonError
        : urlError || customUrlCheckError;
    const isCustomProgramReady = customMode === 'json'
        ? customJsonCheckState === 'valid' && Boolean(customJsonContent) && !customJsonError
        : Boolean(trimmedCustomUrl) && !customProgramValidationError && customUrlCheckState === 'valid';

    const machineOptions = useMemo(() => {
        const createOption = {
            id: CUSTOM_PROGRAM_CREATE_ID,
            label: 'Add Custom Program…',
            url: null,
            icon: PlusCircleIcon,
        };
        return [createOption, ...customProgramOptions, ...machineOption,];
    }, [customProgramOptions]);

    const activeMachine = useMemo(
        () => machineOptions.find((option) => option.id === preferredMachine) || machineOption[0],
        [machineOptions, preferredMachine]
    );

    const saveCustomProgram = () => {
        if (!isCustomProgramReady) return;

        addCustomProgram(
            customMode, 
            finalName, 
            customMode === 'json' ? customJsonContent : trimmedCustomUrl
        );
        closeCustomProgramModal();
    };

    const handleCustomJsonUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setCustomMode('json');
            setCustomJsonName(file.name);
            setCustomJsonContent('');
            setCustomJsonCheckState('checking');
            setCustomJsonError('');
            setCustomUrl('');
            setCustomUrlCheckState('idle');
            setCustomUrlCheckError('');

            const validationResult = await validateCustomProgram(file, selectedPng);

            if (!validationResult.ok) {
                setCustomJsonCheckState('invalid');
                setCustomJsonError(validationResult.message);
                return;
            }

            const text = await file.text();
            setCustomJsonContent(text);
            setCustomJsonCheckState('valid');

            if (!isCustomNameManuallyEdited && !customName.trim()) {
                setCustomName(file.name.replace(/\.[^/.]+$/, '').trim());
            }
        } catch (error) {
            console.error('Error validating custom JSON program:', error);
            setCustomJsonName(file.name);
            setCustomJsonContent('');
            setCustomJsonCheckState('invalid');
            setCustomJsonError('Upload a valid JSON program file that Mods can open and acknowledge.');
        } finally {
            event.target.value = '';
        }
    };

    const handleMachineSelect = (value) => {
        if (value === CUSTOM_PROGRAM_CREATE_ID) {
            resetCustomProgramDraft();
            setIsCustomProgramModalOpen(true);
            return;
        }
        setPreferredMachine(value);
    };

    const useCustomProgram = (programId) => {
        setPreferredMachine(programId);
        closeCustomProgramModal();
    };

    const { 
        modsStatus, 
        isConnected,
        openMods, 
        updateMods, 
        modsImage ,
        currentStep, setCurrentStep,
        completedSteps, setCompletedSteps,
    } = useMods({ selectedPng, setSelectedPng, machineOptions });

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
                                                
                                            ):(
                                                <>
                                                    <PhotoIcon width={20} height={20} strokeWidth={2} stroke="gray" />
                                                    <p className="text-xs font-medium dark:text-slate-300">No Preview Available</p>
                                                </>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col min-w-96">
                                            <div className={cn(
                                                "mb-3 flex items-center justify-between rounded-xl border pl-5 pr-3 py-3 transition",
                                                isConnected
                                                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:border-emerald-500/20 dark:from-slate-950 dark:to-slate-900"
                                                    : "border-slate-200 bg-gradient-to-br from-slate-50 to-white dark:border-slate-800 dark:from-slate-950 dark:to-slate-900"
                                            )}>
                                                <div className={cn("min-w-0", !isConnected && "opacity-70")}>
                                                    <p className="truncate text-base font-semibold text-gray-800 dark:text-slate-100">
                                                        {activeMachine?.label || 'Select a machine'}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-1.5">
                                                        <span
                                                            className={cn(
                                                                "h-2.5 w-2.5 rounded-full",
                                                                modsStatus.tone === 'connected' && "bg-emerald-500",
                                                                modsStatus.tone === 'pending' && "bg-amber-400",
                                                                modsStatus.tone === 'error' && "bg-rose-500",
                                                                modsStatus.tone === 'muted' && "bg-slate-300 dark:bg-slate-600"
                                                            )}
                                                        />
                                                        <CheckBadgeIcon
                                                            width={14}
                                                            height={14}
                                                            className={cn(
                                                                modsStatus.tone === 'connected' ? "text-emerald-600 dark:text-emerald-300" : "text-slate-400 dark:text-slate-500"
                                                            )}
                                                        />
                                                        <p
                                                            className={cn(
                                                                "text-xs font-medium",
                                                                modsStatus.tone === 'connected' && "text-emerald-700 dark:text-emerald-300",
                                                                modsStatus.tone === 'pending' && "text-amber-700 dark:text-amber-300",
                                                                modsStatus.tone === 'error' && "text-rose-700 dark:text-rose-300",
                                                                modsStatus.tone === 'muted' && "text-slate-500 dark:text-slate-400"
                                                            )}
                                                        >
                                                            {modsStatus.label}
                                                        </p>
                                                    </div>
                                                    <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                                        {modsStatus.helper}
                                                    </p>
                                                </div>
                                                <div className={cn(
                                                    "flex items-center rounded-xl border border-slate-200 bg-white/80 px-4 py-4 shadow-sm transition dark:border-slate-700 dark:bg-slate-900/80",
                                                    !isConnected && "opacity-50 saturate-0"
                                                )}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex flex-col items-center justify-center gap-1">
                                                            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                                                {modsImage ? (
                                                                    <img src={modsImage} className="h-full w-full object-contain" />
                                                                ):(
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
                                                        <div className={cn("w-full", isConnected ? "pointer-events-none opacity-60" : "")}>
                                                            <Select 
                                                                options={machineOptions} 
                                                                selected={preferredMachine} 
                                                                setSelected={handleMachineSelect} 
                                                                // onSelect={handleMachineSelect}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> 
                                    </div>

                                    { !isConnected && (
                                        <div className={cn("flex gap-2 items-center mx-2 bg-gradient-to-br from-slate-50 to-teal-100 rounded-xl flex-1 px-3 py-3 dark:from-slate-950/70 dark:to-emerald-500/10")}>
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
                                                )} 
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => openMods(selectedPng, preferredMachine)}
                                            >
                                                <p className="font-medium text-xs ps-0.5 text-white tracking-wider ">Open Mods</p>
                                                <ArrowRightEndOnRectangleIcon width={18} height={18} strokeWidth={2} stroke="white" />
                                            </motion.button>
                                        </div>
                                    )}

                                    <ProcessSteps 
                                        isConnected={isConnected}
                                        selectedPng={selectedPng} 
                                        updateMods={updateMods} 
                                        currentStep={currentStep} 
                                        completedSteps={completedSteps} 
                                        setCurrentStep={setCurrentStep} 
                                        setCompletedSteps={setCompletedSteps}
                                        setSelectedPng={setSelectedPng}
                                    />
                                </div>
                            </div>
                            <AnimatePresence>
                                { modsStatus.tone === 'pending' && (
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
                            setCustomMode={handleCustomModeChange}
                            customName={customName}
                            setCustomName={handleCustomNameChange}
                            customUrl={customUrl}
                            setCustomUrl={setCustomUrl}
                            customUrlCheckState={customUrlCheckState}
                            customJsonName={customJsonName}
                            customJsonCheckState={customJsonCheckState}
                            customJsonError={customJsonError}
                            customPrograms={customPrograms}
                            customProgramHelper={customProgramHelper}
                            customUrlError={customProgramValidationError}
                            customProgramName={finalName}
                            isCustomProgramReady={isCustomProgramReady}
                            handleCustomJsonUpload={handleCustomJsonUpload}
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
