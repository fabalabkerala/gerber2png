/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import ConfigSection from "./configSection.jsx"
import './gerber.css'
import convertToSvg from "./convert.jsx";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useGerberConfig } from "./gerberContext.jsx";
import { PngComponent } from "./svg2png.jsx";
import JSZip from "jszip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotateRight } from "@fortawesome/free-solid-svg-icons";


export default function GerberSection() {
    const [isAnimating, setIsAnimating] = useState(false);
    const { mainSvg, pngUrls, setPngUrls } = useGerberConfig();
    const [active, setActive] = useState(false);
    const resultRef = useRef(null);
    const pngRef = useRef(null);
    const dropAreaRef = useRef(null);

    useEffect(() => {
        if (resultRef.current && mainSvg.svg) {  
            setIsAnimating(true);
            setTimeout(() => {
                resultRef.current.innerHTML = '';
                setTimeout(() => {
                    resultRef.current.appendChild(mainSvg.svg);
                    setIsAnimating(false);
                }, 250);
            }, 300); 
        }
    },[mainSvg])


    const downloadZip = () => {
        const zip = new JSZip();
        Promise.all(
            pngUrls.map((pngBlob, index) => {
                return new Promise((resolve) => {
                    fetch(pngBlob.url).then(response => response.blob()).then(blob => {
                        zip.file(`${pngBlob.name}_${index}.png`, blob);
                        resolve();
                    })
                })
            })
        ).then(() => {
            zip.generateAsync({ type : 'blob' }).then(zipBlob => {
                const url = window.URL.createObjectURL(zipBlob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `gerber_files_${pngUrls.length}.zip`);
                document.body.appendChild(link);
                link.click();
            }).catch(err => { console.log('Error Generating Zip File :', err) })
        })
    }


    const transitionStyle = {
        transition: 'opacity 0.3s ease-in-out',
        opacity: isAnimating ? 0 : 1,
    };
 
    return (
        <>
            <div className="relative h-[90%] " >

                <ConfigSection pngRef={pngRef} active={active} setActive={setActive}/>
                
                <div className="h-full flex items-center justify-end">
                    <div className="lg:w-4/5 md:w-full sm:w-full w-full h-full gridsection">
                        <RefreshButton dropAreaRef={ dropAreaRef } resultRef={ resultRef } setIsAnimating={setIsAnimating} setActive={setActive} />

                        <SvgSideComponent active={active} />

                        <DropAreaComponent dropAreaRef={ dropAreaRef } resultRef={ resultRef } />

                        <TransformWrapper initialScale={1} minScale={.5} limitToBounds={ false }>
                            <TransformComponent
                                contentStyle={{  margin:'auto', transition: 'transform 0.3s ease' }} 
                                wrapperStyle={{ width: '100%', height: '100%', overflow:'visible', display:'flex'}} 
                            >
                                <div ref={ resultRef } style={transitionStyle} className="flex items-center h-full justify-center"></div>
                            </TransformComponent>
                        </TransformWrapper>

                        <SvgColorComponent active={active} />

                        <div className="pngDiv">
                            { pngUrls.length > 0 && (
                                <div className="zipDiv">
                                    <button className="button-side" style={{ width: '100%' }} onClick={ downloadZip }><span className="text">Download Zip</span></button>
                                </div>
                            )}
                            <div ref={pngRef}>
                                {/* Create a shallow copy of the pngUrl to render it in reverse order */}
                                { pngUrls.slice().reverse().map((url, index) => (
                                    <PngComponent 
                                        key={index} 
                                        blobUrl={ url.url } 
                                        name={ `${ url.name }_1000dpi.png` } 
                                        handleDelete={ () => {
                                            setPngUrls((prevState) => {
                                                const newState = [...prevState];
                                                newState.splice(pngUrls.length - 1 - index, 1);
                                                return newState
                                            });
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


function DropAreaComponent(props) {
    const { setTopStack, setBottomStack, setFullLayers, setMainSvg, setLayerType, setStackConfig } = useGerberConfig();

    const [isDragging, setIsDragging] = useState(false);
    // const dropAreaRef = useRef(null);

    const handleInputFiles = (e) => {
        e.preventDefault();
        setIsDragging(false)

        // Access the Files From DataTransfer Object if the files are dropped
        const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        convertToSvg(files, setTopStack, setBottomStack, setFullLayers, setMainSvg, setStackConfig).then(() => {
            if (e.target.files) {
                const newInput = document.createElement('input');
                newInput.multiple = true;
                newInput.type = 'file';
                e.target.parentNode.replaceChild(newInput, e.target);
            }
             
            props.dropAreaRef.current.style.display = 'none';   
            props.resultRef.current.style.display = 'flex';
            setLayerType('original')
        })
    }

    return (
        <>
            <div 
                ref={ props.dropAreaRef }
                className={`dropArea ${isDragging ? 'active' : ''}`} 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }} 
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true) }} 
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false) }} 
                onDrop={ handleInputFiles }
            >
                <div className="dropbox">
                    <div className="shadow">
                        <p>Drop your Gerber file here</p>
                        <input type="file" id="gerberFileInput" onChange={ handleInputFiles } multiple/>
                    </div>
                </div>
            </div>
        </>
    )
}

function SvgColorComponent({active}) {
    const { topstack, bottomstack, layerType, setLayerType, setChangeSelect, setIsToggled } = useGerberConfig();
    return (
        <>
            <div className="layerTypeBtnGroup" style={{pointerEvents: active ? 'auto' : 'none'}}>
                <button 
                    id="original" 
                    className={`button-side colorButton ${ layerType === 'original' ? 'active' : ''}`}
                    role="button"
                    onClick={() => { 
                        handleColorChange({ 
                            color: 'original', 
                            id: topstack.id, 
                            svgs: [topstack.svg, bottomstack.svg] 
                        }); 
                        setLayerType('original'); 
                        setChangeSelect('custom-setup');
                    }}
                ><span className="textnew_gerber_png">Original</span></button>

                <button 
                    id="bw" 
                    className={`button-side colorButton ${ layerType === 'bw' ? 'active' : ''}`}
                    role="button"
                    onClick={() => { 
                        handleColorChange({ 
                            color: 'bw', 
                            id: topstack.id, 
                            svgs: [topstack.svg, bottomstack.svg] 
                        }); 
                        setLayerType('bw'); 
                        setChangeSelect('custom-setup');
                        setIsToggled(prev => ({
                            ...prev,
                            toplayer: { ...prev.toplayer, soldermask: true },
                            bottomlayer: { ...prev.bottomlayer, soldermask: true },
                        }))
                    }}
                ><span className="text">B/W</span></button>

                <button 
                    id="invert" 
                    className={`button-side colorButton ${ layerType === 'bwInvert' ? 'active' : ''}`}
                    role="button"
                    onClick={() => { 
                        handleColorChange({ 
                            color: 'bwInvert', 
                            id: topstack.id, 
                            svgs: [topstack.svg, bottomstack.svg] 
                        }); 
                        setLayerType('bwInvert'); 
                        setChangeSelect('custom-setup');
                        setIsToggled(prev => ({
                            ...prev,
                            toplayer: { ...prev.toplayer, soldermask: true },
                            bottomlayer: { ...prev.bottomlayer, soldermask: true },
                        }))
                    }}
                ><span className="text">Invert</span></button> 
            </div>
        </>
    )
}

function SvgSideComponent({active}) {
    const { topstack, bottomstack, fullLayers, mainSvg, setMainSvg, setChangeSelect } = useGerberConfig();
    return (
        <>
            <div className="layerSideBtnGroup" style={{pointerEvents: active ? 'auto' : 'none'}}>
                <button className={ mainSvg.svg === fullLayers ? 'button-side active' : 'button-side'} onClick={() => { setChangeSelect('custom-setup'); setMainSvg({ id: 'Full Layers', svg: fullLayers }) }}><span className="text">Layers</span></button>
                <button className={ mainSvg.svg === topstack.svg ? 'button-side active' : 'button-side'} onClick={() => { setChangeSelect('custom-setup'); setMainSvg({ id: 'top_layer', svg: topstack.svg}) }}><span className="text">Top</span></button>
                <button className={ mainSvg.svg === bottomstack.svg ? 'button-side active' : 'button-side'} onClick={() => { setChangeSelect('custom-setup'); setMainSvg({ id: 'bottom_layer', svg: bottomstack.svg }) }}><span className="text">Bottom</span></button>
            </div>
        </>
    )
}


function RefreshButton({ dropAreaRef, resultRef, setIsAnimating, setActive }) {
    const { handleReset } = useGerberConfig();

    const handleResetButton = () => {
        setIsAnimating(true);
        setActive(false);
        setTimeout(() => {
            resultRef.current.innerHTML = ''
            resultRef.current.style.display = 'none';
            dropAreaRef.current.style.display = 'flex'
        }, 250);
        handleReset();
    }
    return (
        <>
            <div className="refreshButton">
                <button id="refreshBtn" onClick={ handleResetButton } ><FontAwesomeIcon icon={ faRotateRight } /><div>Refresh</div></button>
            </div>
        </>
    )
}


export function handleColorChange(props) {
    const svgColor = {
        'bw': `
            ${props.id}_fr4 {color: #000000  !important;}
            .${props.id}_cu {color: #ffffff !important;}
            .${props.id}_cf {color: #ffffff !important;}
            .${props.id}_sm {color: #ffffff; opacity: ${ props.soldermask ? 0.5 : 0 } !important;}
            .${props.id}_ss {color: #ffffff !important;}
            .${props.id}_sp {color: #ffffff !important;}
            .${props.id}_out {color: #000000 !important;}
        `,

        'bwInvert': `
            .${props.id}_fr4 {color: #ffffff  !important;}
            .${props.id}_cu {color: #000000 !important;}
            .${props.id}_cf {color: #000000 !important;}
            .${props.id}_sm {color: #000000; opacity:  ${ props.soldermask ? 0.5 : 0 } !important;}
            .${props.id}_ss {color: #000000 !important;}
            .${props.id}_sp {color: #000000 !important;}
            .${props.id}_out {color: #ffffff !important;}
        `,

        'original': `
            .${props.id}_fr4 {color: #666666  !important;}
            .${props.id}_cu {color: #cccccc !important;}
            .${props.id}_cf {color: #cc9933 !important;}
            .${props.id}_sm {color: #004200 !important; opacity: 0.75 !important;}
            .${props.id}_ss {color: #ffffff !important;}
            .${props.id}_sp {color: #999999 !important;}
            .${props.id}_out {color: #000000 !important;}
        `
    }

    console.log(props)
    props.svgs.forEach(svg => {
        const stackStyle = svg.querySelector('style');
        stackStyle.innerHTML = svgColor[props.color];
    })

    // const bottomstackStyle = props.bottomstack.svg.querySelector('style');
    // bottomstackStyle.innerHTML = svgColor[props.color];

}

