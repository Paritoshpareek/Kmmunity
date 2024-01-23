import { useEffect, useRef, useState } from "react";
export let activeTabLineRef;
export let activeTabRef;

const InPageNavigation = ({ routes, defaultHidden = [], defaultActiveIndex = 0, children }) => {

    activeTabLineRef = useRef();
    activeTabRef = useRef();
    let [inPageNavIndex, setInPageNavIndex] = useState(null);

    let [isresizeEvent, setIsResizeEvent] = useState(false);

    let [width, setWidth] = useState(window.innerWidth);

    const changePageState = (btn, i) => {

        let { offsetWidth, offsetLeft } = btn;
        activeTabLineRef.current.style.width = offsetWidth + "px";
        activeTabLineRef.current.style.left = offsetLeft + "px";
        setInPageNavIndex(i);
    }

    useEffect(() => {
        if (width > 767 && inPageNavIndex != defaultActiveIndex) {
            changePageState(activeTabRef.current, defaultActiveIndex)
        }

        if (!isresizeEvent) {
            window.addEventListener('resize', () => {
                if (!isresizeEvent) {
                    setIsResizeEvent(true);
                }
                setWidth(window.innerWidth)

            })
        }

    }, [width])


    return (
        <>
            <div className="relative mb-8 bg-white border-b border-grey flex flex-nowrap overflow-x-auto">
                {
                    routes.map((route, i) => {
                        return (
                            <button
                                ref={i == defaultActiveIndex ? activeTabRef : null}
                                key={i} className={"p-4 px-5 capitalize " + (inPageNavIndex == i ? "text-black font-medium text-lg " : "text-dark-grey ") + (defaultHidden.includes(route) ? " md:hidden " : " ")}
                                onClick={(e) => { changePageState(e.target, i) }}
                            >
                                {route}
                            </button>
                        )
                    })
                }
                <hr ref={activeTabLineRef} className="absolute bottom-0 duration-400 border-dark-grey " />
            </div>

            {Array.isArray(children) ? children[inPageNavIndex] : children}
        </>
    )
}
export default InPageNavigation;