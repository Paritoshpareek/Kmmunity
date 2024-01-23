import { Routes, Route } from "react-router-dom";
import Navbar from "./components/NavbarComponent";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/ProfilePage";
import BlogPage from "./pages/BlogPage";
import SideNav from "./components/SideNavbarComponent";
import ChangePassword from "./pages/ChangePasswordPage";
import EditProfile from "./pages/EditProfilePage";
import Notifications from "./pages/NotificationsPage";
import ManageBlogs from "./pages/ManageBlogPage";


export const UserContext = createContext({})

export const ThemeContext = createContext({});

const darkThemePreference = () => window.matchMedia("(prefers-color-scheme: dark)").matches

const App = () => {
    const [userAuth, setUserAuth] = useState({});

    const [theme, setTheme] = useState(() => darkThemePreference() ? "dark" : "light");

    useEffect(() => {
        let userInSession = lookInSession("user");
        let themeInSession = lookInSession("theme");

        userInSession ? setUserAuth(JSON.parse(userInSession)) : setUserAuth({ access_token: null })

        if (themeInSession) {
            setTheme(() => {
                document.body.setAttribute('data-theme', themeInSession);
                return themeInSession
            })
        } else {
            document.body.setAttribute('data-theme', theme)
        }


    }, [])
    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <UserContext.Provider value={{ userAuth, setUserAuth }} >
                <Routes>
                    <Route path="/editor" element={<Editor />} />
                    <Route path="/editor/:blog_id" element={<Editor />} />
                    <Route path="/" element={<Navbar />}>
                        <Route index element={<HomePage />} />

                        <Route path="dashboard" element={<SideNav />}>

                            <Route path="blogs" element={<ManageBlogs />} />
                            <Route path="notifications" element={<Notifications />} />

                        </Route>

                        {/* sidenav */}
                        <Route path="settings" element={<SideNav />}>
                            <Route path="edit-profile" element={<EditProfile />} />
                            <Route path="change-password" element={<ChangePassword />} />

                        </Route>
                        <Route path="signin" element={<UserAuthForm type="sign-in" />} />
                        <Route path="signup" element={<UserAuthForm type="sign-up" />} />
                        <Route path="search/:query" element={<SearchPage />} />
                        <Route path="user/:id" element={<ProfilePage />} />
                        <Route path="*" element={<PageNotFound />} />
                        <Route path="blog/:blog_id" element={<BlogPage />} />
                    </Route>
                </Routes>
            </UserContext.Provider>
        </ThemeContext.Provider>

    );
}

export default App; 