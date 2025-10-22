export default async function svg2png(svg, swidth, sheight, canvasBg) {
    
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
