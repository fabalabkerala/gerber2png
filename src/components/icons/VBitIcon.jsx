/* eslint-disable react/prop-types */

const VBitIcon = (props) => (
  <svg
    width={104}
    height={69}
    viewBox="0 0 104 69"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <mask id="path-1-inside-1_179_129" fill="white">
      <path d="M0 58H104V69H0V58Z" />
    </mask>
    <path d="M0 58H104V69H0V58Z" fill="url(#pattern0_179_129)" />
    <path
      d="M0 58V60H104V58V56H0V58Z"
      fill="#E6A0A0"
      mask="url(#path-1-inside-1_179_129)"
    />
    { props.angle === 30 && 
      <path
        d="M51.2549 59.5L49.6914 54.0752L45.9414 41.0557L38.5 15.2207V3.5H65.5V15.2207L58.0586 41.0557L54.3086 54.0752L52.7471 59.5H51.2549Z"
        fill="#4D8BD3"
        stroke="#4D8BD3"
        strokeWidth={3}
      />
    }

    { props.angle === 60  && 
      <path
        d="M50.9229 59.5L28.5 15.0752L28.5 3.5H75.5V15.0752L53.0771 59.5H50.9229Z"
        fill="#4D8BD3"
        stroke="#4D8BD3"
        strokeWidth={3}
      />
    }

    { props.angle === 90 && 
      <path
        d="M49.7139 59.498L13.5 14.9004V3.5L90.5 3.5V14.8965L54.0791 59.498H49.7139Z"
        fill="#4D8BD3"
        stroke="#4D8BD3"
        strokeWidth={3}
      />
    }

    <defs>
      <pattern
        id="pattern0_179_129"
        patternUnits="userSpaceOnUse"
        patternTransform="matrix(12.7633 0 0 25.5266 -0.410078 57.5897)"
        preserveAspectRatio="none"
        viewBox="-0.707031 -0.707388 22.0057 44.0114"
        width={1}
        height={1}
      >
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(-66.017 -44.0114)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(-44.0114 -44.0114)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(-22.0057 -44.0114)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(0 -44.0114)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(-55.0142 -22.0057)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(-33.0085 -22.0057)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(-11.0028 -22.0057)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(11.0028 -22.0057)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(-66.017 0)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(-44.0114 0)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(-22.0057 0)"
        />
        <g id="pattern0_179_129_inner">
          <line
            x1={-0.353553}
            y1={43.6578}
            x2={43.6578}
            y2={-0.353553}
            stroke="#E6A0A0"
          />
        </g>
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(-55.0142 22.0057)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(-33.0085 22.0057)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(-11.0028 22.0057)"
        />
        <use
          xlinkHref="#pattern0_179_129_inner"
          transform="translate(11.0028 22.0057)"
        />
      </pattern>
    </defs>
  </svg>
);
export default VBitIcon;
