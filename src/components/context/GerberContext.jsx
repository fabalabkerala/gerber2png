/* eslint-disable react-refresh/only-export-components */
import PropTypes from "prop-types";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useApp } from "./AppContext";
import handleColorChange from "../../utils/svgConverter/svgColorChange";
import setUpConfig from "../../utils/svgConverter/quickSetup";
import generatePNG from "../../utils/svgConverter/svg2png";
import { updateSvg } from "../../utils/svgConverter/svgUtils";

const GerberLayersContext = createContext();
const GerberSettingsContext = createContext();
const GerberViewContext = createContext();

const DEFAULT_STACK_CONFIG = {
    viewbox: { viewboxX: 0, viewboxY: 0, viewboxW: 0, viewboxH: 0 },
    width: 0,
    height: 0,
};

const DEFAULT_TOGGLED_STATE = {
    toplayer: { trace: false, pads: false, silkscreen: false, soldermask: false },
    bottomlayer: { trace: false, pads: false, silkscreen: false, soldermask: false },
    commonlayer: { outline: false, drill: false, outlayer: true },
};

export const GerberProvider = ({ children }) => {
    const { setPngFiles } = useApp();

    const [topstack, setTopStack] = useState({ id: null, svg: null });
    const [bottomstack, setBottomStack] = useState({ id: null, svg: null });
    const [fullLayers, setFullLayers] = useState(null);

    const [boardSide, setBoardSide] = useState("top");
    const [layerType, setLayerType] = useState(null);
    const [canvasBg, setCanvasBg] = useState("black");
    const [changeSelect, setChangeSelect] = useState("generate-all");
    const [stackConfig, setStackConfig] = useState(DEFAULT_STACK_CONFIG);
    const [isToggled, setIsToggled] = useState(DEFAULT_TOGGLED_STATE);

    const [mainSvg, setMainSvg] = useState({ id: null, svg: null });
    const [loader, setLoader] = useState(false);

    const doubleSide = boardSide === "double";

    const side = useMemo(() => {
        if (!mainSvg.svg) return null;
        if (mainSvg.svg === fullLayers) return "all";
        if (mainSvg.svg === topstack.svg) return "top";
        if (mainSvg.svg === bottomstack.svg) return "bottom";
        return null;
    }, [bottomstack.svg, fullLayers, mainSvg.svg, topstack.svg]);

    const handleToggleCick = useCallback((layerTypeKey, layerProperty) => {
        setIsToggled((prevState) => ({
            ...prevState,
            [layerTypeKey]: {
                ...prevState[layerTypeKey],
                [layerProperty]: !prevState[layerTypeKey][layerProperty],
            },
        }));
    }, []);

    const applyQuickSetup = useCallback((option) => {
        const setupConfig = setUpConfig(topstack, bottomstack);
        const setup = setupConfig[option];

        if (!setup) return;

        setIsToggled((prevState) => {
            let nextState = {
                ...prevState,
                [setup.side]: {
                    ...prevState[setup.side],
                    [setup.button]: false,
                },
            };

            if (doubleSide) {
                nextState = {
                    ...nextState,
                    commonlayer: {
                        ...nextState.commonlayer,
                        outlayer: option !== "top-outline",
                    },
                };
            }

            setup.toggleButtons.forEach((button) => {
                nextState = {
                    ...nextState,
                    [button.side]: {
                        ...nextState[button.side],
                        [button.button]: true,
                    },
                };
            });

            return nextState;
        });

        setCanvasBg(setup.canvas);
        setMainSvg({ id: setup.id, svg: setup.stack.svg });
        setLayerType(setup.color);

        window.setTimeout(() => {
            updateSvg(setup.stack.svg, option, setup, "general", topstack, doubleSide);
            handleColorChange({
                color: setup.color,
                id: topstack.id,
                svgs: [topstack.svg, bottomstack.svg],
            });
        }, 300);
    }, [bottomstack, doubleSide, topstack]);

    const setBoardMode = useCallback((mode) => {
        setBoardSide(mode);
        setIsToggled((prev) => ({
            ...prev,
            commonlayer: {
                ...prev.commonlayer,
                outlayer: mode !== "double",
            },
        }));

        if (!topstack.svg || !bottomstack.svg || !fullLayers) {
            return;
        }

        const showOuter = mode === "double" ? "block" : "none";

        topstack.svg.querySelector("#toplayerouter").style.display = showOuter;
        bottomstack.svg.querySelector("#bottomlayerouter").style.display = showOuter;
        fullLayers.querySelector("#fullstackouter").style.display = showOuter;

        if (mode === "bottom") {
            setMainSvg({ id: "bottom", svg: bottomstack.svg });
            return;
        }

        setMainSvg({ id: "top", svg: topstack.svg });
    }, [bottomstack.svg, fullLayers, topstack.svg]);

    const handlePngConversion = useCallback(async (method, mode) => {
        setLoader(true);

        try {
            const isDoubleside = mode === "double";
            const isCarvera = method === "generate-for-carvera";
            const generateAll = method === "generate-all" || isCarvera;
            const nextPngFiles = [];

            if (generateAll) {
                const setups = setUpConfig(topstack, bottomstack);

                for (const option in setups) {
                    const setup = setups[option];

                    if (mode === "top" && option.startsWith("bottom")) continue;
                    if (mode === "bottom" && option.startsWith("top")) continue;
                    if (isCarvera && option.includes("drill")) continue;
                    if ((isCarvera || generateAll) && isDoubleside && option === "bottom-drill") continue;

                    const svg = setup.stack.svg.cloneNode(true);
                    const machine = isCarvera ? "carvera" : "general";

                    updateSvg(svg, option, setup, machine, topstack, isDoubleside);
                    handleColorChange({ color: setup.color, id: topstack.id, svgs: [svg] });

                    const newUrl = await generatePNG(svg, isDoubleside, setup.id, setup.canvas, setup.color);
                    const directory = option.includes("top") ? "toplayer" : option.includes("bottom") ? "bottomlayer" : "others";

                    nextPngFiles.push({
                        name: newUrl.name,
                        url: newUrl.url,
                        width: newUrl.width,
                        height: newUrl.height,
                        directory,
                        job: setup.button,
                    });
                }

                setPngFiles((prev) => [...prev, ...nextPngFiles]);
                return;
            }

            const targetSvg = mainSvg.svg === fullLayers ? topstack.svg.cloneNode(true) : mainSvg.svg.cloneNode(true);

            const blob = await generatePNG(targetSvg, isDoubleside, mainSvg.id, canvasBg, layerType);
            const directory = method.includes("top") ? "toplayer" : method.includes("bottom") ? "bottomlayer" : "others";
            
            const jobs = ["trace", "drill", "outline"];
            const job = jobs.find((item) => method.includes(item)) || "custom";

            setPngFiles((prev) => [
                ...prev,
                {
                    name: blob.name,
                    url: blob.url,
                    width: blob.width,
                    height: blob.height,
                    directory,
                    job,
                },
            ]);
        } catch (error) {
            console.error("Failed PNG conversion", error);
        } finally {
            setLoader(false);
        }
    }, [bottomstack, canvasBg, fullLayers, layerType, mainSvg.id, mainSvg.svg, setPngFiles, topstack]);

    const handleReset = useCallback(() => {
        setMainSvg({ id: null, svg: null });
        setTopStack({ id: null, svg: null });
        setBottomStack({ id: null, svg: null });
        setFullLayers(null);
        setLoader(false);

        setBoardSide("top");
        setLayerType(null);
        setCanvasBg("black");
        setChangeSelect("generate-all");
        setStackConfig(DEFAULT_STACK_CONFIG);
        setIsToggled(DEFAULT_TOGGLED_STATE);
        setPngFiles([]);
    }, [setPngFiles]);

    const layerValues = useMemo(() => ({
        topstack,
        setTopStack,
        bottomstack,
        setBottomStack,
        fullLayers,
        setFullLayers,
    }), [bottomstack, fullLayers, topstack]);

    const settingValues = useMemo(() => ({
        boardSide,
        doubleSide,
        layerType,
        setLayerType,
        canvasBg,
        setCanvasBg,
        changeSelect,
        setChangeSelect,
        stackConfig,
        setStackConfig,
        isToggled,
        handleToggleCick,
        applyQuickSetup,
    }), [
        applyQuickSetup,
        boardSide,
        canvasBg,
        changeSelect,
        doubleSide,
        handleToggleCick,
        isToggled,
        layerType,
        stackConfig,
    ]);

    const viewValues = useMemo(() => ({
        mainSvg,
        setMainSvg,
        side,
        loader,
        setBoardMode,
        handlePngConversion,
        handleReset,
    }), [handlePngConversion, handleReset, loader, mainSvg, setBoardMode, side]);

    return (
        <GerberLayersContext.Provider value={layerValues}>
            <GerberSettingsContext.Provider value={settingValues}>
                <GerberViewContext.Provider value={viewValues}>
                    {children}
                </GerberViewContext.Provider>
            </GerberSettingsContext.Provider>
        </GerberLayersContext.Provider>
    );
};

GerberProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useGerberLayer = () => useContext(GerberLayersContext);
export const useGerberSettings = () => useContext(GerberSettingsContext);
export const useGerberView = () => useContext(GerberViewContext);
