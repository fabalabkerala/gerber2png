
export function thresholdRGBA(rgba, w, h, threshold, invert) {
    const out = new Uint8Array(w * h);
    const T = Math.max(0, Math.min(255, threshold | 0));

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;
            const a = rgba[i + 3];
            let on = 0;
            if (a !== 0) {
                const v = (rgba[i] + rgba[i + 1] + rgba[i + 2]) / 3;
                // If invert=true, black= CUT; else white = CUT
                on = invert ? (v <= T ? 1 : 0) : (v > T ? 1 : 0);
            }
            out[y * w + x] = on;
        }
    }
    debugMaskBlob(out, w, h);
    return out;
}

function debugMaskBlob(mask, w, h) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(w, h);

    for (let i = 0; i < mask.length; i++) {
        const v = mask[i] ? 255 : 0;

        img.data[i * 4 + 0] = v;
        img.data[i * 4 + 1] = v;
        img.data[i * 4 + 2] = v;
        img.data[i * 4 + 3] = 255;
    }

    ctx.putImageData(img, 0, 0);

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);

        console.log("Mask preview URL:", url);
        window.open(url); // 👈 THIS is what you actually want
    });
}