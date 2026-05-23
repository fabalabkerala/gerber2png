import { changeDpiBlob } from "changedpi";
import generateOuterSvg from "./generateOuter";

export const OUTLINE_EXPORT_PADDING_MM = 0.82;
export const CORRECTION_OFFSET_MM = 0.02;

async function svg2png(svg, swidth, sheight, canvasBg) {
    
    return new Promise((resolve, reject) => {
        const svgBlob = new Blob([svg], { type: "image/svg+xml" });
        let blobURL = (window.URL || window.webkitURL || window).createObjectURL(svgBlob);
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement("canvas");

            const scaleFactor = 1000 / 25.4;
            const scaledWidth = swidth * scaleFactor;
            const scaledHeight = sheight * scaleFactor;

            const scaledToolWidth = OUTLINE_EXPORT_PADDING_MM * scaleFactor;

            canvas.width = scaledWidth + scaledToolWidth * 2;
            canvas.height = scaledHeight + scaledToolWidth * 2; 
            
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = canvasBg;
            ctx.fillRect(0, 0, scaledWidth + scaledToolWidth * 2, scaledHeight + scaledToolWidth * 2);
            ctx.drawImage(img, scaledToolWidth, scaledToolWidth, scaledWidth , scaledHeight );

            // Convert to binary: black and white only
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                if (r !== 255 || g !== 255 || b !== 255) {
                    data[i] = 0;     // Red
                    data[i + 1] = 0; // Green
                    data[i + 2] = 0; // Blue
                }
                // Alpha remains unchanged
            }
            ctx.putImageData(imageData, 0, 0);

            (window.URL || window.webkitURL || window).revokeObjectURL(blobURL);

            resolve(canvas);
        };

        // Handle errors during image loading
        img.onerror = function (err) {
            console.log('Error loading image:', err);
            reject(err);
            (window.URL || window.webkitURL || window).revokeObjectURL(blobURL);
        };
        img.src = blobURL;
    });  
}

const generatePNG = async (targetSvg, twoSide, name, canvasBg, layertype) => {
    return new Promise((resolve, reject) => {
        const [outerSvg, gerberSvg] = targetSvg.querySelectorAll('svg');
        const svg = twoSide ? targetSvg : gerberSvg;

        const drillPath = gerberSvg.querySelector('#drillMask path');
        drillPath.setAttribute('fill', layertype === 'bw' ? '#ffffff' : '#000000');
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
                    getPngDimensions(blobUrl, 1000).then((dimensions) => {
                        resolve({ 
                            name: name, 
                            url: blobUrl, 
                            width: dimensions.width, 
                            height: dimensions.height 
                        });
                    })
                })
            }, 'image/png');
        }).catch(err => { 
            console.error('Error converting svg to png :', err)
            reject(err);z
        });      
    })
}
export default generatePNG;

export const getPngDimensions = async (blobUrl, dpi = 1000) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const widthPx = img.naturalWidth;
            const heightPx = img.naturalHeight;
            const widthInches = widthPx / dpi;
            const heightInches = heightPx / dpi;
            const widthMm = widthInches * 25.4;
            const heightMm = heightInches * 25.4;

            const round = (num) => Math.round(num * 100) / 100;

            resolve({ 
                width: round(widthMm), 
                height: round(heightMm) 
            });
        };
        img.onerror = reject;
        img.src = blobUrl;
    });
};
 
export const generatePngLayout = async (
    url, 
    rows, 
    columns, 
    spacing, 
    background, 
    visible, 
    singleOutlineEnabled = false,
    toolWidth,
    targetDPI = 1000, 
    inputDPI = 1000,
) => {
    const scaleRatio = targetDPI / inputDPI;
    const scaleFactor = targetDPI / 25.4;
    const scaledSpacing = spacing * scaleFactor;
    const correctedToolWidth = Number(toolWidth) + CORRECTION_OFFSET_MM;

    return new Promise((resolve, reject) => {
        const image = new Image()

        image.onload = () => {
            const imgW = image.width * scaleRatio;
            const imgH = image.height * scaleRatio;

            const totalW = Math.round((columns * imgW + (columns - 1) * scaledSpacing) + (singleOutlineEnabled ? correctedToolWidth * scaleFactor * 2 : 0));
            const totalH = Math.round((rows * imgH + (rows - 1) * scaledSpacing) + (singleOutlineEnabled ? correctedToolWidth * scaleFactor * 2 : 0));

            console.log('Total Width ', totalW, 'total Height', totalH)

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            canvas.width  = totalW;
            canvas.height = totalH;

            ctx.fillStyle = background;
            ctx.fillRect(0, 0, totalW, totalH);
            let identifier = 0

            for (let row = 0; row < rows; row++) {
                for (let column = 0; column < columns; column++) {
                    const x = column * (imgW + scaledSpacing + (singleOutlineEnabled ? correctedToolWidth * scaleFactor : 0));
                    const y = row * (imgH + scaledSpacing + (singleOutlineEnabled ? correctedToolWidth * scaleFactor : 0));
                    if (visible[identifier]) ctx.drawImage(image, x, y, imgW, imgH)
                    identifier++

                }
            }

            canvas.toBlob(pngBlob => {
                if (!pngBlob) return reject(new Error('Canvas creation failed'));
                changeDpiBlob(pngBlob, targetDPI).then((changeBlob) => {
                    const finalBlob = new Blob([changeBlob], { type: 'image/png' });
                    const blobUrl = (window.URL || window.webkitURL || window).createObjectURL(finalBlob);

                    resolve({ url: blobUrl, blob: finalBlob });
                })
            }, 'image/png');
        }

        // Handle errors during image loading
        image.onerror = function (err) {
            console.log('Error loading image:', err);
            reject(err);
            // (window.URL || window.webkitURL || window).revokeObjectURL(blobURL);
        };

        image.src = url
    })
}

export const generateSingleOutlineLayout = async (
    totalWidth,
    totalHeight,
    toolWidth = 0,
    background = "black",
    targetDPI = 1000
) => {
    const normalizedToolWidth = Number.isFinite(toolWidth) ? Math.max(toolWidth, 0) : 0;
    const correctedToolWidth = normalizedToolWidth + CORRECTION_OFFSET_MM;

    const innerWidth = Math.max(totalWidth - correctedToolWidth * 2, 0.01);
    const innerHeight = Math.max(totalHeight - correctedToolWidth * 2, 0.01);

    const outer = generateOuterSvg(
        innerWidth,
        innerHeight,
        correctedToolWidth,
        { viewboxX: correctedToolWidth, viewboxY: correctedToolWidth },
        false
    );

    const outlinePath = outer.svg.querySelector("path");
    outlinePath.setAttribute("fill", "#ffffff");
    outlinePath.setAttribute("stroke", "none");
    outer.svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    outer.svg.style.setProperty("shape-rendering", "crispEdges");

    return new Promise((resolve, reject) => {
        const scaleFactor = targetDPI / 25.4;
        const svgString = new XMLSerializer().serializeToString(outer.svg);
        const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
        const blobUrl = (window.URL || window.webkitURL || window).createObjectURL(svgBlob);
        const image = new Image();

        image.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const paddedWidth = totalWidth + correctedToolWidth * 2;
            const paddedHeight = totalHeight + correctedToolWidth * 2;
            const paddingPx = correctedToolWidth * scaleFactor;

            canvas.width = Math.round(paddedWidth * scaleFactor);
            canvas.height = Math.round(paddedHeight * scaleFactor); 

            ctx.fillStyle = background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
                image,
                paddingPx,
                paddingPx,
                Math.round(totalWidth * scaleFactor),
                Math.round(totalHeight * scaleFactor)
            );

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                if (r !== 255 || g !== 255 || b !== 255) {
                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                }
            }

            ctx.putImageData(imageData, 0, 0);
            (window.URL || window.webkitURL || window).revokeObjectURL(blobUrl);

            canvas.toBlob((pngBlob) => {
                if (!pngBlob) {
                    reject(new Error("Canvas creation failed"));
                    return;
                }

                changeDpiBlob(pngBlob, targetDPI).then((changeBlob) => {
                    const finalBlob = new Blob([changeBlob], { type: "image/png" });
                    const finalUrl = (window.URL || window.webkitURL || window).createObjectURL(finalBlob);

                    resolve({ url: finalUrl, blob: finalBlob });
                }).catch(reject);
            }, "image/png");
        };

        image.onerror = (error) => {
            (window.URL || window.webkitURL || window).revokeObjectURL(blobUrl);
            reject(error);
        };

        image.src = blobUrl;
    });
}
