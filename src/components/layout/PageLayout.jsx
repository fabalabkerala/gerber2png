import PropTypes from 'prop-types';

export const  PageLayout = ({ sidebar, main, right }) => {
    return (
        <>
            <div className="h-full flex flex-col md:flex-row bg-[#EBEBEB] md:overflow-hidden">
                <aside className="w-full md:w-1/6 h-48 md:h-full min-w-[300px] py-3 ps-3 pe-0.5 md:overflow-y-auto custom-scrollbar">{sidebar}</aside>
                <main className="flex-1 h-full p-3 relative">{main}</main>
                <aside className="w-full md:w-1/6 h-48 md:h-full min-w-[300px] py-3 pe-3 ps-0.5 md:overflow-y-auto custom-scrollbar">{right}</aside>
            </div>
        </>
    )
}

PageLayout.propTypes ={
    sidebar: PropTypes.node.isRequired,
    main: PropTypes.node.isRequired,
    right: PropTypes.node
}
