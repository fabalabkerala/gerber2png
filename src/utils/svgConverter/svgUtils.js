import generateOuterSvg from "./generateOuter";

export const updateToolWidth = (svgs, width, stackConfig) => {
    const toolwidth = parseFloat(width);

    svgs.forEach(({stack, name}) => {
        const outer = stack.svg.querySelector(`#${name}outer`);
        const main = stack.svg.querySelector(`#${name}MainG`);

        const newOuter = generateOuterSvg(stackConfig.width, stackConfig.height, toolwidth, { viewboxX: stackConfig.viewbox.viewboxX, viewboxY: stackConfig.viewbox.viewboxY }, name === 'bottomlayer');
        newOuter.svg.setAttribute('id', `${name}outer-svg`);
        stack.svg.setAttribute('width', `${newOuter.width}mm`);
        stack.svg.setAttribute('height', `${newOuter.height}mm`);
        outer.querySelector('svg').replaceWith(newOuter.svg);
        main.setAttribute('transform', `translate(${ toolwidth === 0 ? 0 : 3 } ${ toolwidth === 0 ? 0 : 3 })`);
    })
}

export const updateSvg = (svg, option, setup, machine = 'general', topstack, doubleSide) => {
    const [, gerberSvg] = svg.querySelectorAll('svg');

    gerberSvg.querySelectorAll('g').forEach(g => {    
        if (g.hasAttribute('id')) {
            const id = g.getAttribute('id');
            g.style.display = id.includes(setup.layerid) ? 'block' : id.includes(setup.stack.id) ? 'none' : id.includes('drillMask') ? 'none' : '';

            if (option === 'top-cut' && machine === 'carvera') {
                g.style.display = id.includes('drill') ? 'block' : g.style.display;
            }
        }
    })

    const clipPath = gerberSvg.querySelector('clipPath');
    if (clipPath) clipPath.style.display = setup.layerid === 'outline' ? 'block' : 'none';

    const outerG = svg.querySelector(`#${ setup.stack === topstack ? 'toplayer': 'bottomlayer' }outer`);
    outerG.style.display = option === 'top-cut' ? doubleSide ? 'block' : 'none' : 'none';


}