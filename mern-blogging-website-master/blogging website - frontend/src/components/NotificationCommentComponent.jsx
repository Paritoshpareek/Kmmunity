import { toast, Toaster } from "react-hot-toast";
import AnimationWrapper from "../common/page-animation";
import { useContext, useState } from "react";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCommentFeild = ({ _id, blog_author, index = undefined, replyingTo = undefined, setIsReplying, notification_id, notificationData }) => {

    let [comment, setComment] = useState('');

    let { _id: user_id } = blog_author;
    let { userAuth: { access_token } } = useContext(UserContext);
    let { notifications, notifications: { results }, setNotifications } = notificationData;


    const handleComment = () => {

        if (!comment.length) {
            return toast.error("🧐 Blank comment field? We're eagerly waiting to hear from you! ✍️🌟 ")
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/add-comment", {
            _id, blog_author: user_id, comment, replying_to: replyingTo, notification_id
        }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(({ data }) => {
                setIsReplying(false)
                results[index].reply = { comment, _id: data._id }
                setNotifications({ ...notifications, results })
            })
            .catch(err => {
                console.log(err)
            })
    }

    return (
        <>
            <Toaster />

            <AnimationWrapper transition={{ duration: 1, delay: 1 * .01 }} >
                <textarea value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Leave a reply..."
                    className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto">
                </textarea>
                <button className="btn-dark mt-5 px-10"
                    onClick={handleComment}>Reply</button>
            </AnimationWrapper>
        </>
    )
}
export default NotificationCommentFeild;