
// ---------------------------------------------------------
// Euclidean Distance Transform (Felzenszwalb/Huttenlocher)
// Distance to nearest KEEP (mask==0). Returns distance in pixels.
// ---------------------------------------------------------
export function edt(mask, w, h) {
    const INF = 1e15;

    // Sites at KEEP pixels (mask==0)
    const g = new Float32Array(w * h);
    for (let i = 0; i < g.length; i++) g[i] = (mask[i] === 0 ? 0 : INF);

    const rowOut = new Float32Array(w * h);
    const scratch = new Float32Array(Math.max(w, h));

    // Row pass (squared)
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) scratch[x] = g[y * w + x];
        const d = edt1d(scratch);
        for (let x = 0; x < w; x++) rowOut[y * w + x] = d[x];
    }

    // Column pass (squared -> sqrt)
    const out = new Float32Array(w * h);
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) scratch[y] = rowOut[y * w + x];
        const d = edt1d(scratch);
        for (let y = 0; y < h; y++) out[y * w + x] = Math.sqrt(d[y]);
    }

    return out;
}

// 1‑D EDT for array f where f[i]=0 at sites, INF elsewhere; returns squared distances
function edt1d(f) {
    const n = f.length;
    const v = new Int32Array(n);
    const z = new Float32Array(n + 1);
    const d = new Float32Array(n);

    let k = 0;
    v[0] = 0;
    z[0] = -Infinity;
    z[1] = +Infinity;

    for (let q = 1; q < n; q++) {
        let s;
        while (true) {
        const p = v[k];
        s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * (q - p));
        if (s <= z[k]) {
            k--;
            if (k < 0) {
            k = 0; v[0] = q; z[0] = -Infinity; z[1] = +Infinity;
            break;
            }
        } else break;
        }
        k++;
        v[k] = q;
        z[k] = s;
        z[k + 1] = +Infinity;
    }

    k = 0;
    for (let q = 0; q < n; q++) {
        while (z[k + 1] < q) k++;
        const p = v[k];
        d[q] = (q - p) * (q - p) + f[p];
    }

    return d;
}