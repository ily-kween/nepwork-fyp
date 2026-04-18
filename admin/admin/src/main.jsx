import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import "./index.css";
import 'react-photo-view/dist/react-photo-view.css';
import Layout from "./Layout.jsx";
import {
    Dashboard,
    Login,
    Kycs,
    SingleKyc,
    Logout,
} from "./pages";
import { Protected } from "./components";

createRoot(document.getElementById("root")).render(
    //  <StrictMode>
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route
                    path=""
                    element={
                        <Protected>
                            <Dashboard />
                        </Protected>
                    }
                />
                <Route
                    path="dashboard"
                    element={
                        <Protected>
                            <Dashboard />
                        </Protected>
                    }
                />
                <Route
                    path="kycs"
                    element={
                        <Protected>
                            <Kycs />
                        </Protected>
                    }
                />
                <Route
                    path="kycs/:kycId"
                    element={
                        <Protected>
                            {" "}
                            <SingleKyc />{" "}
                        </Protected>
                    }
                />
                <Route path="login" element={<Login />} />
                <Route path="logout" element={<Logout />} />
            </Route>
        </Routes>
    </BrowserRouter>,
    // </StrictMode>,
);
