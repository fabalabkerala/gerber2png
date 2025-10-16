import React, {createContext, useContext, useState} from "react";

const GerberContext = createContext();

export const GerberProvider = ({children}) => {
    const defaultMainSvg = {id: null, svg: null};
    const defaultTopStack = {id: null, svg: null};
    const defaultBottomStack = {id: null, svg: null};
    const defaultFullLayers = null;
    const defaultLayerType = null;
    const defaultCanvasBg = 'black';
    const defaultPngUrls = [];
    const defaultChangeSelect = 'custom-setup';
    const defaultStackConfig = { vewbox: { viewboxX: 0, viewboxY: 0, viewboxW: 0, viewboxH: 0}, width: 0, height: 0 };
    const defaultIsToggled = {
        toplayer: { trace: false, pads: false, silkscreen: false, soldermask: false },
        bottomlayer: { trace: false, pads: false, silkscreen: false, soldermask: false },
        commonlayer: { outline: false, drill: false, outlayer: true}
    };

    const [mainSvg, setMainSvg] = useState(defaultMainSvg);
    const [topstack, setTopStack] = useState(defaultTopStack);
    const [bottomstack, setBottomStack] = useState(defaultBottomStack);
    const [fullLayers, setFullLayers] = useState(defaultFullLayers);
    const [layerType, setLayerType] = useState(defaultLayerType);
    const [canvasBg, setCanvasBg] = useState(defaultCanvasBg);
    const [pngUrls, setPngUrls] = useState(defaultPngUrls);
    const [changeSelect, setChangeSelect] = useState(defaultChangeSelect)
    const [stackConfig, setStackConfig] = useState(defaultStackConfig);
    const [isToggled, setIsToggled] = useState(defaultIsToggled);

    const handleReset = () => {
        setMainSvg(defaultMainSvg);
        setTopStack(defaultTopStack);
        setBottomStack(defaultBottomStack);
        setFullLayers(defaultFullLayers);
        setLayerType(defaultLayerType);
        setCanvasBg(defaultCanvasBg);
        setPngUrls(defaultPngUrls);
        setChangeSelect(defaultChangeSelect)
        setStackConfig(defaultStackConfig);
        setIsToggled(defaultIsToggled);
    }
    
    const handleToggleCick = (layertype, layerproperty) => {
        setIsToggled((prevState) => ({
            ...prevState,
            [layertype]: {
                ...prevState[layertype],
                [layerproperty]: !prevState[layertype][layerproperty],
            }
        }));
    }

    return (
        <GerberContext.Provider
            value={{
                mainSvg,
                setMainSvg,
                topstack,
                setTopStack,
                bottomstack,
                setBottomStack,
                fullLayers,
                setFullLayers,
                isToggled,
                setIsToggled,
                layerType,
                setLayerType,
                handleToggleCick,
                stackConfig,
                setStackConfig,
                canvasBg,
                setCanvasBg,
                pngUrls,
                setPngUrls,
                changeSelect,
                setChangeSelect,
                handleReset
            }}
        >
            {children}
        </GerberContext.Provider>
    )
};

export const useGerberConfig = () => useContext(GerberContext)