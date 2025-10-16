import PropTypes from 'prop-types';

export const  PageLayout = ({ sidebar, main, right }) => {
    return (
        <>
            <div className="h-full flex flex-col md:flex-row border-4 border-red-200 bg-[#EBEBEB]">
                <aside className="w-full md:w-1/6 h-48 md:h-full border border-black py-3 ps-3">{sidebar}</aside>
                <main className="flex-1 h-full border border-black p-3">{main}</main>
                <aside className="w-full md:w-1/6 h-48 md:h-full border border-black p-3">{right}</aside>
            </div>
        </>
    )
}

PageLayout.propTypes ={
    sidebar: PropTypes.node.isRequired,
    main: PropTypes.node.isRequired,
    right: PropTypes.node
}
