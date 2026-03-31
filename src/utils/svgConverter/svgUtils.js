import generateOuterSvg from "./generateOuter";

export const updateToolWidth = (svgs, width, stackConfig, correction = 0) => {
    const toolwidth = parseFloat(width);
    let dimension = null

    svgs.forEach(({stack, name}) => {
        const outer = stack.svg.querySelector(`#${name}outer`);
        const main = stack.svg.querySelector(`#${name}MainG`);

        const newOuter = generateOuterSvg(stackConfig.width, stackConfig.height, toolwidth, { viewboxX: stackConfig.viewbox.viewboxX, viewboxY: stackConfig.viewbox.viewboxY }, name === 'bottomlayer');
        newOuter.svg.setAttribute('id', `${name}outer-svg`);
        stack.svg.setAttribute('width', `${newOuter.width}mm`);
        stack.svg.setAttribute('height', `${newOuter.height}mm`);
        outer.querySelector('svg').replaceWith(newOuter.svg);
        const offset = toolwidth === 0 ? 0 : correction;
        main.setAttribute('transform', `translate(${offset} ${offset})`);
        
        dimension = { width: newOuter.width, height: newOuter.height }
    })

    return dimension
}

export const updateSvg = (svg, option, setup, machine = 'general', topstack, doubleSide) => {
    const [, gerberSvg] = svg.querySelectorAll('svg');

    gerberSvg.querySelectorAll('g').forEach(g => {    
        if (g.hasAttribute('id')) {
            const id = g.getAttribute('id');
            g.style.display = id.includes(setup.layerid) ? 'block' : id.includes(setup.stack.id) ? 'none' : id.includes('drillMask') ? 'none' : '';

            if (option.includes('outline') && machine === 'carvera') {
                g.style.display = id.includes('drill') ? doubleSide && option === 'bottom-outline' ? 'none' : 'block' : g.style.display;
            }
        }
    })


    const clipPath = gerberSvg.querySelector('clipPath');
    if (clipPath) clipPath.style.display = setup.layerid === 'outline' ? option === 'top-outline' && doubleSide ? 'none' : 'block' : 'none';

    const outerG = svg.querySelector(`#${ setup.stack === topstack ? 'toplayer': 'bottomlayer' }outer`);
    outerG.style.display = option === 'top-outline' ? doubleSide ? 'block' : 'none' : 'none';


}
