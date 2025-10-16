/* eslint-disable react/prop-types */
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState, useRef } from 'react';
import './configSection.css'
import { useGerberConfig } from './gerberContext';
import { generateOuterSvg } from './convert';
import svg2png from './svg2png'
import { handleColorChange } from './gerber';
import { changeDpiBlob } from 'changedpi';

export default function ConfigSection(props) {
    const { mainSvg } = useGerberConfig(); 
    const [isChecked, setIsChecked] = useState(false);

    useEffect(() => {
        if (mainSvg.svg) {
            props.setActive(true);
        }
    }, [mainSvg])

    return (
        <>
        <div className="lg:w-1/5 lg:absolute left-0 " style={{ 'pointerEvents' : props.active ? 'auto' : 'none' }}>
            <div className="p-5 ps-0" >
                <div className='bg-slate-50 px-2 py-4 rounded-md'>
                    <QuickSetup isChecked={isChecked} pngRef={props.pngRef} />
                    <DoubleSideButton isChecked={isChecked} setIsChecked={setIsChecked}/>
                </div>
                <LayersToggleButtons isChecked={isChecked} />
                <CanvasBackground />
            </div>
        </div>
        </>
    )
}


const setUpConfig = (topstack, bottomstack) => {
    return {
        'top-trace': {
            side: 'toplayer',
            button: 'trace',
            toggleButtons: [
                { side: 'toplayer', button: 'pads' },
                { side: 'toplayer', button: 'silkscreen' },
                { side: 'commonlayer', button: 'outline' },
                { side: 'commonlayer', button: 'drill' },
                { side: 'commonlayer', button: 'outlayer' },
            ],
            stack: topstack, 
            // id: 'top_layer_traces',
            id: 'traces_top_layer',
            color: 'bw',
            layerid: 'top_copper',
            canvas: 'black',
        },
        'top-drill': {
            side: 'commonlayer',
            button: 'drill',
            toggleButtons: [
                { side: 'toplayer', button: 'trace' },
                { side: 'toplayer', button: 'pads' },
                { side: 'toplayer', button: 'silkscreen' },
                { side: 'commonlayer', button: 'outline' },
                { side: 'commonlayer', button: 'outlayer' },
            ],
            stack:topstack,
            id: 'drills_top_layer',
            color: 'bwInvert',
            layerid: 'drill', 
            canvas: 'white',
        },
        'top-cut': {
            side: 'commonlayer',
            button: 'outline',
            toggleButtons: [
                { side: 'toplayer', button: 'trace' },
                { side: 'toplayer', button: 'pads' },
                { side: 'toplayer', button: 'silkscreen' },
                { side: 'commonlayer', button: 'drill' },
            ],
            stack: topstack,
            id: 'outline_top_layer',
            color: 'bwInvert',
            layerid: 'outline',
            canvas: 'black',
        },
        'bottom-trace': {
            side: 'bottomlayer',
            button: 'trace',
            toggleButtons: [
                { side: 'bottomlayer', button: 'pads' },
                { side: 'bottomlayer', button: 'silkscreen' },
                { side: 'commonlayer', button: 'outline' },
                { side: 'commonlayer', button: 'drill' },
                { side: 'commonlayer', button: 'outlayer' },
            ],
            stack: bottomstack,
            id: 'traces_bottom_layer',
            color: 'bw',
            layerid: 'bottom_copper',
            canvas: 'black',
        },
        'bottom-cut': {
            side: 'commonlayer',
            button: 'outline',
            toggleButtons: [
                { side: 'bottomlayer', button: 'pads' },
                { side: 'bottomlayer', button: 'silkscreen' },
                { side: 'commonlayer', button: 'drill' },
                { side: 'commonlayer', button: 'outlayer' },
            ],
            stack: bottomstack,
            id: 'outline_bottom_layer',
            color: 'bwInvert',
            layerid: 'outline',
            canvas: 'black',
        }
    }
}

function QuickSetup(props) {
    const quickSetupRef = useRef(null)
    const { 
        mainSvg, 
        setMainSvg, 
        canvasBg, 
        setCanvasBg, 
        pngUrls, 
        setPngUrls, 
        fullLayers, 
        topstack, 
        bottomstack, 
        setIsToggled, 
        layerType, 
        setLayerType ,
        changeSelect,
        setChangeSelect
    } = useGerberConfig();
    
    const handleSvg = (svg, option, setup) => {
        const [outerSvg, gerberSvg] = svg.querySelectorAll('svg');

        gerberSvg.querySelectorAll('g').forEach(g => {
            
            if (g.hasAttribute('id')) {
                // console.log('g', g)
                const id = g.getAttribute('id');
                g.style.display = id.includes(setup.layerid) ? 'block' : id.includes(setup.stack.id) ? 'none' : id.includes('drillMask') ? 'none' : '   ';
            }
        })

        const clipPath = gerberSvg.querySelector('clipPath');
        if (clipPath) clipPath.style.display = setup.layerid === 'outline' ? 'block' : 'none';

        const outerG = svg.querySelector(`#${ setup.stack === topstack ? 'toplayer': 'bottomlayer' }outer`);
        outerG.style.display = option === 'top-cut' ? props.isChecked ? 'block' : 'none' : 'none';
        console.log('option', option, 'setup', setup)
    }

    const handleQuickSetup = (option) => {
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
        })
        
        setCanvasBg(setup.canvas);
        setMainSvg({id: setup.id, svg: setup.stack.svg })
        setLayerType(setup.color);

        setTimeout(() => {
            handleSvg(setup.stack.svg, option, setup);
            handleColorChange({ color: setup.color, id: topstack.id, svgs: [topstack.svg, bottomstack.svg] }); 
        }, 300);  
    }

    const generatePNG = async (targetSvg, twoSide, name, canvasBg) => {
        return new Promise((resolve, reject) => {
            const [outerSvg, gerberSvg] = targetSvg.querySelectorAll('svg');
            const svg = twoSide ? targetSvg : gerberSvg;

            const drillPath = gerberSvg.querySelector('#drillMask path');
            drillPath.setAttribute('fill', layerType === 'bw' ? '#ffffff' : '#000000');
            outerSvg.setAttribute('style', `opacity: ${ twoSide ? 1 : 0}; fill:${ canvasBg === 'black' ? '#ffffff' : '#000000' }`);

            const svgString = new XMLSerializer().serializeToString(svg);
            const width = parseFloat(svg.getAttribute('width'));
            const height = parseFloat(svg.getAttribute('height'));

            svg2png(svgString, width, height, canvasBg).then(canvas => {
                canvas.setAttribute('style', 'width: 100%; height: 100%;');
                canvas.toBlob(pngBlob => {
                    changeDpiBlob(pngBlob, 1000).then((changeBlob) => {
                        const finalBlob = new Blob([changeBlob], { type: 'image/png' });
                        const blobUrl = (window.URL || window.webkitURL || window).createObjectURL(finalBlob);

                        resolve({ name: name, url: blobUrl });
                    })
                }, 'image/png');
            }).catch(err => { 
                console.error('Error converting svg to png :', err)
                reject(err);
            });     
            
        })
        
    }

    const handlePngConversion = async () => {
        if (quickSetupRef.current.value === 'generate-all') {
            const newUrls = []
            for (const option in setUpConfig(topstack, bottomstack)) {
                const setup = setUpConfig(topstack, bottomstack)[option];

                if (!props.isChecked && setup.stack !== topstack) continue;
                
                const svg = setup.stack.svg.cloneNode(true);
                handleSvg(svg, option, setup);
                handleColorChange({ color: setup.color, id: topstack.id, svgs:[svg] });
                // console.log('Side : ', setup)
                const newUrl = await generatePNG(svg, props.isChecked, setup.id, setup.canvas);
                // console.log( 'newURLS : ',{ name: newUrl.name, url: newUrl.url })
                newUrls.push({ name: newUrl.name, url: newUrl.url });
            }

            // console.log('newUrls', newUrls)
            setPngUrls([...pngUrls, ...newUrls]);
            return
        }

        const targetSvg = mainSvg.svg === fullLayers ? topstack.svg.cloneNode(true) : mainSvg.svg.cloneNode(true); 
        // console.log('TargetSVG : ', targetSvg)
        const blob = await generatePNG(targetSvg, props.isChecked, mainSvg.id, canvasBg);
        // console.log( 'newURLS : ',{ name: blob.name, url: blob.url })
        setPngUrls([...pngUrls, { name: blob.name, url: blob.url }]);
    }

    return (
        <>
            {/* Quick Setup and Convert Button */}
            <div className="setupDiv">
                <div>
                    <h5> Quick Setup</h5>
                    <select name="toolWidth" id="quickSetup" ref={quickSetupRef} value={changeSelect} onChange={ (e) => { 
                            setChangeSelect(e.target.value); 
                            if (e.target.value !== 'generate-all') handleQuickSetup(e.target.value); 
                        }}
                    >
                        <option value="custom-setup">Custom</option>
                        <option value="top-trace">Top Trace</option>
                        <option value="top-drill">Top Drill</option>
                        <option value="top-cut">Top Cut</option>
                        <option value="bottom-trace" className="bottomSetup" disabled={ props.isChecked ? false : true }>Bottom Trace</option>
                        <option value="bottom-cut" className="bottomSetup" disabled={ props.isChecked ? false : true }>Bottom Cut</option>
                        <option value="generate-all" style={{ fontWeight: 600 }}>Generate All</option>
                    </select>
                </div>
                <div>
                    <button className="convertBtn" id="renderButton" onClick={ handlePngConversion } data-layer="toplayers"><span className='text' id="renderBtnText">Generate PNG </span><span className="icon"><i className="fa-solid fa-download fa-sm"></i></span></button>
                </div>  
            </div>
        </>
    )
}


 
function DoubleSideButton(props) {
    const { isChecked, setIsChecked } = props;
    const { topstack, bottomstack, fullLayers, handleToggleCick, isToggled, stackConfig, setChangeSelect } = useGerberConfig();
    const toolWidthRef = useRef(null);

    const handleDoubleSide = (e) => {
        setIsChecked(!isChecked);

        if (!e.target.checked && !isToggled['commonlayer']['outlayer'] || e.target.checked && isToggled['commonlayer']['outlayer']) {
            handleToggleCick('commonlayer', 'outlayer');
        }

        topstack.svg.querySelector('#toplayerouter').style.display = isChecked ? 'none' : 'block';
        bottomstack.svg.querySelector('#bottomlayerouter').style.display = isChecked ? 'none' : 'block';
        fullLayers.querySelector('#fullstackouter').style.display = isChecked ? 'none' : 'block';
    }

    const handleToolWidth = () => {
        const toolwidth = parseFloat(toolWidthRef.current.value);
        const svgs = [{stack: topstack, name:'toplayer'}, {stack: bottomstack, name:'bottomlayer'}, {stack: fullLayers, name:'fullstack'}];

        svgs.forEach(({stack, name}) => {
            const outer = stack.svg.querySelector(`#${name}outer`);
            const main = stack.svg.querySelector(`#${name}MainG`);

            const newOuter = generateOuterSvg(stackConfig.width, stackConfig.height, toolwidth, { viewboxX: stackConfig.viewbox.viewboxX, viewboxY: stackConfig.viewbox.viewboxY });
            newOuter.svg.setAttribute('id', `${name}outer-svg`);
            newOuter.svg.setAttribute('style', 'fill: #86877c; opacity: 0.5');
            stack.svg.setAttribute('width', `${newOuter.width}mm`);
            stack.svg.setAttribute('height', `${newOuter.height}mm`);
            outer.querySelector('svg').replaceWith(newOuter.svg);
            main.setAttribute('transform', `translate(${ toolwidth === 0 ? 0 : 3 } ${ toolwidth === 0 ? 0 : 3 })`);
        })
    }

    return (
        <>
            {/* Double Side Toggle and Tool Width Selection */}
            <div className="doubleSideDiv" id="doubleSideOuterDiv">
                <div className="checkbox">
                    <span>Double Side</span>
                    <label className="toggle" id="doubleSideToggle">
                    <input type="checkbox" id="sideToggle" onChange={ handleDoubleSide } />
                    <div className="slider">
                        <span className="oneSide"></span>
                        <span className="twoSide"></span>
                    </div>
                    </label>
                </div>
                <div className={ `selectToolWidth ${ isChecked ? '' : 'layerHide' }`} id="selectToolWidth">
                    <span>Tool Width</span>
                    <select ref={ toolWidthRef } name="toolWidth" id="toolWidth" onChange={ () => {setChangeSelect('custom-setup'); handleToolWidth()}  }>
                        <option value="0.8">0.8</option>
                        <option value="0.0">0.0</option>
                    </select>
                </div>
            </div>
        </>
    )
}

function LayersToggleButtons({ isChecked }) {
    const { isToggled } = useGerberConfig();

    const layers = [
        { type: 'toplayer', label: 'Top Layer', colors: ['#ced8cd', '#b9a323', '#348f9b', '#348f9b'], properties: ['trace', 'pads', 'silkscreen', 'soldermask'], ids: ['top_copper', 'top_solderpaste', 'top_silkscreen', 'top_soldermask'] },
        { type: 'bottomlayer', label: 'Bottom Layer', colors: ['#206b19', '#b9a323', '#348f9b', '#348f9b'], properties: ['trace', 'pads', 'silkscreen', 'soldermask'], ids: ['bottom_copper', 'bottom_solderpaste', 'bottom_silkscreen', 'bottom_soldermask'] },
        { type: 'commonlayer', label: null, colors: ['#206b19', '#b9a323', '#348f9b'], properties: ['outline', 'drill', 'outlayer'], ids: ['outline', 'drill', 'outer'] },
    ]

    return (
        <>
            <div className="toggleLayers p-3 lg:block md:flex md:items-end md:gap-5">
                { layers.map((layer, index) => (
                    <div key={index} className={ layer.label ? layer.type + ' lg:mt-5' : 'commonlayer lg:mt-5 md:items-end'}>
                        <div className="heading">
                            <h5>{ layer.label }</h5>
                        </div>
                        { layer.colors.map((color, i) =>(
                            <ToggleButton 
                                key={i} 
                                color={color} 
                                layertype={layer.type} 
                                layerProperty={layer.properties[i]}  
                                isToggled={ isToggled[layer.type][layer.properties[i]] } 
                                layerId={layer.ids[i]}
                                isChecked={isChecked}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </>
    )
}

function ToggleButton(props) {
    const { topstack, bottomstack, fullLayers, handleToggleCick, setChangeSelect, layerType, setIsToggled } = useGerberConfig();
    const { color, layertype, layerProperty, isToggled, layerId, isChecked } = props;

    const handleClick = () => {
        let layerGroups = [];

        if (layertype === 'toplayer') {
            layerGroups = [topstack.svg.querySelectorAll('g'), fullLayers.querySelectorAll('g')];
        } else if (layertype === 'bottomlayer') {
            layerGroups = [bottomstack.svg.querySelectorAll('g'), fullLayers.querySelectorAll('g')];
        } else {
            layerGroups = [topstack.svg.querySelectorAll('g'), bottomstack.svg.querySelectorAll('g'), fullLayers.querySelectorAll('g')];
        }

        if (layerProperty === 'soldermask' && layerType !== 'originaly') {
            handleColorChange({ color: layerType, id: topstack.id, svgs:[topstack.svg, bottomstack.svg], soldermask: isToggled });
            setIsToggled(prev => ({
                ...prev, 
                [layertype]: { 
                    trace: prev[layertype].soldermask, 
                    pads: prev[layertype].soldermask, 
                    silkscreen: prev[layertype].soldermask, 
                    soldermask: isToggled 
                },
            }))

            layerGroups.forEach(layerGroup => {
                layerGroup.forEach(g => {
                    if (g.hasAttribute('id')) {
                        // console.log('g', g)
                        const id = g.getAttribute('id');
                        g.style.display = id.includes(layerId) ? 'block' : id.includes(topstack.id) ? 'none' : id.includes('drillMask') ? 'none' : '   ';
                    }
                })
            })

        } else {
            handleColorChange({ color: layerType, id: topstack.id, svgs:[topstack.svg, bottomstack.svg] });
            setIsToggled(prev => ({
                ...prev, 
                [layertype]: { ...prev[layertype], soldermask: true }
            }))
        }

        layerGroups.forEach(layerGroup => {
            layerGroup.forEach(layer => {
                if (layer.hasAttribute('id') && layer.getAttribute('id').includes(layerId)) {
                    layer.style.display = isToggled ? 'block' : 'none';
                }
            })
        })

        if (layerId === 'outline') {
            [topstack, bottomstack].forEach(stack => {
                const clipPath = stack.svg.querySelector('clipPath');
                if (clipPath) {
                    clipPath.style.display = isToggled ? 'block' : 'none';
                }
            })
        }
        handleToggleCick(layertype, layerProperty);
    }

    return (
        <div className={`layer ${ layerProperty === 'outlayer' ? isChecked ? '' : 'layerHide' : ''}`}>
            <span style={{ textTransform:'capitalize' }}>{ layerProperty }</span>
            <button className="toggleButton" style={{ 'backgroundColor': isToggled ? 'white' : color }} onClick={ () => {setChangeSelect('custom-setup'); handleClick()}}>
                <FontAwesomeIcon icon={ isToggled ? faEyeSlash : faEye } style={{ 'color': isToggled ?  '#000000' : '#ffffff'}}/>
            </button>
        </div>  
    )
}


function CanvasBackground() {
    const { canvasBg, setCanvasBg, setChangeSelect } = useGerberConfig();
    return (
        <>
            {/* Canvas Background Selector */}
            <div className="canvasDiv">
                <label htmlFor='canvasSelect'>Canvas Background </label>
                <select name="canvasSelect" id="canvasBg" onChange={(e) => { setCanvasBg(e.target.value); setChangeSelect('custom-setup')  }} value={canvasBg}>
                    <option value="black">Black</option>
                    <option value="white">White</option>
                </select>
            </div> 
        </>
    )
}



