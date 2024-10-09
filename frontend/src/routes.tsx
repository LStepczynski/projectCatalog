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
import { AdminView } from './pages/adminView';
import { EmailVerification } from './pages/emailVerification';
import { PasswordReset } from './pages/passwordReset';
import { VerifyEmailChange } from './pages/verifyEmailChange';
import { Faq } from './pages/faq';
import { NotFound } from './pages/notFound';

export const Routes = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Index />,
    },
    {
      path: '/faq',
      element: <Faq />,
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
      path: '/create',
      element: <Create />,
    },
    {
      path: '/verify-email-change/:code',
      element: <VerifyEmailChange />,
    },
    {
      path: '/email-verification/:code',
      element: <EmailVerification />,
    },
    {
      path: '/password-reset/:code',
      element: <PasswordReset />,
    },
    {
      path: '/adminView/:page',
      element: <AdminView />,
    },
    {
      path: '/myArticles/:page',
      element: <MyArticles />,
    },
    {
      path: '/categories/:categoryName/:page',
      element: <Category />,
    },
    {
      path: '/:id',
      element: <Article />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ]);

  return <RouterProvider router={router} />;
};
