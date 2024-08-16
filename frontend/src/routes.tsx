import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Index } from './pages/index';
import { Account } from './pages/account';
import { Categories } from './pages/categories';
import { Category } from './pages/category';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { Article } from './pages/article';
import { Create } from './pages/create';
import { MyArticles } from './pages/myArticles';

export const Routes = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Index />,
    },
    {
      path: '/categories',
      element: <Categories />,
    },
    {
      path: '/account',
      element: <Account />,
    },
    {
      path: '/sign-in',
      element: <Login />,
    },
    {
      path: '/sign-up',
      element: <Register />,
    },
    {
      path: '/myArticles',
      element: <MyArticles />,
    },
    {
      path: '/create',
      element: <Create />,
    },
    {
      path: '/categories/:categoryName/:page',
      element: <Category />,
    },
    {
      path: '/:id',
      element: <Article />,
    },
  ]);

  return <RouterProvider router={router} />;
};
