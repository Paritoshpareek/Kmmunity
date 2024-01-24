import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const MinimalBlogPost = ({ blog, index }) => {
    let {
        title,
        blog_id: id,
        author: {
            personal_info: { fullname, username, profile_img },
        },
        publishedAt,
    } = blog;

    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            to={`/blog/${id}`}
            className="flex gap-5 mb-8 relative overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <h1
                className={`blog-index relative z-10 transition-all duration-300 ${isHovered ? "text-black transform scale-105" : ""
                    }`}
            >
                {index < 10 ? "0" + (index + 1) : index}
            </h1>

            <div className="relative z-20">
                <div className="flex gap-2 items-center mb-7">
                    <img src={profile_img} className="w-6 h-6 rounded-full " />
                    <p className="line-clamp-1 ">
                        {fullname} @{username}
                    </p>
                    <p className="min-w-fit">{getDay(publishedAt)}</p>
                </div>
                <h1
                    className={`blog-title ${isHovered ? "text-black transform scale-105" : ""
                        } transition-all duration-300`}
                >
                    {title}
                </h1>
            </div>
        </Link>
    );
};

export default MinimalBlogPost;



