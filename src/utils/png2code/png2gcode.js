import { edt } from "./core/edt";
import { isolation } from "./core/isolation";
import { generatePolyline } from "./core/polyline";
import { thresholdRGBA } from "./core/threshold";
import { toPath } from "./core/toPath";

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

    const paths = toPath(polylines, h, params);

    // TODO: convert polylines to G-code with appropriate scaling, offsets, and feed rates

    return {
        paths,
        estimateTime: estimateTime(paths, params),
        bbox: bboxOfPaths(paths)
    }
}

export function pathsToGcode(paths, params) {
  const safeZ = params.safeZMM || 2;
  const xyFeed = (params.xyFeedMMS || 5) * 60; // mm/s → mm/min
  const zFeed = (params.zFeedMMS || 2) * 60;

  const g = [];

  // Header
  g.push("G21"); // mm mode
  g.push("G90"); // absolute positioning
  g.push(`G0 Z${safeZ.toFixed(3)}`);

  for (const path of paths) {
    if (!path || path.length < 6) continue;

    // First point → rapid move (safe Z)
    const x0 = path[0];
    const y0 = path[1];
    const z0 = path[2]; // should be safeZ

    g.push(`G0 X${x0.toFixed(3)} Y${y0.toFixed(3)} Z${z0.toFixed(3)}`);

    // Second point → plunge (cut depth)
    const zCut = path[5];
    g.push(`G1 Z${zCut.toFixed(3)} F${zFeed.toFixed(1)}`);

    // Remaining points → cutting moves
    for (let i = 1; i < path.length / 3; i++) {
      const x = path[i * 3];
      const y = path[i * 3 + 1];

      g.push(`G1 X${x.toFixed(3)} Y${y.toFixed(3)} F${xyFeed.toFixed(1)}`);
    }

    // Retract after path
    g.push(`G0 Z${safeZ.toFixed(3)}`);
  }

  // Footer
  g.push("M5");  // spindle off (optional)
  g.push("M30"); // program end

  return g.join("\n");
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