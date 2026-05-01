  // 3) Isolation levels (pixels)
export const isolation = (dist, params) => {
    const mmPerPixel = 25.4 / Math.max(1, params.dpi);
    const toolRpx = (params.toolDiameterMM * 0.5) / mmPerPixel;
    const stepPx = Math.max(0.05, params.offsetStepOver * (params.toolDiameterMM / mmPerPixel));

    const levels = [];

    if (params.offsetNumber === 0) {
        // Fill: generate until distance is exhausted
        const dmax = maxArray(dist);
        for (let L = toolRpx; L <= dmax + 1e-6; L += stepPx) levels.push(L);
    } else {
        for (let i = 0; i < params.offsetNumber; i++) levels.push(toolRpx + i * stepPx);
    }

    return levels;
}

function maxArray(a) {
    let m = -Infinity;
    for (let i = 0; i < a.length; i++) if (a[i] > m) m = a[i];
    return m;
}