import { useParams } from "react-router-dom";
import InPageNavigation from "../components/InPageNavigation";
import { activeTabRef } from "../components/InPageNavigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "../components/LoaderComponent";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/BlogPostComponent";
import NoDataComponent from "../components/NoDataComponent";
import LoadMoreDataBtn from "../components/LoadMoreComponent";
import { filterPaginationData } from "../common/filter-pagination-data";
import UserCard from "../components/UserCardComponent";

const SearchPage = () => {
    let { query } = useParams()
    let [blogs, setBlogs] = useState(null);
    let [users, setUsers] = useState(null);

    const searchBlogs = ({ page = 1, create_new_arr = false }) => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { query, page })
            .then(async ({ data }) => {

                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/search-blogs-count",
                    data_to_send: { query },
                    create_new_arr
                })

                setBlogs(formatedData);
            })
            .catch(err => {
                console.log(err);
            })
    }
    const resetState = () => {
        setBlogs(null);
        setUsers(null);

    }


    const fetchUsers = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
            .then(({ data: { users } }) => {
                setUsers(users);
            })
    }

    useEffect(() => {
        resetState();
        activeTabRef.current.click();
        searchBlogs({ page: 1, create_new_arr: true });
        fetchUsers();
    }, [query])

    const UserCardWrapper = () => {
        return (
            <>
                {
                    users == null ? <Loader /> :
                        users.length ? users.map((user, i) => {
                            return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                                <UserCard user={user} />
                            </AnimationWrapper>
                        })
                            : <NoDataComponent message="No user found" />
                }
            </>
        )
    }


    return (
        <section className="h-cover flex justify-center gap-10 ">
            <div className="w-full">
                <InPageNavigation routes={[`Search results for "${query}"`, "Accounts Matched"]} defaultHidden={["Accounts Matched"]} >
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

                        <LoadMoreDataBtn state={blogs} fetchDataFun={searchBlogs} />

                    </>
                    {/* usercard  */}
                    <UserCardWrapper />


                </InPageNavigation>
            </div>

            <div className="min-w-[40%] lg:min-w-[350px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
                <h1 className="font-medium text-xl mb-8 ">User related to search <i className="fi fi-rr-user mt-1"></i></h1>
                <UserCardWrapper />
            </div>

        </section>
    )
}
export default SearchPage;