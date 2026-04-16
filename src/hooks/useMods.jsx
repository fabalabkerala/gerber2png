import { useMemo, useRef, useState } from "react";
import { useApp } from "../components/context/AppContext";
import { useGerberSettings } from "../components/context/GerberContext";

const DEFAULT_MODS_URL = 'https://modsproject.org/';
const DEFAULT_MODS_ORIGIN = 'https://modsproject.org';

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



const useMods = ({ selectedPng, setSelectedPng, machineOptions }) => {
    const modsWindowRef = useRef(null);
    const [ modsStatus, setModsStatus ] = useState('initial');
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState([]);

    const { pngFiles } = useApp();
    const { modsMachine } = useGerberSettings();
    const processSteps = useMemo(() => buildProcessSteps(pngFiles), [pngFiles]);

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

    const isConnected = Boolean(modsWindowRef.current?.window);

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

    const openMods = async (file) => {
        if (!file?.url) return;

        const isFirstLaunch = !modsWindowRef.current?.window || modsWindowRef.current.window.closed;
        const machine = machineOptions.find(opt => opt.id === modsMachine);
        if (!machine) return;

        let modsWindow = modsWindowRef.current?.window;

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
        }, 200);
    };

    const resetModsWorkflow = () => {
        setModsStatus('initial');
        setCurrentStep(0);
        setCompletedSteps([]);

        if (processSteps[0]?.file) {
            setSelectedPng(processSteps[0].file);
        }
    };

    return {
        modsImage: modsWindowRef.current?.image || null,
        modsStatus: currentModsStatus,
        isConnected,
        openMods,
        updateMods,
        currentStep, setCurrentStep,
        completedSteps, setCompletedSteps,
    };
}

export default useMods;