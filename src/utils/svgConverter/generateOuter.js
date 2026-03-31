
export default function generateOuterSvg(width, height, toolwidth , viewbox, flipped = true) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const originX = viewbox.viewboxX;
    const originY = viewbox.viewboxY;
    // svg_outer_width = width + 2 * toolwidth;
    // svg_outer_height = height + 2 * toolwidth;
  
    // Generate Outer SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `${originX - toolwidth} ${originY - toolwidth} ${width + 2 * toolwidth} ${height + 2 * toolwidth}`);
    svg.setAttribute('width', `${width + 2 * toolwidth}mm`);
    svg.setAttribute('height', `${height + 2 * toolwidth}mm`);
  
    const pathlines =   `
    M ${ originX } ${ originY }
    L ${ originX + halfWidth +  2 * toolwidth } ${ originY }
    L ${ originX + halfWidth +  2 * toolwidth } ${ originY - toolwidth }
    L ${ originX + width } ${ originY - toolwidth }
    L ${ originX + width + toolwidth } ${ originY }
    L ${ originX + width + toolwidth } ${ originY + halfHeight + 2 * toolwidth }
    L ${ originX + width } ${ originY + halfHeight + 2 * toolwidth }
    L ${ originX + width } ${ originY + height }
    L ${ originX + halfWidth - 2 * toolwidth } ${ originY + height }
    L ${ originX + halfWidth - 2 * toolwidth } ${ originY + height + toolwidth }
    L ${ originX } ${ originY + height + toolwidth }
    L ${ originX - toolwidth } ${ originY + height }
    L ${ originX - toolwidth } ${ originY + halfHeight - 2 * toolwidth }
    L ${ originX } ${ originY + halfHeight - 2 * toolwidth }
    L ${ originX } ${ originY }
    Z`

    const flippedPathlines = `
    M ${originX + width} ${originY}
    L ${originX + width - halfWidth - 2 * toolwidth} ${originY}
    L ${originX + width - halfWidth - 2 * toolwidth} ${originY - toolwidth}
    L ${originX} ${originY - toolwidth}
    L ${originX - toolwidth} ${originY}
    L ${originX - toolwidth} ${originY + halfHeight + 2 * toolwidth}
    L ${originX} ${originY + halfHeight + 2 * toolwidth}
    L ${originX} ${originY + height}
    L ${originX + width - halfWidth + 2 * toolwidth} ${originY + height}
    L ${originX + width - halfWidth + 2 * toolwidth} ${originY + height + toolwidth}
    L ${originX + width} ${originY + height + toolwidth}
    L ${originX + width + toolwidth} ${originY + height}
    L ${originX + width + toolwidth} ${originY + halfHeight - 2 * toolwidth}
    L ${originX + width} ${originY + halfHeight - 2 * toolwidth}
    L ${originX + width} ${originY}
    Z`

  
    let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', flipped ? flippedPathlines : pathlines);


    svg.appendChild(path)
  
  
    let response = {
      svg : svg,
      width : width + 2 * toolwidth,
      height : height + 2 * toolwidth,
    }
    return response
}