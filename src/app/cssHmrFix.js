// CSS Hot Module Replacement fix
if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept();
}

export default function CssHmrFix() {
  return null;
}
