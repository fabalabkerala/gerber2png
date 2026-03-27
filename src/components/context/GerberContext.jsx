/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import { updateSvg } from "../../utils/svgConverter/svgUtils";
import setUpConfig from "../../utils/svgConverter/quickSetup";
import handleColorChange from "../../utils/svgConverter/svgColorChange";
import generatePNG from "../../utils/svgConverter/svg2png";
import { useApp } from "./AppContext";
import { MACHINE_PRESETS } from "../../config/defaults";

const GerberLayersContext = createContext();
const GerberSettingsContext = createContext();
const GerberViewContext = createContext();

export const GerberProvider = ({ children }) => {
    const { setPngFiles } = useApp();
    // ------------------------
    // Layers
    // ------------------------
    const [topstack, setTopStack] = useState({id: null, svg: null});
    const [bottomstack, setBottomStack] = useState({id: null, svg: null});
    const [fullLayers, setFullLayers] = useState(null);

    const layerValues = useMemo(() => ({
        topstack, setTopStack, 
        bottomstack, setBottomStack, 
        fullLayers, setFullLayers
    }), [topstack, bottomstack, fullLayers]);

    // ------------------------
    // Settings / Flags
    // ------------------------
    const [doubleSide, setDoubleSide] = useState(false);
    const [layerType, setLayerType] = useState(null);
    const [canvasBg, setCanvasBg] = useState('black');
    const [changeSelect, setChangeSelect] = useState('generate-all');
    const [stackConfig, setStackConfig] = useState({ viewbox: { viewboxX: 0, viewboxY: 0, viewboxW: 0, viewboxH: 0}, width: 0, height: 0 });
    const [isToggled, setIsToggled] = useState({
        toplayer: { trace: false, pads: false, silkscreen: false, soldermask: false },
        bottomlayer: { trace: false, pads: false, silkscreen: false, soldermask: false },
        commonlayer: { outline: false, drill: false, outlayer: true}
    });

    const DEFAULT_MACHINE = Object.keys(MACHINE_PRESETS)[0];
    const [modsMachine, setModsMachine] = useState(DEFAULT_MACHINE);
    const [toolConfig, setToolConfig] = useState(() => {
        const initial = {};
        Object.keys(MACHINE_PRESETS).forEach(machine => {
            initial[machine] = structuredClone(MACHINE_PRESETS[machine]);
        });
        return initial;
    });

    const handleToggleCick = useCallback((layertype, layerproperty) => {
        setIsToggled((prevState) => ({
            ...prevState,
            [layertype]: {
                ...prevState[layertype],
                [layerproperty]: !prevState[layertype][layerproperty],
            }
        }));
    }, [])

    const updateToolConfig = useCallback((step, key, value) => {
        setToolConfig(prev => ({
            ...prev,
            [modsMachine]: {
                ...prev[modsMachine],
                [step]: {
                    ...prev[modsMachine][step],
                    [key]: value
                }
            }
        }));
    }, [modsMachine]);

    const resetToolConfig = useCallback(() => {
        setToolConfig(prev => ({
            ...prev,
            [modsMachine]: structuredClone(MACHINE_PRESETS[modsMachine])
        }));
    }, [modsMachine]);

    const saveSettings = useCallback(() => {
        localStorage.setItem("gerberSettings", JSON.stringify({
            toolConfig,
            modsMachine
        }));
    }, [toolConfig, modsMachine]);

    const applyQuickSetup = useCallback((option) => {

        const setupConfig = setUpConfig(topstack, bottomstack)
        const setup = setupConfig[option];
        const toggleButtons = setupConfig[option].toggleButtons;

        setIsToggled(prevObject => {
            let updatedState = { ...prevObject };

            // Update the state of the selected button
            updatedState = {
                ...updatedState,
                [setup.side]: {
                    ...updatedState[setup.side],
                    [setup.button]: false,
                }
            }

            if (doubleSide) {
                updatedState = {
                    ...updatedState,
                    commonlayer: {
                        ...updatedState.commonlayer,
                        outlayer: option === 'top-cut' ? false : true
                    }
                }
            }

            // Update the state of the buttons to be toggled
            toggleButtons.forEach(button => {
                updatedState = {
                    ...updatedState,
                    [button.side]: {
                        ...updatedState[button.side],
                        [button.button]: true,
                    }
                }
            })

            return updatedState;
        });
        
        setCanvasBg(setup.canvas);
        setMainSvg({ id: setup.id, svg: setup.stack.svg });
        setLayerType(setup.color);


        setTimeout(() => {
            updateSvg(setup.stack.svg, option, setup, 'general', topstack, doubleSide);
            handleColorChange({ color: setup.color, id: topstack.id, svgs: [topstack.svg, bottomstack.svg] }); 
        }, 300);  
    }, [bottomstack, doubleSide, topstack])

    useEffect(() => {
        const saved = localStorage.getItem("gerberSettings");

        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                if (parsed.toolConfig) setToolConfig(parsed.toolConfig);
                if (parsed.selectedMachine) setSelectedMachine(parsed.selectedMachine);

            } catch (e) {
                console.warn("Invalid gerber settings");
            }
        }
    }, []);
    

    const settingValues = {
        doubleSide, setDoubleSide,
        layerType, setLayerType,
        canvasBg, setCanvasBg,
        changeSelect, setChangeSelect,
        stackConfig, setStackConfig,
        isToggled, setIsToggled,
        handleToggleCick,
        applyQuickSetup,
        modsMachine, setModsMachine,
        toolConfig, setToolConfig,
        updateToolConfig,
        resetToolConfig,
        saveSettings
    }

    // ------------------------
    // View / UI
    // ------------------------
    const [mainSvg, setMainSvg] = useState({id: null, svg: null});
    const [side, setSide] = useState(null);
    const [loader, setLoader] = useState(false);

    const toggleDoubleSide = useCallback((enabled, isToggled) => {
        setDoubleSide(enabled);

        if (!enabled && !isToggled['commonlayer']['outlayer'] || enabled && isToggled['commonlayer']['outlayer']) {
            handleToggleCick('commonlayer', 'outlayer');
        }

        topstack.svg.querySelector('#toplayerouter').style.display = enabled ? 'block' : 'none';
        bottomstack.svg.querySelector('#bottomlayerouter').style.display = enabled ? 'block' : 'none';
        fullLayers.querySelector('#fullstackouter').style.display = enabled ? 'block' : 'none';
    }, [bottomstack.svg, fullLayers, handleToggleCick, topstack.svg])

    
    const handlePngConversion = useCallback(async (method, isDoubleside) => {
        setLoader(true);

        try {
            const isCarvera = method === 'generate-for-carvera';
            const generateAll = method === 'generate-all' || isCarvera;
            const newUrls = [];

            if (generateAll) {
                const setups = setUpConfig(topstack, bottomstack);

                for (const option in setups) {
                    const setup = setups[option];
                    if (!isDoubleside && setup.stack !== topstack) continue;
                    if (isCarvera && option === "top-drill") continue;
                    if ((isCarvera || generateAll) && option === 'bottom-drill') continue;

                    const svg = setup.stack.svg.cloneNode(true);
                    const machine = isCarvera ? 'carvera' : 'general';

                    updateSvg(svg, option, setup, machine, topstack, isDoubleside);
                    handleColorChange({ color: setup.color, id: topstack.id, svgs:[svg] });

                    const newUrl = await generatePNG(svg, isDoubleside, setup.id, setup.canvas, setup.color);
                    const directory = option.includes('top') ? 'toplayer' : option.includes('bottom') ? 'bottomlayer' : 'others';
                    newUrls.push({ 
                        name: newUrl.name, 
                        url: newUrl.url, 
                        width: newUrl.width, 
                        height: newUrl.height,
                        directory: directory,
                        job: setup.button
                    });
                }
                // setPngUrls(prev => [ ...prev, ...newUrls ]);
                setPngFiles(prev => [ ...prev, ...newUrls ]);
                return;
            }
            const targetSvg = mainSvg.svg === fullLayers ? topstack.svg.cloneNode(true) : mainSvg.svg.cloneNode(true); 
            const blob = await generatePNG(targetSvg, isDoubleside, mainSvg.id, canvasBg, layerType);

            const directory = method.includes('top') ? 'toplayer' : method.includes('bottom') ? 'bottomlayer' : 'others';
            const jobs = ['trace', 'drill', 'outline'];
            const job = jobs.find(job => method.includes(job)) || 'custom';

            // setPngUrls(prev => [ ...prev, { name: blob.name, url: blob.url, width: blob.width, height: blob.height }])
            setPngFiles(prev => [ 
                ...prev, 
                { 
                    name: blob.name, 
                    url: blob.url, 
                    width: blob.width, 
                    height: blob.height,
                    directory: directory,
                    job: job
                }
            ])
        } catch (error) {
            console.error('Failed PNG Conversion ++++++', error)
        } finally {
            setLoader(false);
        }

    }, [bottomstack, canvasBg, fullLayers, layerType, mainSvg.id, mainSvg.svg, setPngFiles, topstack])



    const viewValues = useMemo(() => ({
        mainSvg, setMainSvg,
        side, setSide,
        loader, setLoader,
        toggleDoubleSide,
        handlePngConversion
    }), [handlePngConversion, loader, mainSvg, side, toggleDoubleSide])

    // const handleReset = () => {
    //     setMainSvg({id: null, svg: null});
    //     setTopStack({id: null, svg: null});
    //     setBottomStack({id: null, svg: null});
    //     setFullLayers(null);
    //     setLayerType(null);
    //     setCanvasBg('black');
    //     setPngUrls([]);
    //     setChangeSelect('custom')
    //     setStackConfig({ vewbox: { viewboxX: 0, viewboxY: 0, viewboxW: 0, viewboxH: 0}, width: 0, height: 0 });
    //     setIsToggled({
    //         toplayer: { trace: false, pads: false, silkscreen: false, soldermask: false },
    //         bottomlayer: { trace: false, pads: false, silkscreen: false, soldermask: false },
    //         commonlayer: { outline: false, drill: false, outlayer: true}
    //     });
    // }

    // ------------------------
    // Sync side with current mainSvg
    // ------------------------
    useEffect(() => {
        if (mainSvg.svg === null) return;

        if (mainSvg.svg === fullLayers) setSide('all')
        else if (mainSvg.svg === topstack.svg) setSide('top')
        else if (mainSvg.svg === bottomstack.svg) setSide('bottom')
    }, [bottomstack.svg, fullLayers, mainSvg.svg, topstack.svg])

    return (
        <GerberLayersContext.Provider value={layerValues}>
            <GerberSettingsContext.Provider value={settingValues}>
                <GerberViewContext.Provider value={viewValues}>
                    { children }
                </GerberViewContext.Provider>
            </GerberSettingsContext.Provider>
        </GerberLayersContext.Provider>
    )
};

GerberProvider.propTypes = {
    children: PropTypes.node.isRequired
}

export const useGerberLayer = () => useContext(GerberLayersContext);
export const useGerberSettings = () => useContext(GerberSettingsContext);
export const useGerberView = () => useContext(GerberViewContext);