import { useEffect, useState } from 'react';

const useAskLeave = () => {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (saved) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saved]);

  return setSaved;
};

export default useAskLeave;
