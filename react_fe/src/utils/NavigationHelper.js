export const hideChatWidget = () => {
  window.dispatchEvent(new Event('trendify:hide-chat'));
};

export const showChatWidget = () => {
  window.dispatchEvent(new Event('trendify:show-chat'));
};

export const goToSignIn = (navigate, location, toast, message) => {
  hideChatWidget();

  if (message) {
    toast?.info(message);
  }

  navigate('/auth/sign-in', {
    state: {
      from: `${location?.pathname || '/'}${location?.search || ''}`,
    },
  });
};
