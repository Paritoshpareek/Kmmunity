import { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import { BlogContext } from "../pages/BlogPage";
import axios from "axios";
import AnimationWrapper from "../common/page-animation";



const CommentFeild = ({ action, index = undefined, replyingTo = undefined, setIsReplying }) => {

    let { blog, blog: { _id, author: { _id: blog_author }, comments, comments: { results: commentsArr }, activity, activity: { total_comments, total_parent_comments } }, setBlog, setTotalParentCommentsLoaded } = useContext(BlogContext)

    let { userAuth: { access_token, username, fullname, profile_img } } = useContext(UserContext);
    const [comment, setComment] = useState("");

    const handleComment = () => {
        if (!access_token) {
            return toast.error("Your voice matters! Log in to join the discussion.  🔐🚀")
        }
        if (!comment.length) {
            return toast.error("🧐 Blank comment field? We're eagerly waiting to hear from you! ✍️🌟 ")
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {
            _id, blog_author, comment, replying_to: replyingTo
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(({ data }) => {


                setComment("");
                //Redefining data

                data.commented_by = { personal_info: { username, fullname, profile_img } }

                let newCommentArr;

                if (replyingTo) {

                    commentsArr[index].children.push(data._id);

                    data.childrenLevel = commentsArr[index].childrenLevel + 1;
                    data.parentIndex = index;
                    commentsArr[index].isReplyLoaded = true;

                    commentsArr.splice(index + 1, 0, data);

                    newCommentArr = commentsArr
                    setIsReplying(false);

                } else {
                    //to calculat reply to the reply(nested comment)
                    data.childrenLevel = 0;

                    newCommentArr = [data, ...commentsArr];

                }

                let parentCommentIncrementVal = replyingTo ? 0 : 1;

                setBlog({ ...blog, comments: { ...comments, results: newCommentArr }, activity: { ...activity, total_comments: total_comments + 1, total_parent_comments: total_parent_comments + parentCommentIncrementVal } })

                setTotalParentCommentsLoaded(preVal => preVal + parentCommentIncrementVal)

            })
            .catch(err => {
                console.log(err)
            })
    }

    return (
        <>
            <Toaster />

            <AnimationWrapper transition={{ duration: 1, delay: 1 * .1 }} >
                <textarea value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="What are your thoughts?"
                    className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto">
                </textarea>
                <button className="btn-dark mt-5 px-10"
                    onClick={handleComment}>{action}</button>
            </AnimationWrapper>
        </>
    )

}
export default CommentFeild;