import ReactDOM from 'react-dom';
import { ThemeProvider, BaseStyles } from '@primer/react';

export const PortalWrapper = ({ children }: any) => {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <ThemeProvider colorMode="dark">
      <BaseStyles>{children}</BaseStyles>
    </ThemeProvider>,
    modalRoot
  );
};
