import { useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const MainView = () => {
    const resultRef = useRef(null)

    const transitionStyle = {
        transition: 'opacity 0.3s ease-in-out',
        // opacity: isAnimating ? 0 : 1,
    };
    return (
        <>
            <TransformWrapper initialScale={1} minScale={.5} limitToBounds={ false }>
                <TransformComponent
                    contentStyle={{  margin:'auto', transition: 'transform 0.3s ease' }} 
                    wrapperStyle={{ width: '100%', height: '100%', overflow:'visible', display:'flex'}} 
                >
                    <div ref={ resultRef } style={transitionStyle} className="flex items-center h-full justify-center">dasdfasdf</div>
                </TransformComponent>
            </TransformWrapper>
        </>
    )
}
export default MainView;