export const authService = {
  login: (username: string, password: string): boolean => {
    // بيانات الدخول الافتراضية - يمكن تغييرها لاحقاً
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('alwaleed_auth', JSON.stringify({
        username,
        role: 'SUPER_ADMIN',
        loginTime: new Date().toISOString()
      }));
      return true;
    }
    return false;
  },
  
  logout: () => {
    localStorage.removeItem('alwaleed_auth');
    window.location.reload();
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('alwaleed_auth');
  },
  
  getUser: () => {
    const data = localStorage.getItem('alwaleed_auth');
    return data ? JSON.parse(data) : null;
  }
};