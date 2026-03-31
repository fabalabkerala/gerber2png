export const getLayerGroups = (layertype, topstack, bottomstack, fullLayers) => {
    switch (layertype) {
        case 'toplayer':
            return [topstack.svg.querySelectorAll('g'), fullLayers.querySelectorAll('g')];
        case 'bottomlayer': 
            return [bottomstack.svg.querySelectorAll('g'), fullLayers.querySelectorAll('g')];
        default:
            return [topstack.svg.querySelectorAll('g'), bottomstack.svg.querySelectorAll('g'), fullLayers.querySelectorAll('g')];
    }
}

export const toggleLayerVisibility = (layerGroups, layerId, isVisible) => {
    layerGroups.forEach(group => {
        group.forEach(layer => {
            if (layer.hasAttribute('id') && layer.getAttribute('id').includes(layerId)) {
                layer.style.display = isVisible ? 'block' : 'none';
            }
        });
    });
}

export const handleOutlineVisibility = (stacks, isVisible) => {
    stacks.forEach(stack => {
        const clipPath = stack.svg.querySelector('clipPath');
        if (clipPath) {
            clipPath.style.display = isVisible ? 'block' : 'none';
        }
    });
};