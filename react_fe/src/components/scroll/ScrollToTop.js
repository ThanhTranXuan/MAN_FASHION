import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === 'POP' || pathname === '/user/home') return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, navigationType]);

  return null;
}
