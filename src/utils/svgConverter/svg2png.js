import { changeDpiBlob } from "changedpi";

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

            const toolWidth = 0.8;
            const toolWidthErr = 0.02;
            const scaledToolWidth = (toolWidth + toolWidthErr) * scaleFactor;

            canvas.width = scaledWidth + scaledToolWidth * 2;
            canvas.height = scaledHeight + scaledToolWidth * 2; 
            
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = canvasBg;
            ctx.fillRect(0, 0, scaledWidth + scaledToolWidth * 2, scaledHeight + scaledToolWidth * 2);
            ctx.drawImage(img, scaledToolWidth, scaledToolWidth, scaledWidth , scaledHeight );

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

                    resolve({ name: name, url: blobUrl });
                })
            }, 'image/png');
        }).catch(err => { 
            console.error('Error converting svg to png :', err)
            reject(err);
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
 