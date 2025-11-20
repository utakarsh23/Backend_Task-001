import Cookies from 'js-cookie';

export const setCookie = (name: string, value: string, options?: Cookies.CookieAttributes) => {
  Cookies.set(name, value, options);
};

export const getCookie = (name: string): string | undefined => {
  return Cookies.get(name);
};

export const removeCookie = (name: string) => {
  Cookies.remove(name);
};

export const isAuthenticated = (): boolean => {
  const token = getCookie('token');
  return !!token;
};

export const getUserRole = (): string | null => {
  return getCookie('role') || null;
};

export const isAdmin = (): boolean => {
  const role = getUserRole();
  return role === 'admin' || role === 'dev';
};

export const logout = () => {
  removeCookie('token');
  removeCookie('role');
  removeCookie('username');
  if (typeof window !== 'undefined') {
    window.location.href = '/auth';
  }
};