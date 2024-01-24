import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/LoaderComponent";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import BlogInteraction from "../components/BlogInteractionComponent";
import { createContext } from "react";
import BlogPostCard from "../components/BlogPostComponent";
import BlogContent from "../components/BlogContentComponent";
import CommentsContainer, { fetchComments } from "../components/CommentsComponent";

export const blogStructure = {
    title: "",
    des: "",
    content: [],
    author: { personal_info: {} },
    banner: '',
    publishedAt: '',
    minutesRead: ""

}
export const BlogContext = createContext({});

const BlogPage = () => {

    let { blog_id } = useParams();

    const [blog, setBlog] = useState(blogStructure);
    const [loading, setLoading] = useState(true);
    const [similarBlogs, setSimilarBlogs] = useState(null);
    const [isLikedByUser, setIsLikedByUser] = useState(false);
    const [commentsWrapper, setCommentsWrapper] = useState(false);
    const [totalParentCommentsLoaded, setTotalParentCommentsLoaded] = useState(0);

    let { title, content, banner, author: { personal_info: { fullname, username: author_username, profile_img } }, publishedAt, minutesRead } = blog;

    const fetchBlog = () => {
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
            .then(async ({ data: { blog } }) => {

                blog.comments = await fetchComments({ blog_id: blog._id, setParentCommentCountFun: setTotalParentCommentsLoaded })


                setBlog(blog)

                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: blog.tags[0], limit: 6, eliminate_blog: blog_id })
                    .then(({ data }) => {
                        setSimilarBlogs(data.blogs);

                    })

                setLoading(false);
            })
            .catch(err => {

                setLoading(false)
            })
    }



    const resetStates = () => {
        setBlog(blogStructure);
        setSimilarBlogs(null);
        setLoading(true);
        setIsLikedByUser(false);
        setCommentsWrapper(false);
        setTotalParentCommentsLoaded(0);
    }
    useEffect(() => {
        resetStates();
        fetchBlog();
    }, [blog_id])

    return (
        <AnimationWrapper>
            {
                loading ? <Loader /> :
                    <BlogContext.Provider value={{ blog, setBlog, isLikedByUser, setIsLikedByUser, commentsWrapper, setCommentsWrapper, totalParentCommentsLoaded, setTotalParentCommentsLoaded }}>
                        <CommentsContainer />
                        <div className="max-w-[900px] center  py-10 max-lg:px-[5vw}">
                            <img
                                src={banner} alt="image" className="aspect-video  object-scale-down" />
                            <div className="mt-12">
                                <h2>{title}</h2>
                                <div className="flex max-sm:flex-col justify-between my-8  ">
                                    <div className="flex gap-5 items-start ">
                                        <img src={profile_img} alt="user_img" className="w-12 h-12 rounded-full " />
                                        <p className="capitalize ">
                                            {fullname}
                                            <br />
                                            @
                                            <Link to={`/user/${author_username}`} className="underline">{author_username}</Link>
                                        </p>
                                    </div>
                                    <p className="text-dark-grey opacity-75 max-sm:mt-6  max-sm:ml-12 max-sm:pl-5">Published on {getDay(publishedAt)}</p>
                                </div>
                            </div>
                            <BlogInteraction />
                            {/* blog content */}

                            <div className="my-12 font-gelasio blog-page-content" >
                                {
                                    content[0].blocks.map((block, i) => {
                                        return <div key={i} className="my-4 md:my-8 ">
                                            <BlogContent block={block} />
                                        </div>
                                    })
                                }

                            </div>

                            <BlogInteraction />
                            {/* similar blog */}
                            {
                                similarBlogs != null && similarBlogs.length ? <>
                                    <h1 className="text-2xl mt-14 mb-10 font-medium">Similar Blogs</h1>
                                    {
                                        similarBlogs.map((blog, i) => {
                                            let { author: { personal_info } } = blog;
                                            return <AnimationWrapper key={i} transition={{ duration: 1, delay: i * 0.08 }}>
                                                <BlogPostCard content={blog} author={personal_info} />

                                            </AnimationWrapper>
                                        })
                                    }
                                </>
                                    : " "
                            }

                        </div>
                    </BlogContext.Provider>

            }
        </AnimationWrapper>
    )
}
export default BlogPage;