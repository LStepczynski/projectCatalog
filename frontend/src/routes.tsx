import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

export const Routes = () => {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <p>/</p>,
    },
  ]);

  return (
    <RouterProvider router={router} />
  );
}

