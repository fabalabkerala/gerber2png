import { edt } from "./core/edt";
import { isolation } from "./core/isolation";
import { generatePolyline } from "./core/polyline";
import { thresholdRGBA } from "./core/threshold";

export function png2gcode(img, params) {
    const { w, h, rgba } = rasterize(img);

    // Threshold -> binary mask where 1 = CUT, 0 = KEEP
    const mask = thresholdRGBA(rgba, w, h, params.threshold, params.invert);

    // Euclidean distance transform to nearest KEEP (0)
    // Values measured in pixels
    const dist = edt(mask, w, h);

    // Isolation levels (pixels)
    const levels = isolation(dist, params);

    const polylines = generatePolyline(levels, dist, w, h);

    // TODO: convert polylines to G-code with appropriate scaling, offsets, and feed rates

    return {
        polylines,
        estimateTime: estimateTime(polylines, params),
        bbox: bboxOfPaths(polylines)
    }

}



// ---------------------------------------------------------
// Rasterization
// ---------------------------------------------------------
function rasterize(img) {
    let w, h, rgba;

    if (img instanceof ImageData) {
        w = img.width; h = img.height; rgba = img.data;
    } else {
        const c = document.createElement("canvas");
        c.width = (img).width;
        c.height = (img).height;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const im = ctx.getImageData(0, 0, c.width, c.height);
        w = im.width; h = im.height; rgba = im.data;
    }

    return { w, h, rgba };
}


function bboxOfPaths(paths) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const arr of paths) {
        for (let i = 0; i < arr.length; i += 3) {
        const x = arr[i], y = arr[i + 1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        }
    }
    if (!isFinite(minX)) { minX = minY = 0; maxX = maxY = 0; }
    return { minX, minY, maxX, maxY };
}



function estimateTime(paths, p) {
    // crude: XY length / feed (ignores accel + Z)
    let length = 0;
    for (const arr of paths) {
        let px = arr[0], py = arr[1];
        for (let i = 1; i < arr.length / 3; i++) {
        const x = arr[i * 3 + 0], y = arr[i * 3 + 1];
        length += Math.hypot(x - px, y - py);
        px = x; py = y;
        }
    }
    return length / Math.max(0.1, p.xyFeedMMS);
}