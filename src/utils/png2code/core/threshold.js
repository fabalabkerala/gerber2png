
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
    return out;
}
