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
import { useApp } from "../../context/AppContext";
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
const DEFAULT_MODS_URL = 'https://modsproject.org/';
const DEFAULT_MODS_ORIGIN = 'https://modsproject.org';

const extractProgramSourceUrl = (rawUrl) => {
    try {
        const parsedUrl = new URL(rawUrl);
        if (parsedUrl.origin === 'https://modsproject.org') {
            if (parsedUrl.searchParams.has('program')) {
                return (parsedUrl.searchParams.get('program') || '').trim();
            }

            if (parsedUrl.searchParams.has('json')) {
                return (parsedUrl.searchParams.get('json') || '').trim();
            }
        }
    } catch (error) {
        return rawUrl;
    }

    return rawUrl;
};

const buildCustomProgramUrl = (customProgram) => {
    if (!customProgram) return null;
    try {
        if (customProgram.type === 'json') {
            return CUSTOM_JSON_MODS_URL;
        }

        const modsUrl = new URL(DEFAULT_MODS_URL);
        const sourceUrl = extractProgramSourceUrl(customProgram.value);
        new URL(sourceUrl);
        modsUrl.searchParams.set('program', sourceUrl);
        return modsUrl.toString();

    } catch (error) {
        return null;
    }
};

const hasFileTarget = (rawUrl) => {
    try {
        const parsedUrl = new URL(extractProgramSourceUrl(rawUrl));
        const lastSegment = parsedUrl.pathname.split('/').filter(Boolean).pop();
        return Boolean(lastSegment && lastSegment.includes('.'));
    } catch (error) {
        return false;
    }
};

const deriveProgramNameFromUrl = (rawUrl) => {
    try {
        const parsedUrl = new URL(extractProgramSourceUrl(rawUrl));
        const lastSegment = parsedUrl.pathname.split('/').filter(Boolean).pop();
        if (!lastSegment) return '';

        const decodedName = decodeURIComponent(lastSegment);
        return decodedName.replace(/\.[^/.]+$/, '').trim();
    } catch (error) {
        return '';
    }
};

const verifyRemoteFile = async (url, signal) => {
    const request = async (method) => fetch(url, {
        method,
        signal,
        headers: method === 'GET' ? { Range: 'bytes=0-0' } : undefined,
    });

    try {
        const headResponse = await request('HEAD');
        if (headResponse.ok) return { ok: true };
        if (![403, 405, 501].includes(headResponse.status)) {
            return { ok: false, message: `The file could not be reached (${headResponse.status}).` };
        }
    } catch (error) {
        if (error.name === 'AbortError') throw error;
    }

    try {
        const getResponse = await request('GET');
        if (getResponse.ok) return { ok: true };
        return { ok: false, message: `The file could not be reached (${getResponse.status}).` };
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        return {
            ok: false,
            message: 'The browser could not verify this file. Make sure the link is public and allows direct access.',
        };
    }
};

const hasPostMessageOption = (value, visited = new WeakSet()) => {
    if (!value || typeof value !== 'object') return false;
    if (visited.has(value)) return false;
    visited.add(value);

    if (Array.isArray(value)) {
        return value.some((item) => hasPostMessageOption(item, visited));
    }

    return Object.entries(value).some(([key, nestedValue]) => {
        if (key === 'postMessage') return true;
        return hasPostMessageOption(nestedValue, visited);
    });
};

const buildProcessSteps = (pngFiles) => {
    const ORDER = [
        "toplayer_trace",
        "toplayer_drill",
        "toplayer_outline",
        "bottomlayer_trace",
        "bottomlayer_drill",
        "bottomlayer_outline",
    ];

    const map = {};

    pngFiles.forEach((file) => {
        const key = `${file.directory}_${file.job}`;
        map[key] = {
            label: file.job,
            sub: file.directory,
            key: file.job,
            file,
        };
    });

    return ORDER.map((key) => map[key]).filter(Boolean);
};

const getMachineRuntimeConfig = (machine) => {
    if (machine?.type === 'json') {
        return {
            url: DEFAULT_MODS_URL,
            origin: DEFAULT_MODS_ORIGIN,
            requiresProgramBootstrap: true,
        };
    }

    return {
        url: machine?.url,
        origin: machine?.url ? new URL(machine.url).origin : DEFAULT_MODS_ORIGIN,
        requiresProgramBootstrap: false,
    };
};

const ModsPanel = ({showModsPanel, setShowModsPanel, selectedPng, setSelectedPng}) => {
    const [ modsStatus, setModsStatus ] = useState('initial');
    const { modsMachine, setModsMachine } = useGerberSettings();
    const { pngFiles } = useApp();

    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [customMode, setCustomMode] = useState('url');
    const [customName, setCustomName] = useState('');
    const [customUrl, setCustomUrl] = useState('');
    const [customUrlCheckState, setCustomUrlCheckState] = useState('idle');
    const [customUrlCheckError, setCustomUrlCheckError] = useState('');
    const [customJsonName, setCustomJsonName] = useState('');
    const [customJsonContent, setCustomJsonContent] = useState('');
    const [customJsonError, setCustomJsonError] = useState('');
    const [isCustomNameManuallyEdited, setIsCustomNameManuallyEdited] = useState(false);
    const [customPrograms, setCustomPrograms] = useState([]);
    const [isCustomProgramModalOpen, setIsCustomProgramModalOpen] = useState(false);

    const modsWindowRef = useRef(null);
    const lastSelectedMachineRef = useRef(machineOption[0].id);
    const lastNormalizedCustomUrlRef = useRef('');

    const resetCustomProgramDraft = () => {
        setCustomMode('url');
        setCustomName('');
        setCustomUrl('');
        setCustomUrlCheckState('idle');
        setCustomUrlCheckError('');
        setCustomJsonName('');
        setCustomJsonContent('');
        setCustomJsonError('');
        setIsCustomNameManuallyEdited(false);
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

    const processSteps = useMemo(() => buildProcessSteps(pngFiles), [pngFiles]);

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
    const normalizedCustomUrl = useMemo(() => extractProgramSourceUrl(trimmedCustomUrl), [trimmedCustomUrl]);
    const derivedCustomProgramName = useMemo(
        () => customMode === 'json'
            ? (customJsonName ? customJsonName.replace(/\.[^/.]+$/, '').trim() : '')
            : deriveProgramNameFromUrl(normalizedCustomUrl),
        [customJsonName, customMode, normalizedCustomUrl]
    );
    const customProgramName = useMemo(
        () => customName.trim() || derivedCustomProgramName || 'Custom Program',
        [customName, derivedCustomProgramName]
    );

    useEffect(() => {
        if (lastNormalizedCustomUrlRef.current === normalizedCustomUrl) return;
        lastNormalizedCustomUrlRef.current = normalizedCustomUrl;
        setIsCustomNameManuallyEdited(false);
    }, [normalizedCustomUrl]);

    const customUrlError = useMemo(() => {
        if (!trimmedCustomUrl) return '';

        let parsedUrl;
        try {
            parsedUrl = new URL(normalizedCustomUrl);
            if (!parsedUrl.protocol.startsWith('http')) {
                return 'Enter a valid http or https URL.';
            }
        } catch (error) {
            return 'Enter a valid program URL.';
        }

        if (!hasFileTarget(normalizedCustomUrl)) {
            return 'Use a direct file link, such as a hosted .json file, not just a folder or site URL.';
        }

        if (customPrograms.some((program) => program.type === 'url' && extractProgramSourceUrl(program.value) === normalizedCustomUrl)) {
            return 'This Mods URL is already saved.';
        }

        return '';
    }, [customPrograms, normalizedCustomUrl, trimmedCustomUrl]);

    useEffect(() => {
        if (customMode !== 'url') {
            setCustomUrlCheckState('idle');
            setCustomUrlCheckError('');
            return;
        }

        if (!trimmedCustomUrl || customUrlError) {
            setCustomUrlCheckState('idle');
            setCustomUrlCheckError('');
            return;
        }

        let isActive = true;
        const controller = new AbortController();

        const timeoutId = window.setTimeout(async () => {
            setCustomUrlCheckState('checking');
            setCustomUrlCheckError('');

            try {
                const result = await verifyRemoteFile(normalizedCustomUrl, controller.signal);
                if (!isActive) return;

                if (result.ok) {
                    setCustomUrlCheckState('valid');
                    return;
                }

                setCustomUrlCheckState('invalid');
                setCustomUrlCheckError(result.message);
            } catch (error) {
                if (!isActive || error.name === 'AbortError') return;
                setCustomUrlCheckState('invalid');
                setCustomUrlCheckError('The file check was interrupted. Try again.');
            }
        }, 350);

        return () => {
            isActive = false;
            window.clearTimeout(timeoutId);
            controller.abort();
        };
    }, [customMode, customUrlError, normalizedCustomUrl, trimmedCustomUrl]);

    useEffect(() => {
        if (customMode === 'url' && customUrlCheckState !== 'valid') return;
        if (customMode === 'json' && (!customJsonContent || customJsonError)) return;
        if (customName.trim() || isCustomNameManuallyEdited) return;

        if (derivedCustomProgramName) {
            setCustomName(derivedCustomProgramName);
        }
    }, [customMode, customName, customUrlCheckState, customJsonContent, customJsonError, derivedCustomProgramName, isCustomNameManuallyEdited]);

    const handleCustomNameChange = (value) => {
        setCustomName(value);
        setIsCustomNameManuallyEdited(true);
    };

    const handleCustomModeChange = (value) => {
        setCustomMode(value);
    };

    const customProgramHelper = customMode === 'json'
        ? (customJsonName
            ? 'JSON file loaded. We will verify that it exposes a postMessage option before using it in Mods.'
            : 'Upload a Mods JSON program file to store it locally and reuse it later.')
        : (!trimmedCustomUrl
            ? 'Paste the public URL of your hosted JSON program. We will verify that the file is reachable before saving it.'
            : customUrlCheckState === 'checking'
                ? 'Checking whether the hosted JSON file is reachable...'
                : customUrlCheckState === 'valid'
                    ? 'File found. This link will open in Mods using the ?program=<link> format.'
                    : 'This hosted JSON link will open in Mods as ?program=<your-link> once the file check passes.');

    const customProgramValidationError = customMode === 'json'
        ? customJsonError
        : customUrlError || customUrlCheckError;
    const isCustomProgramReady = customMode === 'json'
        ? Boolean(customJsonContent) && !customJsonError
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

        const payload = {
            id: `custom-program-${Date.now()}`,
            type: customMode,
            value: customMode === 'json' ? customJsonContent : normalizedCustomUrl,
            label: customProgramName,
        };

        setCustomPrograms((prev) => [...prev, payload]);
        setModsMachine(payload.id);
        closeCustomProgramModal();
    };

    const handleCustomJsonUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const parsedProgram = JSON.parse(text);

            if (!hasPostMessageOption(parsedProgram)) {
                setCustomJsonName(file.name);
                setCustomJsonContent('');
                setCustomJsonError('This JSON does not expose a `postMessage` option, so the app cannot send PNG data into it.');
                return;
            }

            setCustomMode('json');
            setCustomJsonName(file.name);
            setCustomJsonContent(text);
            setCustomJsonError('');
            setCustomUrl('');
            setCustomUrlCheckState('idle');
            setCustomUrlCheckError('');

            if (!isCustomNameManuallyEdited && !customName.trim()) {
                setCustomName(file.name.replace(/\.[^/.]+$/, '').trim());
            }
        } catch (error) {
            setCustomJsonName(file.name);
            setCustomJsonContent('');
            setCustomJsonError('Upload a valid JSON program file with a `postMessage` option.');
        } finally {
            event.target.value = '';
        }
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

    const resetModsWorkflow = () => {
        setModsStatus('initial');
        setCurrentStep(0);
        setCompletedSteps([]);

        if (processSteps[0]?.file) {
            setSelectedPng(processSteps[0].file);
        }
    };

    const handleInitialOpenMods = async () => {
        if (!selectedPng?.url) return;

        const isFirstLaunch = !modsWindowRef.current?.window || modsWindowRef.current.window.closed;
        await openMods(modsMachine, selectedPng);

        if (!isFirstLaunch || !processSteps.length) return;

        const currentIndex = processSteps.findIndex((step) => step.file?.url === selectedPng.url);
        if (currentIndex < 0) return;

        setCompletedSteps((prev) => (prev.includes(currentIndex) ? prev : [...prev, currentIndex]));

        if (currentIndex < processSteps.length - 1) {
            setCurrentStep(currentIndex + 1);
            setSelectedPng(processSteps[currentIndex + 1].file);
            return;
        }

        setCurrentStep(currentIndex);
    };

    const sendProgramToMods = (modsWindow, machine, origin) => {
        const rawProgram = machine?.value;
        if (!rawProgram) {
            return Promise.reject(new Error('Missing program payload'));
        }

        let programData = rawProgram;
        try {
            programData = JSON.parse(rawProgram);
        } catch (error) {
            programData = rawProgram;
        }

        return new Promise((resolve, reject) => {
            const sendInterval = setInterval(() => {
                if (!modsWindow || modsWindow.closed) {
                    clearInterval(sendInterval);
                    window.removeEventListener('message', handleReady);
                    reject(new Error('Mods window was closed before the program loaded.'));
                    return;
                }

                modsWindow.postMessage({
                    type: 'program',
                    data: programData,
                    name: machine.label,
                }, origin);
            }, 1000);

            const handleReady = (event) => {
                if (event.origin !== origin) return;
                if (event.data !== 'ready') return;

                clearInterval(sendInterval);
                window.removeEventListener('message', handleReady);
                resolve();
            };

            window.addEventListener('message', handleReady);
        });
    };

    const startSendingToMods = (buffer, options = {}) => {
        const ref = modsWindowRef.current;
        if (!ref?.window || ref.window.closed) return;

        const modsWindow = ref.window;
        const {
            origin = ref.origin || DEFAULT_MODS_ORIGIN,
            awaitReady = true,
        } = options;

        if (ref.sendInterval) {
            clearInterval(ref.sendInterval);
        }

        ref.isSending = true;

        if (!awaitReady) {
            let attempts = 0;
            const sendInterval = setInterval(() => {
                if (!modsWindow || modsWindow.closed) {
                    clearInterval(sendInterval);
                    ref.isSending = false;
                    modsWindowRef.current = null;
                    resetModsWorkflow();
                    return;
                }

                modsWindow.postMessage(
                    { type: "png", data: buffer },
                    origin
                );

                attempts += 1;
                if (attempts >= 4) {
                    clearInterval(sendInterval);
                    ref.sendInterval = null;
                    ref.isSending = false;
                    modsWindow.focus();
                    setModsStatus("connected");

                    if (ref.pendingFile) {
                        const next = ref.pendingFile;
                        ref.pendingFile = null;
                        updateMods(next);
                    }
                }
            }, 500);

            ref.sendInterval = sendInterval;
            return;
        }

        const sendInterval = setInterval(() => {
            if (!modsWindow || modsWindow.closed) {
                clearInterval(sendInterval);
                ref.isSending = false;
                modsWindowRef.current = null;
                resetModsWorkflow();
                return;
            }

            modsWindow.postMessage(
                { type: "png", data: buffer },
                origin
            );

        }, 1000);

        ref.sendInterval = sendInterval;

        const handler = (event) => {
            if (event.origin !== origin) return;

            if (event.data === "ready") {
                clearInterval(sendInterval);
                ref.sendInterval = null;
                ref.isSending = false;
                modsWindow.focus();
                setModsStatus("connected");
                window.removeEventListener("message", handler);

                // 🔥 Process queued update
                if (ref.pendingFile) {
                    const next = ref.pendingFile;
                    ref.pendingFile = null;
                    updateMods(next); // recursive trigger
                }
            }
        };

        window.addEventListener("message", handler);
    };


    const openMods = async (modsMachine, file) => {
        if (!file?.url) return;

        let modsWindow = modsWindowRef.current?.window;
        const machine = machineOptions.find(opt => opt.id === modsMachine);
        if (!machine) return;

        const runtime = getMachineRuntimeConfig(machine);
        if (!runtime.url) return;

        const currentOrigin = modsWindowRef.current?.origin;
        if (modsWindow && !modsWindow.closed && currentOrigin && currentOrigin !== runtime.origin) {
            modsWindow.close();
            modsWindow = null;
            modsWindowRef.current = null;
        }

        if (!modsWindow || modsWindow.closed) {
            modsWindow = window.open(runtime.url, "_blank");
            setModsStatus("opening");

            if (!modsWindow) {
                setModsStatus("error");
                return;
            }
        }

        modsWindowRef.current = {
            window: modsWindow,
            machine,
            image: file.url,
            origin: runtime.origin,
            awaitReady: !runtime.requiresProgramBootstrap,
            sendInterval: null,
            isSending: false,
            pendingFile: null,
            debounceTimer: null,
        };

        if (runtime.requiresProgramBootstrap) {
            try {
                await sendProgramToMods(modsWindow, machine, runtime.origin);
            } catch (error) {
                console.error(error);
                setModsStatus("error");
                modsWindowRef.current = null;
                return;
            }
        }

        const buffer = await fetch(file.url).then(res => res.arrayBuffer());
        setModsStatus('sending');

        const polling = setInterval(() => {
            if (modsWindow && modsWindow.closed) {
                modsWindowRef.current = null;
                resetModsWorkflow();
                clearInterval(polling);
            }
        }, 1000);

        startSendingToMods(buffer, {
            origin: runtime.origin,
            awaitReady: !runtime.requiresProgramBootstrap,
        });
    };

    const updateMods = (file) => {
        if (!file?.url) return;

        const ref = modsWindowRef.current;

        if (!ref || !ref.window || ref.window.closed) {
            console.warn("Mods not open");
            return;
        }

        // 🔴 Debounce (collapse rapid updates)
        if (ref.debounceTimer) {
            clearTimeout(ref.debounceTimer);
        }

        setModsStatus("sending");
        ref.debounceTimer = setTimeout(async () => {
            try {

                const buffer = await fetch(file.url).then(res => res.arrayBuffer());
                ref.image = file.url;

                if (ref.isSending) {
                    ref.pendingFile = file;
                    return;
                }
                startSendingToMods(buffer, {
                    origin: ref.origin || DEFAULT_MODS_ORIGIN,
                    awaitReady: ref.awaitReady !== false,
                });

            } catch (err) {
                console.error(err);
                setModsStatus("error");
            }
        }, 200); // 🔧 tweak: 200–500ms depending on UX
    };
    
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
                                                onClick={handleInitialOpenMods}
                                            >
                                                <p className="font-medium text-xs ps-0.5 text-white tracking-wider ">Open Mods</p>
                                                <ArrowRightEndOnRectangleIcon width={18} height={18} strokeWidth={2} stroke="white" />
                                            </motion.button>
                                        </div>
                                    )}

                                    <ProcessSteps 
                                        isConnected={isModsConnected}
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
                            setCustomMode={handleCustomModeChange}
                            customName={customName}
                            setCustomName={handleCustomNameChange}
                            customUrl={customUrl}
                            setCustomUrl={setCustomUrl}
                            customJsonName={customJsonName}
                            customJsonError={customJsonError}
                            customPrograms={customPrograms}
                            customProgramHelper={customProgramHelper}
                            customUrlError={customProgramValidationError}
                            customProgramName={customProgramName}
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
