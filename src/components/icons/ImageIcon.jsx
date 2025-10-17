import PropTypes from 'prop-types';

const ImageIcon = (props) => (
    <svg
        width={100}
        height={100}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
        d="M79.1667 12.5H20.8333C16.231 12.5 12.5 16.231 12.5 20.8333V79.1667C12.5 83.769 16.231 87.5 20.8333 87.5H79.1667C83.769 87.5 87.5 83.769 87.5 79.1667V20.8333C87.5 16.231 83.769 12.5 79.1667 12.5Z"
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        />
        <path
        d="M37.5 45.8337C42.1023 45.8337 45.8333 42.1027 45.8333 37.5003C45.8333 32.898 42.1023 29.167 37.5 29.167C32.8976 29.167 29.1666 32.898 29.1666 37.5003C29.1666 42.1027 32.8976 45.8337 37.5 45.8337Z"
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        />
        <path
        d="M87.5 62.5004L74.6417 49.642C73.0789 48.0798 70.9597 47.2021 68.75 47.2021C66.5403 47.2021 64.4211 48.0798 62.8583 49.642L25 87.5004"
        stroke={props.color}
        strokeLinecap="round"
        strokeLinejoin="round"
        />
    </svg>
);

ImageIcon.propTypes = {
    color: PropTypes.string
}
ImageIcon.defaultPropTypes = {
    color: 'black'
}

export default ImageIcon;