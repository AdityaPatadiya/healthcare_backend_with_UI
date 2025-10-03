// Token management functions
export const getToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const setToken = (token) => localStorage.setItem('access_token', token);
export const setRefreshToken = (token) => localStorage.setItem('refresh_token', token);
export const removeToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const removeRefreshToken = () => localStorage.removeItem('refresh_token');

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  // Optional: Check token expiration
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch (error) {
    return false;
  }
};
