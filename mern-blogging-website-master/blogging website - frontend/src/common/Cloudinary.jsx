import { toast } from 'react-hot-toast';

const handleImageUpload = async (file) => {
    if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_PRESETS); // Cloudinary upload preset

        try {
            const response = await fetch('http://localhost:3000/uploadBanner', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Image upload failed');
            }

            const data = await response.json();
            // Use the uploaded image URL as needed
            const imageUrl = data.secure_url;

            // Show success toast
            toast.success('Image Uploaded👍!');

            // Return the uploaded image URL
            return imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error.message);

            // Show error toast
            toast.error('Error Uploading Image 😥');

            // Throw the error to be caught by the caller if needed
            throw error;
        }
    }
};

export default handleImageUpload;

