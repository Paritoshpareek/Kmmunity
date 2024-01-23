import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/BlogPage";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {

    let { blog, blog: { _id, title, blog_id, activity, activity: { total_likes, total_comments }, author: { personal_info: { username: author_username } } }, setBlog, isLikedByUser, setIsLikedByUser, setCommentsWrapper } = useContext(BlogContext);

    let { userAuth: { username, access_token } } = useContext(UserContext);

    useEffect(() => {
        if (access_token) {
            //request server to get info about if blog liked earlier or not
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user", { _id, }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(({ data: { result } }) => {
                    setIsLikedByUser(Boolean(result))


                })
                .catch(err => {
                    console.log(err);
                })
        }
    }, [])

    const handleLike = () => {
        if (access_token) {
            setIsLikedByUser(preVal => !preVal)
            !isLikedByUser ? total_likes++ : total_likes--;

            setBlog({ ...blog, activity: { ...activity, total_likes } })

            // server request to increment like and notify 
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/like-blog", { _id, isLikedByUser }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
                .then(({ data }) => {
                })
                .catch(err => {
                    console.log(err)
                })
        }
        else {
            toast.error("Login to spread the love! ❤️🔐"
            )

        }

    }

    return (
        <>
            <Toaster />
            <hr className="border-grey my-2 " />
            <div className="flex gap-6 justify-between ">
                {/* icons */}
                <div className="flex gap-3 items-center">

                    <button className={"w-10 h-10 rounded-full flex items-center justify-center  transition-colors duration-200  " + (isLikedByUser ? "bg-red/50 text-red" : "bg-grey/80")}
                        onClick={handleLike}>

                        <i className={"fi " + (isLikedByUser ? "fi-sr-heart" : "fi-rr-heart")}></i>
                    </button>
                    <p className="text-xl text-dark-grey  ">{total_likes}</p>



                    <button
                        onClick={() => setCommentsWrapper(preval => !preval)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80 ">
                        <i className="fi fi-rr-comment-dots"></i>
                    </button>
                    <p className="text-xl text-black hover:text-dark-grey ">{total_comments}</p>

                </div>

                <div className="flex gap-6 items-center">
                    {
                        username == author_username ?
                            <Link to={`/editor/${blog_id}`} className="underline   text-dark-grey "><i className="fi fi-rr-file-edit text-xl hover:text-black"></i></Link> : ""
                    }

                    <Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}>
                        <i className="fi fi-brands-twitter-alt text-xl  hover:text-twitter"></i>
                    </Link>
                </div>

            </div>
            <hr className="border-grey my-2 " />
        </>
    )
}
export default BlogInteraction;