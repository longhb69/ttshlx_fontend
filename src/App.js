import { createBrowserRouter, RouterProvider, Route, BrowserRouter as Router, Routes, Outlet } from "react-router-dom";
import "./App.css";
import SideBar from "./layouts/Sidebar";
import Home from "./pages/Home";
import Accountant from "./pages/Board";
import DSA1 from "./pages/DSA1";
import DAT from "./pages/DAT";
import Tracking from "./pages/Tracking";
import { CarsProvider } from "./Context/CarsContext";
import { UpdateCarProvider } from "./Context/UpdateCarContext";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: "phanxe/:param1",
                element: <Tracking />,
            },
            {
                path: "home",
                element: <Home />,
            },
            {
                path: "dat",
                element: <DAT />,
            },
            {
                path: "dsa1",
                element: <DSA1/>,
            }
        ],
        errorElement: <div>404 Not Found</div>,
    },
]);

function RootLayout() {
    return (
        <div
            style={{
                backgroundImage:
                    "url(https://trello-backgrounds.s3.amazonaws.com/SharedBackground/2560x1708/c15f0a80eeaa08ab2db1c2225534c7d6/photo-1728588266991-90ecfa62a372.webp)",
            }}
            className="flex h-screen w-full crelative bg-cover bg-center bg-no-repeat"
        >
            <SideBar />
            <div className="w-full h-full scroll-container relative">
                <main className="h-full relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function App() {
    return (
        <CarsProvider>
            <UpdateCarProvider>
                <RouterProvider router={router} />
            </UpdateCarProvider>
        </CarsProvider>
    );
}

export default App;
