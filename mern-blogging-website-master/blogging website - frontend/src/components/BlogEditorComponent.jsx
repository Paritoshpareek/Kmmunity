import { Link, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from 'react';
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { Toaster, toast } from 'react-hot-toast';
import { EditorContext } from "../pages/editor.pages";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./ToolsComponent"
import axios from "axios";
import { UserContext } from "../App";


const BlogEditor = () => {
    const [image, setImage] = useState(null);

    let { blog, blog: { title, banner, content, tags, des }, setBlog, textEditor, setTextEditor, setEditorState } = useContext(EditorContext)

    let { userAuth: { access_token } } = useContext(UserContext)

    let { blog_id } = useParams();


    let navigate = useNavigate()
    //use effect 
    useEffect(() => {
        if (!textEditor.isReady) {
            setTextEditor(new EditorJS({
                holder: "textEditor",
                data: Array.isArray(content) ? content[0] : content,
                tools: tools,
                placeholder: "Let's  contribute to the kmmunity",
            }))
        }


    }, [])


    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESETS); //  Cloudinary upload preset


            toast.promise(
                // Promise for uploading the image
                fetch('http://localhost:3000/uploadBanner', {
                    method: 'POST',
                    body: formData,
                }).then(response => response.json()),
                {
                    loading: 'Uploading...', // Loading message
                    success: (data) => {
                        setImage(data.secure_url); // Set the uploaded image URL on success  
                        setBlog({ ...blog, banner: data.secure_url });
                        return <b>Image Uploaded👍!</b>; // Success message

                    },
                    error: 'Error Uploading Image 😥', // Error message
                }
            );
        }
    };

    const handleTitleKeyDown = (e) => {
        if (e.keyCode === 13) {
            // User pressed the Enter key (keycode =13)
            e.preventDefault();
        }
    }

    const handleTitleChange = (e) => {
        let input = e.target;
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
        setBlog({ ...blog, title: input.value })
    }

    const handleImageError = (e) => {
        let img = e.target
        img.src = defaultBanner;
    }

    const handlePublishEvent = () => {

        // if (!banner.length) {
        //     return toast.error("Upload a blog banner to publish");
        // }

        if (!title.length) {
            return toast.error("Upload a blog title to publish");
        }
        if (textEditor.isReady) {
            textEditor.save().then(data => {
                if (data.blocks.length) {
                    setBlog({ ...blog, content: data });
                    setEditorState("publish")

                } else {
                    return toast.error("Write something in your blog to publish it!")
                }
            })
                .catch((err) => {
                    console.log(err);
                })
        }

    }

    const handleSaveDraft = (e) => {
        if (e.target.className.includes("disable")) {
            return;
        }
        if (!title.length) {
            return toast.error("Write blog title before saving as draft")
        }
        let loadingToast = toast.loading("Saving Draft...");
        //disabling button 
        e.target.classList.add('disable');
        if (textEditor.isReady) {
            textEditor.save().then(content => {
                let blogObj = {
                    title, banner, des, content, tags, draft: true
                }
                axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/create-blog", { ...blogObj, id: blog_id }, {
                    headers: {
                        'Authorization': `Bearer ${access_token}`
                    }
                })
                    .then(() => {
                        e.target.classList.remove('disable');
                        toast.dismiss(loadingToast);
                        toast.success("Saved👍");

                        setTimeout(() => {
                            navigate("/")
                        }, 500);
                    })
                    .catch(({ response }) => {
                        e.target.classList.remove('disable');
                        toast.dismiss(loadingToast);
                        return toast.error(response.data.error)
                    })
            })
        }


    }

    return (
        <>
            <nav className="navbar" >
                <Link to="/" className="flex-none w-10">
                    <img src={logo} />
                </Link>
                <p className="max-md:hidden text-black line-clamp-1 w-full " >{title.length ? title : "New Blog"}</p>

                <div className="flex gap-4 ml-auto ">
                    <button className="btn-dark py-2 "
                        onClick={handlePublishEvent}>Publish</button>
                    <button className="btn-light py-2 "
                        onClick={handleSaveDraft}>Save Draft</button>
                </div>
            </nav>
            <Toaster />
            <AnimationWrapper >
                <section>
                    <div className="mx-auto max-w-[900px] w-full ">
                        <div className="relative aspect-video hover:opacity-80  bg-white border-4 border-grey">
                            <label htmlFor="uploadBanner">
                                <img
                                    //src={image || defaultBanner}
                                    src={banner}
                                    className="z-20"
                                    onError={handleImageError}
                                />
                                <input
                                    id="uploadBanner"
                                    type="file"
                                    accept=".png,.jpg,.jpeg"
                                    hidden
                                    onChange={handleImageUpload}
                                />
                            </label>
                        </div>
                        <textarea
                            defaultValue={title}
                            placeholder="Blog Title"
                            className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 "
                            onKeyDown={handleTitleKeyDown}
                            onChange={handleTitleChange}
                        >

                        </textarea>
                        <hr className="w-full opacity-10 my-5 " />

                        <div id="textEditor" className="font-gelasio"> </div>
                    </div>
                </section>
            </AnimationWrapper>
        </>
    )
}

export default BlogEditor;

// --old file---
// import { Link } from "react-router-dom";
// import { useState } from 'react'
// import logo from "../imgs/logo.png"
// import AnimationWrapper from "../common/page-animation";
// import defaultBanner from "../imgs/blog banner.png";
// import { Toaster, toast } from 'react-hot-toast'

// const BlogEditor = () => {

//     const [image, setImage] = useState(null);

//     const handleImageUpload = async (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const formData = new FormData();
//             formData.append('file', file);
//             formData.append('upload_preset', 'xbvxvawe'); // Replace with your Cloudinary upload preset

//             console.log(file)
//             let loadingToast = toast.loading("Hang thight Uploading ...")
//             try {
//                 const response = await fetch('http://localhost:3000/uploadBanner', {
//                     method: 'POST',
//                     body: formData,
//                 });
//                 const data = await response.json();
//                 console.log(data)
//                 toast.dismiss(loadingToast);
//                 setImage(data.secure_url);

//             } catch (error) {
//                 toast.dismiss(loadingToast);
//                 console.error('Error uploading image: ', error);
//             }
//         }
//     };
//     return (
//         <>
//             <nav className="navbar" >
//                 <Link to="/" className="flex-none w-10">
//                     <img src={logo} />
//                 </Link>
//                 <p className="max-md:hidden text-black line-clamp-1 w-full " >New Blog</p>

//                 <div className="flex gap-4 ml-auto ">
//                     <button className="btn-dark py-2 ">Publish</button>
//                     <button className="btn-light py-2 ">Save Draft</button>
//                 </div>
//             </nav>
//             <Toaster />
//             <AnimationWrapper >
//                 <section>
//                     <div className="mx-auto max-w-[900px] w-full ">
//                         <div className="relative aspect-video hover:opacity-80  bg-white border-4 border-grey">
//                             <label htmlFor="uploadBanner">
//                                 <img src={image || defaultBanner} className="z-20" />
//                                 <input id="uploadBanner"
//                                     type="file"
//                                     accept=".png,.jpg,.jpeg"
//                                     hidden
//                                     onChange={handleImageUpload} />
//                             </label>
//                         </div>
//                     </div>
//                 </section>
//             </AnimationWrapper>
//         </>

//     )
// }
// export default BlogEditor;