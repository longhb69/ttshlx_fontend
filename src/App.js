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
        path: "ketoan",
        element: <Accountant />,
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
    <div className="flex h-full w-full">
      <div className="basis-[5%]">
        <SideBar />
      </div>
      <div className="bg-slate-400 basis-[95%] flex justify-center items-center min-h-screen">
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
