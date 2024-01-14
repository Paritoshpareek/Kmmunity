import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/InPageNavigation";
import axios from "axios";
import Loader from "../components/LoaderComponent"
import BlogPostCard from "../components/BlogPostComponent";
import MinimalBlogPost from "../components/NoBannerBlogPostComponent";
import { activeTabRef } from "../components/InPageNavigation";
import NoDataComponent from "../components/NoDataComponent";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/LoadMoreComponent";


const HomePage = () => {

    let [blogs, setBlogs] = useState(null);
    let [trendingblogs, setTrendingBlogs] = useState(null);
    let [pageState, setPageState] = useState("home");

    let categories = [
        "programming", "film making", "tech", "developement", "fitness and health", "fashion", "finance and investing", "entertainment", "food and cooking", "social media", "travel", "lifestyle"
    ];


    const fetchLatestBlogs = ({ page = 1 }) => {

        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
            .then(async ({ data }) => {

                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/all-latest-blogs-count"
                })
                console.log(formatedData)
                setBlogs(formatedData);
            })
            .catch(err => {
                console.log(err);
            })
    };

    const fetchBlogsByCategory = ({ page = 1 }) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: pageState, page })
            .then(async ({ data }) => {

                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/search-blogs-count",
                    data_to_send: { tag: pageState }
                })
                setBlogs(formatedData);;
            })
            .catch(err => {
                console.log(err);
            })
    }

    const fetchTrendingBlogs = () => {
        axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
            .then(({ data }) => {
                setTrendingBlogs(data.blogs);
            })
            .catch(err => {
                console.log(err);
            })
    }

    const loadBlogByCategory = (e) => {
        let category = e.target.innerText.toLowerCase();
        setBlogs(null);
        if (pageState == category) {
            setPageState("home");
            return;
        }
        setPageState(category);
    }


    // use effect 
    useEffect(() => {
        activeTabRef.current.click();
        if (pageState == "home") {
            fetchLatestBlogs({ page: 1 });
        } else {
            fetchBlogsByCategory({ page: 1 });
        }
        if (trendingblogs == null) {
            fetchTrendingBlogs();
        }

        // virtually clicking on home feild to update the hr  element in case pagestate gets updated (using activetabref)so we will run useeffect whenever pagestate chages but will not run fetchlatest and fetctrending blog 

    }, [pageState])
    return (
        <AnimationWrapper>
            <section className="h-cover flex justify-center gap-10">
                {/* latest blogs */}
                <div className="w-full">
                    <InPageNavigation routes={[pageState, "ternding blogs"]} defaultHidden={["ternding blogs"]}>
                        <>
                            {
                                blogs == null ? (<Loader />)
                                    : (
                                        blogs.results.length ?
                                            blogs.results.map((blog, i) => {
                                                return (<AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                                    <BlogPostCard content={blog} author={blog.author.personal_info} />
                                                </AnimationWrapper>);
                                            })
                                            : <NoDataComponent message="No Blogs Published" />
                                    )

                            }
                            <LoadMoreDataBtn state={blogs} fetchDataFun={(pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory)} />


                        </>
                        {/* trending blogs */}
                        {
                            (trendingblogs == null ? (<Loader />)
                                : trendingblogs.length ?
                                    (trendingblogs.map((blog, i) => {
                                        return <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                            <MinimalBlogPost blog={blog} index={i} />
                                        </AnimationWrapper>
                                    }))
                                    : <NoDataComponent message="No trending blogs" />
                            )
                        }

                    </InPageNavigation>
                </div>

                {/* filtes and treding */}

                <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden ">

                    {/* stories and tags button  */}
                    <div className="flex flex-col gap-10 ">
                        <div>
                            <h1 className="font-medium text-xl mb-8 ">Stories from all interests</h1>
                            {/* filters */}

                            <div className="flex gap-3 flex-wrap">
                                {
                                    categories.map((category, i) => {
                                        return <button
                                            onClick={loadBlogByCategory} className={"tag " + (pageState == category ? " bg-black text-white transition-all duration-300" : " ")} key={i}>{category}</button>
                                    })
                                }
                            </div>
                        </div>

                        {/* trending blogs */}
                        <div>
                            <h1 className="font-medium text-xl mb-8 ">Trending <i className="fi fi-rr-arrow-trend-up"></i> </h1>
                            {
                                trendingblogs == null ? (<Loader />)
                                    :
                                    (
                                        trendingblogs.length ?
                                            (trendingblogs.map((blog, i) => {
                                                return <AnimationWrapper transition={{ duration: 1, delay: i * .1 }} key={i}>
                                                    <MinimalBlogPost blog={blog} index={i} />
                                                </AnimationWrapper>
                                            })
                                            )
                                            : (<NoDataComponent message="No trending blogs" />)
                                    )
                            }
                        </div>
                    </div>
                </div>

            </section>
        </AnimationWrapper>
    );
};
export default HomePage;