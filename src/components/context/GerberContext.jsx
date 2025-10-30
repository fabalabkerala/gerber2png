/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from "react";
import { updateSvg } from "../../utils/svgConverter/svgUtils";
import setUpConfig from "../../utils/svgConverter/quickSetup";
import handleColorChange from "../../utils/svgConverter/svgColorChange";
import generatePNG from "../../utils/svgConverter/svg2png";

const GerberLayersContext = createContext();
const GerberSettingsContext = createContext();
const GerberViewContext = createContext();

export const GerberProvider = ({ children }) => {
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
    const [changeSelect, setChangeSelect] = useState('custom');
    const [stackConfig, setStackConfig] = useState({ viewbox: { viewboxX: 0, viewboxY: 0, viewboxW: 0, viewboxH: 0}, width: 0, height: 0 });
    const [isToggled, setIsToggled] = useState({
        toplayer: { trace: false, pads: false, silkscreen: false, soldermask: false },
        bottomlayer: { trace: false, pads: false, silkscreen: false, soldermask: false },
        commonlayer: { outline: false, drill: false, outlayer: true}
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
    

    const settingValues = {
        doubleSide, setDoubleSide,
        layerType, setLayerType,
        canvasBg, setCanvasBg,
        changeSelect, setChangeSelect,
        stackConfig, setStackConfig,
        isToggled, setIsToggled,
        handleToggleCick,
        applyQuickSetup
    }

    // ------------------------
    // View / UI
    // ------------------------
    const [mainSvg, setMainSvg] = useState({id: null, svg: null});
    const [pngUrls, setPngUrls] = useState([
        // { name: 'topdfjsdfasdasdfasd_url2.png', url: 'https://shorthand.com/the-craft/raster-images/assets/5kVrMqC0wp/sh-unsplash_5qt09yibrok-4096x2731.jpeg', width: 20, height: 20 },
        // { name: 'top_url.png', url: 'https://shorthand.com/the-craft/raster-images/assets/5kVrMqC0wp/sh-unsplash_5qt09yibrok-4096x2731.jpeg', width: 100, height: 60 },
    ]);
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

                    const svg = setup.stack.svg.cloneNode(true);
                    const machine = isCarvera ? 'carvera' : 'general';

                    updateSvg(svg, option, setup, machine, topstack, isDoubleside);
                    handleColorChange({ color: setup.color, id: topstack.id, svgs:[svg] });

                    const newUrl = await generatePNG(svg, isDoubleside, setup.id, setup.canvas, setup.color);
                    newUrls.push({ name: newUrl.name, url: newUrl.url, width: newUrl.width, height: newUrl.height });
                }
                setPngUrls(prev => [ ...prev, ...newUrls ]);
                return;
            }
            const targetSvg = mainSvg.svg === fullLayers ? topstack.svg.cloneNode(true) : mainSvg.svg.cloneNode(true); 
            const blob = await generatePNG(targetSvg, isDoubleside, mainSvg.id, canvasBg, layerType);
            setPngUrls(prev => [ ...prev, { name: blob.name, url: blob.url, width: blob.width, height: blob.height }])
        } catch (error) {
            console.error('Failed PNG Conversion ++++++', error)
        } finally {
            setLoader(false);
        }

    }, [bottomstack, canvasBg, fullLayers, layerType, mainSvg, topstack])

    const viewValues = useMemo(() => ({
        mainSvg, setMainSvg,
        pngUrls, setPngUrls,
        side, setSide,
        loader, setLoader,
        toggleDoubleSide,
        handlePngConversion
    }), [handlePngConversion, loader, mainSvg, pngUrls, side, toggleDoubleSide])

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