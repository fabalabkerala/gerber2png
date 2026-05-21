// ---------------------------------------------------------
// Mods-style Euclidean Distance Transform
//
// mask:
//   1 = trace / copper
//   0 = background
//
// output:
//   Float32Array distances
// ---------------------------------------------------------

export function edt(mask, w, h) {

    const INF = 1e20;

    // -----------------------------------------------------
    // Horizontal pass
    // -----------------------------------------------------

    const g = new Float32Array(w * h);

    for (let y = 0; y < h; y++) {

        // left -> right
        let closest = -1;

        for (let x = 0; x < w; x++) {

            const idx = y * w + x;

            if (mask[idx] !== 0) {

                g[idx] = 0;
                closest = x;

            } else {

                if (closest < 0) {
                    g[idx] = INF;
                } else {
                    g[idx] = x - closest;
                }
            }
        }

        // right -> left
        closest = -1;

        for (let x = w - 1; x >= 0; x--) {

            const idx = y * w + x;

            if (mask[idx] !== 0) {

                closest = x;

            } else if (closest >= 0) {

                const d = closest - x;

                if (d < g[idx]) {
                    g[idx] = d;
                }
            }
        }
    }

    // -----------------------------------------------------
    // Vertical pass
    // -----------------------------------------------------

    const out = new Float32Array(w * h);

    const starts = new Int32Array(h);
    const intersections = new Float32Array(h + 1);

    for (let x = 0; x < w; x++) {

        let k = 0;

        starts[0] = 0;
        intersections[0] = -INF;
        intersections[1] = INF;

        // build lower envelope
        for (let q = 1; q < h; q++) {

            let s;

            while (true) {

                const p = starts[k];

                s =
                    (
                        (
                            square(g[q * w + x]) + square(q)
                        ) -
                        (
                            square(g[p * w + x]) + square(p)
                        )
                    ) /
                    (2 * (q - p));

                if (s <= intersections[k]) {

                    k--;

                    if (k < 0) {
                        k = 0;
                        starts[0] = q;
                        intersections[0] = -INF;
                        intersections[1] = INF;
                        break;
                    }

                } else {
                    break;
                }
            }

            k++;

            starts[k] = q;
            intersections[k] = s;
            intersections[k + 1] = INF;
        }

        // evaluate distance field
        k = 0;

        for (let y = 0; y < h; y++) {

            while (intersections[k + 1] < y) {
                k++;
            }

            const p = starts[k];

            out[y * w + x] = Math.sqrt(
                square(y - p) +
                square(g[p * w + x])
            );
        }
    }

    debugEDTBlob(out, w, h);

    return out;
}

function square(x) {
    return x * x;
}
export function debugEDTBlob(dist, w, h) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(w, h);

    // 🔹 Find max distance for normalization
    let max = 0;
    for (let i = 0; i < dist.length; i++) {
        const d = dist[i];
        if (isFinite(d) && d > max) max = d;
    }

    if (max === 0) max = 1;

    // 🔹 Convert distance → grayscale
    for (let i = 0; i < dist.length; i++) {
        let d = dist[i];

        if (!isFinite(d)) d = max; // clamp INF

        const v = Math.floor((d / max) * 255);

        img.data[i * 4 + 0] = v;
        img.data[i * 4 + 1] = v;
        img.data[i * 4 + 2] = v;
        img.data[i * 4 + 3] = 255;
    }

    ctx.putImageData(img, 0, 0);

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);

        console.log("EDT preview URL:", url);
        window.open(url);
    });
}