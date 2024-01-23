
import { Link } from "react-router-dom"
import lightFullLogo from "../imgs/full-logo-light.png";
import darkFullLogo from "../imgs/full-logo-dark.png";
import lightPageNotFound from "../imgs/404-light.png";
import darkPageNotFound from "../imgs/404-dark.png";
import { useContext } from "react";
import { ThemeContext } from "../App";

const PageNotFound = () => {

    let { theme } = useContext(ThemeContext);
    return (
        <section className="h-cover relative flex flex-col items-center gap-20  ">

            <img src={theme == 'light' ? darkPageNotFound : lightPageNotFound} className="select-none  border-grey w-72 aspect-square object-cover rounded " />
            <h1 className="text-4xl font-gelasio leading-7">Page Not Found</h1>
            <p className="text-dark-grey text-xl leading-7 -mt-8  ">You can find (just about) anything on Kommunity apparently, even a page that doesn’t exist. It's been a while since we've been <Link to="/" className="text-black underline text-xl  ">Home </Link> </p>
            <div className="mt-auto ">
                <img src={theme == 'light' ? darkFullLogo : lightFullLogo} className="h-8 object-contain block  mx-auto select-none" />
                <p className="mt-5 text-dark-grey">Read Millions of stories around the world</p>
            </div>
        </section>
    )
}
export default PageNotFound;