import generateOuterSvg from "./generateOuter";

export default async function convertToSvg(
    files, 
    setTopStack, 
    setBottomStack, 
    setFullLayers, 
    setMainSvg, 
    setStackConfig
) {
    const stackup = await stackupFromFiles(files)
    const topxmlDoc = new DOMParser().parseFromString(stackup.top.svg, 'image/svg+xml');
    const topsvg = topxmlDoc.documentElement;
    const bottomxmlDoc = new DOMParser().parseFromString(stackup.bottom.svg, 'image/svg+xml');
    const bottomsvg = bottomxmlDoc.documentElement;

    const newTopSvg = modifiedSvg({ svg: topsvg, id: 'toplayer', viewbox: stackup.top.viewBox, width: stackup.top.width, height: stackup.top.height,})
    const newBottomSvg = modifiedSvg({ svg: bottomsvg, id: 'bottomlayer', viewbox: stackup.bottom.viewBox, width: stackup.bottom.width, height: stackup.bottom.height})

    const fullStackSvg = buildFullStackSvg({
        topSvg: new DOMParser().parseFromString(stackup.top.svg, 'image/svg+xml').documentElement,
        bottomSvg: new DOMParser().parseFromString(stackup.bottom.svg, 'image/svg+xml').documentElement,
    })
    const newFullStackSvg = modifiedSvg({ svg: fullStackSvg, id: 'fullstack', viewbox: stackup.top.viewBox, width: stackup.top.width, height: stackup.top.height})

    setStackConfig({ 
        viewbox: {
            viewboxX: stackup.top.viewBox[0], 
            viewboxY: stackup.top.viewBox[1], 
            viewboxW: stackup.top.viewBox[2], 
            viewboxH: stackup.top.viewBox[3] 
        }, 
        width: Math.round(stackup.top.width * 100) / 100, 
        height: Math.round(stackup.top.height * 100) / 100})

    setFullLayers(newFullStackSvg)
    setTopStack({id: stackup.id, svg: newTopSvg})
    setBottomStack({id: stackup.id, svg: newBottomSvg})
    setMainSvg({id: 'top_layer', svg: newTopSvg});
}


// -------------------------
// Internal helper functions
// -------------------------
async function stackupFromFiles(filesList) {
    return Promise.all(
        Array.from(filesList).map(file => {
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
            reader.onload = ({ target: { result: fileContent } }) =>
                resolve({ filename: file.name, gerber: fileContent });
            reader.onerror = error => reject(error);
            reader.readAsText(file);
            });
        })
    )
    // eslint-disable-next-line no-undef
    .then(layers => pcbStackup(layers, { maskWithOutline: false, outlineGapFill: 0.011 }))
    .catch(error => console.error(error));
}


function buildFullStackSvg({ topSvg, bottomSvg }) {
    const namespacedTopSvg = namespaceSvgTree(topSvg.cloneNode(true), 'full-top');
    const namespacedBottomSvg = namespaceSvgTree(bottomSvg.cloneNode(true), 'full-bottom');
    const fullLayerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    copyAttributes(namespacedTopSvg, fullLayerSvg);

    const fullLayerDef = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const fullLayerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    appendDefs(fullLayerDef, getDirectChildByTagName(namespacedTopSvg, 'defs'));
    appendDefs(fullLayerDef, getDirectChildByTagName(namespacedBottomSvg, 'defs'));

    const topRootGroup = buildLayerGroup(
        getDirectChildByTagName(namespacedTopSvg, 'g'),
        (id) => !id.includes('bottom_')
    );
    const bottomRootGroup = buildLayerGroup(
        getDirectChildByTagName(namespacedBottomSvg, 'g'),
        (id) => id.includes('bottom_')
    );

    if (topRootGroup) {
        topRootGroup.classList.add('fullstack-top-layer');
        fullLayerG.appendChild(topRootGroup);
    }
    if (bottomRootGroup) {
        bottomRootGroup.classList.add('fullstack-bottom-layer');
        fullLayerG.appendChild(bottomRootGroup);
    }

    appendFullLayerStyles(fullLayerDef);

    fullLayerSvg.appendChild(fullLayerDef);
    fullLayerSvg.appendChild(fullLayerG);

    return fullLayerSvg
}

function copyAttributes(source, target) {
    Array.from(source.attributes).forEach(({ name, value }) => {
        target.setAttribute(name, value);
    });
}

function getDirectChildByTagName(node, tagName) {
    return Array.from(node.children).find((child) => child.tagName.toLowerCase() === tagName) || null;
}

function appendDefs(targetDefs, sourceDefs) {
    if (!sourceDefs) return;

    Array.from(sourceDefs.children).forEach((child) => {
        targetDefs.appendChild(child.cloneNode(true));
    });
}

function buildLayerGroup(rootGroup, shouldKeep) {
    if (!rootGroup) return null;

    const clonedRoot = rootGroup.cloneNode(true);
    clonedRoot.querySelectorAll('g[id]').forEach((child) => {
        const childId = child.getAttribute('id') || '';
        if (!shouldKeep(childId)) {
            child.remove();
        }
    });

    return clonedRoot;
}

function namespaceSvgTree(svg, prefix) {
    const idMap = new Map();
    const classMap = new Map();

    svg.querySelectorAll('[id]').forEach((element) => {
        const previousId = element.getAttribute('id');
        const nextId = `${prefix}-${previousId}`;
        idMap.set(previousId, nextId);
        element.setAttribute('id', nextId);
    });

    svg.querySelectorAll('[class]').forEach((element) => {
        const previousClasses = element.getAttribute('class').split(/\s+/).filter(Boolean);
        const nextClasses = previousClasses.map((className) => {
            if (!classMap.has(className)) {
                classMap.set(className, `${prefix}-${className}`);
            }
            return classMap.get(className);
        });
        element.setAttribute('class', nextClasses.join(' '));
    });

    svg.querySelectorAll('style').forEach((styleElement) => {
        let nextStyle = styleElement.textContent;
        Array.from(classMap.entries())
            .sort((a, b) => b[0].length - a[0].length)
            .forEach(([previousClass, nextClass]) => {
                nextStyle = nextStyle.replaceAll(`.${previousClass}`, `.${nextClass}`);
            });
        styleElement.textContent = nextStyle;
    });

    svg.querySelectorAll('*').forEach((element) => {
        Array.from(element.attributes).forEach(({ name, value }) => {
            let nextValue = value;

            idMap.forEach((nextId, previousId) => {
                nextValue = nextValue.replaceAll(`url(#${previousId})`, `url(#${nextId})`);
                if ((name === 'href' || name === 'xlink:href') && nextValue === `#${previousId}`) {
                    nextValue = `#${nextId}`;
                }
            });

            if (nextValue !== value) {
                element.setAttribute(name, nextValue);
            }
        });
    });

    return svg;
}

function appendFullLayerStyles(defs) {
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
        .fullstack-top-layer [class*="_fr4"],
        .fullstack-bottom-layer [class*="_fr4"] { display: none !important; }

        .fullstack-top-layer [class*="_cu"] {
            color: #d3346e !important;
            opacity: 0.48 !important;
        }

        .fullstack-bottom-layer [class*="_cu"] {
            color: #0f9f73 !important;
            opacity: 0.48 !important;
        }

        .fullstack-top-layer [class*="_cf"] {
            color: #f59e0b !important;
            opacity: 0.38 !important;
        }

        .fullstack-bottom-layer [class*="_cf"] {
            color: #22c55e !important;
            opacity: 0.38 !important;
        }

        .fullstack-top-layer [class*="_sm"] {
            color: #f472b6 !important;
            opacity: 0.2 !important;
        }

        .fullstack-bottom-layer [class*="_sm"] {
            color: #38bdf8 !important;
            opacity: 0.2 !important;
        }

        .fullstack-top-layer [class*="_ss"] {
            color: #f8fafc !important;
            opacity: 0.88 !important;
        }

        .fullstack-bottom-layer [class*="_ss"] {
            color: #93c5fd !important;
            opacity: 0.88 !important;
        }

        .fullstack-top-layer [class*="_sp"] {
            color: #f9a8d4 !important;
            opacity: 0.55 !important;
        }

        .fullstack-bottom-layer [class*="_sp"] {
            color: #86efac !important;
            opacity: 0.55 !important;
        }

        .fullstack-top-layer [class*="_out"],
        .fullstack-bottom-layer [class*="_out"] {
            color: #ffffff !important;
            opacity: 0.7 !important;
        }
    `;
    defs.appendChild(style);
}


function modifiedSvg(props) {
    const { svg, id, viewbox, width, height } = props;
    const newSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const outerG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const mainG = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    if (id !== 'fullstack') {
        const Gs = svg.querySelectorAll('g');
        Gs.forEach((g) => {
            if (g.hasAttribute('id')) {
                if (g.getAttribute('id').includes('soldermask')) {
                    g.style.display = g.style.display === 'none' ? 'block' : 'none';    
                }
            }
        })
    }

    svg.style.setProperty('shape-rendering', 'crispEdges');

    const clipPath = svg.querySelector('clipPath');
    if (clipPath) {
        const d = clipPath.querySelector('path').getAttribute('d');

        const outlineG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('shape-rendering', 'crispEdges');
        path.setAttribute('stroke', '#ffffff');
        path.setAttribute('stroke-width', '1rem');
        outlineG.setAttribute('id', 'drillMask');

        const cx = viewbox[0] + viewbox[2] / 2;
        const cy = viewbox[1] + viewbox[3] / 2;
        const scale = id === 'bottomlayer' ? '-1 -1' : '1 -1'

        const flipY = `translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})`;
        outlineG.setAttribute('transform', flipY);

        outlineG.appendChild(path);

        svg.insertBefore(outlineG, svg.firstChild);
    }

    const outer = generateOuterSvg(width, height, 0.0, { viewboxX: viewbox[0], viewboxY: viewbox[1]}, id === 'bottomlayer');

    outer.svg.setAttribute('id', `${id}outer-svg`);
    outerG.setAttribute('id', `${id}outer`);
    outerG.setAttribute('style', `display: none; fill: ${ id === 'fullstack' ? '#3c94d930' : '#1a4c1a'}`);

    newSvg.setAttribute('id', `${id}`);
    newSvg.setAttribute('width', `${outer.width}mm`);
    newSvg.setAttribute('height', `${outer.height}mm`);

    svg.setAttribute('id', `${id}svg`);
    // mainG.appendChild(svg);
    mainG.setAttribute('id', `${id}MainG`);
    mainG.setAttribute('transform', 'translate(0, 0)');

    outerG.appendChild(outer.svg);
    mainG.appendChild(svg);
    newSvg.appendChild(outerG);
    newSvg.appendChild(mainG);
    
    return newSvg
}
