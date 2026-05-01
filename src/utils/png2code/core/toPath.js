export const toPath = (polylines, imgH, params) => {
    const ordered = orderPathsNearest(polylines);

    const paths = polylinesToPath3(ordered, imgH, params);

    return paths;
}

function orderPathsNearest(polys){
    if (polys.length <= 1) return polys.slice();

    const used = new Uint8Array(polys.length);
    const out = [];
    let idx = 0;
    used[idx] = 1;
    out.push(polys[idx]);

    while (out.length < polys.length) {
        const last = out[out.length - 1];
        const end = last[last.length - 1];
        let bestI = -1;
        let bestD = Infinity;
        let flip = false;

        for (let i = 0; i < polys.length; i++) if (!used[i]) {
            const p = polys[i];
            const d0 = sq(end[0] - p[0][0]) + sq(end[1] - p[0][1]);
            const d1 = sq(end[0] - p[p.length - 1][0]) + sq(end[1] - p[p.length - 1][1]);
            if (d0 < bestD) { bestD = d0; bestI = i; flip = false; }
            if (d1 < bestD) { bestD = d1; bestI = i; flip = true; }
        }

        const chosen = polys[bestI];
        used[bestI] = 1;
        out.push(flip ? chosen.slice().reverse() : chosen);
    }
    return out;
}

// ---------------------------------------------------------
// Path post‑processing
// ---------------------------------------------------------
function polylinesToPath3(ordered, imgH, params) {
    const paths = [];
    const s = 25.4 / Math.max(1, params.dpi); // mm per pixel

    for (const poly of ordered) {
        if (poly.length < 2) continue;

        const arr = new Float32Array(poly.length * 3);
        for (let i = 0; i < poly.length; i++) {
            const [ix, iy] = poly[i]; // pixel coords
            // map to mm; flipY optionally
            const xmm = params.originXMM + ix * s;
            const ymm = params.originYMM + (params.flipY ? (imgH - 1 - iy) : iy) * s;
            const zmm = i === 0 ? params.safeZMM : (params.dryRun ? params.safeZMM : -Math.abs(params.cutDepthMM));
            arr[i * 3 + 0] = xmm;
            arr[i * 3 + 1] = ymm;
            arr[i * 3 + 2] = zmm;
        }
        paths.push(arr);
    }

    return paths;
}