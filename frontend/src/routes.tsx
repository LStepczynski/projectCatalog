import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Index } from "./pages/index";
import { Account } from "./pages/account";
import { Categories } from "./pages/categories";
import { Category } from "./pages/category";

export const Routes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Index />,
    },
    {
      path: "/categories",
      element: <Categories />,
    },
    {
      path: "/account",
      element: <Account />,
    },
    {
      path: "/categories/:categoryName",
      element: <Category />,
    },
  ]);

  return <RouterProvider router={router} />;
};
