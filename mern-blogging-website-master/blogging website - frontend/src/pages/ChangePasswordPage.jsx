import { useContext, useRef } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/InputBox";
import { toast, Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const ChangePassword = () => {

    let { userAuth: { access_token } } = useContext(UserContext)


    let changePasswordForm = useRef();
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

    const handleSubmit = (e) => {
        e.preventDefault();

        let form = new FormData(changePasswordForm.current);
        let formData = {};

        for (let [key, value] of form.entries()) {
            formData[key] = value;
        }

        let { currentPassword, newPassword, confirmNewPassword } = formData;

        if (!currentPassword.length || !newPassword.length || !confirmNewPassword.length) {
            return toast.error("Fill all the entries");
        }
        if (newPassword !== confirmNewPassword) {
            return toast.error("New Password and Confirm Password must match");
        }
        if (!passwordRegex.test(currentPassword) || !passwordRegex.test(newPassword)) {
            return toast.error("Password should be 6 to 20 characters long with a numeric, lowercase and uppercase letter")
        }

        // disableing button
        e.target.setAttribute("disabled", true);
        let loadingToast = toast.loading("Updating...")

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
            .then(() => {
                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                return toast.success("Password updated successfully👍")
            })
            .catch(({ response }) => {

                toast.dismiss(loadingToast);
                e.target.removeAttribute("disabled");
                return toast.error(response.data.error)
            })

    };

    return (
        <AnimationWrapper>
            <Toaster />

            <form ref={changePasswordForm}>
                <h1 className="max-md:hidden ">Change Password</h1>

                <div className="py-10 w-full md:max-w-[400px] ">
                    <InputBox
                        name="currentPassword"
                        type="password"
                        className="profile-edit-input"
                        placeholder="Current Password"
                        icon="fi-rr-unlock"
                    />

                    <InputBox
                        name="newPassword"
                        type="password"
                        className="profile-edit-input"
                        placeholder="New Password"
                        icon="fi-rr-key"
                    />
                    <InputBox
                        name="confirmNewPassword"
                        type="password"
                        className="profile-edit-input"
                        placeholder="Confirm Password"
                        icon="fi-rr-key"
                    />

                    <button
                        onClick={handleSubmit}
                        className="btn-dark px-10"
                        type="submit"
                    >
                        Change Password
                    </button>
                </div>
            </form>
        </AnimationWrapper>
    );
};

export default ChangePassword;
