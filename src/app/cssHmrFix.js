// CSS Hot Module Replacement fix
// Only use HMR in development
const isClient = typeof window !== 'undefined';
const isDev = process.env.NODE_ENV !== 'production';

if (isDev && isClient && typeof module !== 'undefined' && module.hot) {
  try {
    module.hot.accept();
  } catch (error) {
    console.warn('HMR not available:', error);
  }
}

export default function CssHmrFix() {
  return null;
}
