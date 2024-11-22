import {
  createBrowserRouter,
  RouterProvider,
  Route,
  BrowserRouter as Router,
  Routes,
  Outlet,
} from "react-router-dom";
import "./App.css";
import SideBar from "./layouts/Sidebar";
import Home from "./pages/Home";
import Accountant from "./pages/Board";
import DAT from "./pages/DAT";
import Tracking from "./pages/Tracking";

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
        path: "tracking",
        element: <Tracking />,
      },
      {
        path: "dat",
        element: <DAT />,
      },
    ],
    errorElement: <div>404 Not Found</div>,
  },
]);

function RootLayout() {
  return (
    <div 
      style={{backgroundImage: "url(https://trello-backgrounds.s3.amazonaws.com/SharedBackground/2560x1708/c15f0a80eeaa08ab2db1c2225534c7d6/photo-1728588266991-90ecfa62a372.webp)"}}
      className="flex h-full w-full crelative bg-cover bg-center bg-no-repeat"
    >
      <div className="basis-[10%]">
        <SideBar />
      </div>
      <div className="w-full h-full scroll-container">
        <main className="h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function App() {
  return <RouterProvider router={router} />;
}

export default App;
