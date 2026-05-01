// Marching‑squares contours for each level
// polyline: number[][][]
export const generatePolyline = (levels, dist, w, h) => {
    const polylines = [];

    for (const level of levels) {
        const segments = contourSegments(dist, w, h, level);
        const polys = stitchSegments(segments, 1e-3);
        for (const p of polys) if (p.length >= 1) polylines.push(p);
    }
    return polylines;
}


// Seg = { x1: number; y1: number; x2: number; y2: number };
// field: Float32Array, w: number, h: number, level: number;
function contourSegments(field, w, h, level) {
    const segs = [];

    function sample(x, y) {
        return field[y * w + x];
    }
    const interp = (v1, v2, t) => {
        const a = v1, b = v2;
        const u = (level - a) / (b - a + (b === a ? 1e-12 : 0));
        return t[0] + u * (t[1] - t[0]);
    };

    for (let y = 0; y < h - 1; y++) {
        for (let x = 0; x < w - 1; x++) {
        // corners: f00 (x,y), f10 (x+1,y), f11 (x+1,y+1), f01 (x,y+1)
        const f00 = sample(x, y);
        const f10 = sample(x + 1, y);
        const f11 = sample(x + 1, y + 1);
        const f01 = sample(x, y + 1);

        // bitmask
        let idx = 0;
        if (f00 >= level) idx |= 1;
        if (f10 >= level) idx |= 2;
        if (f11 >= level) idx |= 4;
        if (f01 >= level) idx |= 8;
        if (idx === 0 || idx === 15) continue;

        // interpolate edges
        const xL = x, xR = x + 1, yB = y, yT = y + 1;

        const ex = (a, b) => interp(a, b, [xL, xR]);
        const ey = (a, b) => interp(a, b, [yB, yT]);

        // Edge points
        // E0: bottom (x→x+1, y fixed), E1: right (y→y+1, x+1), E2: top, E3: left
        const e0x = ex(f00, f10), e0y = yB;
        const e1x = xR,          e1y = ey(f10, f11);
        const e2x = ex(f01, f11), e2y = yT;
        const e3x = xL,          e3y = ey(f00, f01);

        // case table (minimal)
        switch (idx) {
            case 1:  case 14: segs.push({ x1: e3x, y1: e3y, x2: e0x, y2: e0y }); break;
            case 2:  case 13: segs.push({ x1: e0x, y1: e0y, x2: e1x, y2: e1y }); break;
            case 3:  case 12: segs.push({ x1: e3x, y1: e3y, x2: e1x, y2: e1y }); break;
            case 4:  case 11: segs.push({ x1: e1x, y1: e1y, x2: e2x, y2: e2y }); break;
            case 5:                      // ambiguous saddle — draw two segments
            segs.push({ x1: e3x, y1: e3y, x2: e0x, y2: e0y });
            segs.push({ x1: e1x, y1: e1y, x2: e2x, y2: e2y });
            break;
            case 6:  case 9:  segs.push({ x1: e0x, y1: e0y, x2: e2x, y2: e2y }); break;
            case 7:  case 8:  segs.push({ x1: e3x, y1: e3y, x2: e2x, y2: e2y }); break;
            case 10:                     // ambiguous saddle
            segs.push({ x1: e0x, y1: e0y, x2: e1x, y2: e1y });
            segs.push({ x1: e3x, y1: e3y, x2: e2x, y2: e2y });
            break;
        }
        }
    }
    return segs;
}

// Stitch marching-squares line segments into polylines by snapping endpoints
// to a tolerance grid, then walking unused edges.
// Output : array of polylines, where each polyline is an array of [x,y] points.
function stitchSegments(segs, tol = 1e-3) {
    if (!segs.length) return [];

    // snap point -> string key
    const keyOf = (x, y) => {
        const kx = Math.round(x / tol);
        const ky = Math.round(y / tol);
        return `${kx},${ky}`;
    };

    // Keep original snapped coords for output
    const ptOf = (key) => {
        const [kx, ky] = key.split(",").map((v) => parseInt(v, 10));
        return [kx * tol, ky * tol];
    };

    // Build adjacency: for each snapped endpoint, store edges to the other endpoint
    // type Edge = { to: string; segIndex: number; used: boolean };
    const adj = new Map();

    function addEdge(aKey, bKey, segIndex) {
        if (!adj.has(aKey)) adj.set(aKey, []);
        if (!adj.has(bKey)) adj.set(bKey, []);
        adj.get(aKey).push({ to: bKey, segIndex, used: false });
        adj.get(bKey).push({ to: aKey, segIndex, used: false });
    }

    const aKeys = new Array(segs.length);
    const bKeys = new Array(segs.length);

    for (let i = 0; i < segs.length; i++) {
        const s = segs[i];
        const ak = keyOf(s.x1, s.y1);
        const bk = keyOf(s.x2, s.y2);
        aKeys[i] = ak; bKeys[i] = bk;
        addEdge(ak, bk, i);
    }

    // Helper: mark an undirected edge (ak<->bk) as used on both sides
    function markUsed(ak, bk, segIndex) {
        const ea = adj.get(ak);
        const eb = adj.get(bk);
        const A = ea && ea.find(e => e.segIndex === segIndex && e.to === bk);
        const B = eb && eb.find(e => e.segIndex === segIndex && e.to === ak);
        if (A) A.used = true;
        if (B) B.used = true;
    }

    // Walk edges to produce polylines
    const polylines = [];

    // set of nodes that still have any unused edge
    const nodes = Array.from(adj.keys());

    function nextUnusedFrom(node) {
        const list = adj.get(node);
        return list && list.find(e => !e.used);
    }

    for (const start of nodes) {
        // Start as long as there is an unused edge incident to 'start'
        while (true) {
            const firstEdge = nextUnusedFrom(start);
            if (!firstEdge) break;

            // Begin a new chain
            const chain = [];
            let curr = start;
            // push starting point
            chain.push(ptOf(curr));

            // Walk forward until dead-end or we return to start forming a loop
            // Each step consumes one unused edge.
            while (true) {
                const e = nextUnusedFrom(curr);
                if (!e) break;
                markUsed(curr, e.to, e.segIndex);
                curr = e.to;
                chain.push(ptOf(curr));
                // If we came back to the start and the next edge is none, we close a loop.
                // (Even if there are still other branches from start, they’ll be handled by outer while)
                if (curr === start && !nextUnusedFrom(curr)) break;
                // If current node has no more unused edges, we stop this chain.
                if (!nextUnusedFrom(curr)) break;
            }

            // Only keep chains with at least 2 distinct points
            if (chain.length >= 2) polylines.push(chain);
        }
    }

    return polylines;
}
