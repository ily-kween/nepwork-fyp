/*
 * This is a function that will help us to logout from anywhere
 * this function will navigate us to /logout
 * */
export const logoutHelper = () => {
  history.pushState({}, '', '/logout');
  dispatchEvent(new PopStateEvent('popstate'));
};
