//importing editorjs tools 

import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";
import Delimiter from '@editorjs/delimiter';
import Warning from '@editorjs/warning'
import axios from "axios";


const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESETS);
    try {
        // Make a POST request to Cloudinary's upload API
        const response = await axios.post('http://localhost:3000/uploadBanner', formData);

        // Return the uploaded image URL
        return {
            success: 1,
            file: { url: response.data.secure_url }
        };
    } catch (error) {
        // Handle upload errors
        console.error('Error uploading image to Cloudinary:', error);
        return {
            success: 0,
            file: { url: null }
        };
    }
};

const uploadImageByURL = (e) => {
    let link = new Promise((resolve, reject) => {
        try {
            resolve(e)
        }
        catch (err) {
            reject(err)
        }
    })

    return link.then(url => {
        return {
            success: 1,
            file: { url }
        }
    })
}

const uploadImageByFile = async (file) => {
    return uploadImageToCloudinary(file);
};

export const tools = {
    embed: Embed,
    delimiter: Delimiter,
    warning: {
        class: Warning,
        inlineToolbar: true,
        shortcut: 'CMD+SHIFT+W',
        config: {
            titlePlaceholder: 'Title',
            messagePlaceholder: 'Warning Message',
        },
    },
    list: {
        class: List,
        inlineToolbar: true,
        shortcut: 'CMD+SHIFT+L'

    },
    image: {
        class: Image,
        shortcut: 'CMD+SHIFT+I',
        config: {
            uploader: {
                uploadByUrl: uploadImageByURL,
                uploadByFile: uploadImageByFile,

            }
        }
    },

    header: {
        class: Header,
        shortcut: 'CMD+SHIFT+H',
        config: {
            placeholder: "Type your Heading...",
            levels: [2, 3],
            defaultLevel: 2,
        }
    },

    quote: {
        class: Quote,
        shortcut: 'CMD+SHIFT+Q',
        inlineToolbar: true,
    },






    marker: Marker,

    inlineCode: InlineCode
}

