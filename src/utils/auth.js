// Utility functions for authentication

export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Decode JWT token to check expiry
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error checking token validity:', error);
    return false;
  }
};

export const getTimeUntilExpiry = () => {
  const token = localStorage.getItem('token');
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return Math.max(0, payload.exp - currentTime);
  } catch (error) {
    console.error('Error getting token expiry time:', error);
    return 0;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  localStorage.removeItem('cart');
  
  // Clear any auth intervals
  if (window.authInterval) {
    clearInterval(window.authInterval);
    window.authInterval = null;
  }
  
  window.location.href = '/login';
};

// Function to clear invalid tokens
export const clearInvalidToken = () => {
  const token = localStorage.getItem('token');
  
  if (token && !isTokenValid()) {
    console.log('Clearing invalid token from localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    return true;
  }
  
  return false;
};

export const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Anda belum login. Silakan login terlebih dahulu.');
    logout();
    return null;
  }

  // Check if token is expired before making request
  if (!isTokenValid()) {
    alert('Sesi login Anda telah berakhir. Silakan login kembali.');
    logout();
    return null;
  }

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    // Check if response indicates token issues
    if (response.status === 401 || response.status === 403) {
      try {
        const data = await response.json();
        
        if (data.expired || data.signatureInvalid || data.requireLogin || 
            (data.message && (data.message.includes('expired') || data.message.includes('invalid signature')))) {
          
          // Different messages for different issues
          if (data.signatureInvalid) {
            alert('Sesi login tidak valid. Silakan login kembali untuk melanjutkan.');
          } else if (data.expired) {
            alert('Sesi login Anda telah berakhir. Silakan login kembali.');
          } else {
            alert('Sesi login Anda telah berakhir. Silakan login kembali.');
          }
          
          logout();
          return null;
        }
      } catch (jsonError) {
        // If can't parse JSON, assume token issue
        alert('Sesi login tidak valid. Silakan login kembali.');
        logout();
        return null;
      }
    }

    return response;
  } catch (error) {
    console.error('Request error:', error);
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('Network error - server might be down');
      alert('Tidak dapat terhubung ke server. Pastikan server berjalan dan coba lagi.');
      return null;
    }
    
    throw error;
  }
};

export const refreshToken = async () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return false;
  }

  try {
    const response = await fetch('http://localhost:5000/api/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem('token', data.token);
        console.log('Token refreshed successfully');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    
    // Check if it's a network error
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.error('Network error during token refresh - server might be down');
      return false;
    }
    
    return false;
  }
};

// Auto logout when token expires
export const setupAutoLogout = () => {
  // Prevent multiple interval setups
  if (window.authInterval) {
    clearInterval(window.authInterval);
  }

  const checkTokenExpiry = async () => {
    try {
      const timeLeft = getTimeUntilExpiry();
      
      // If token has less than 30 minutes left, try to refresh
      if (timeLeft > 0 && timeLeft < 1800) {
        console.log('Token expiring soon, attempting refresh...');
        const refreshed = await refreshToken();
        
        if (!refreshed) {
          alert('Sesi login Anda telah berakhir. Silakan login kembali.');
          logout();
        }
      } else if (timeLeft <= 0 && localStorage.getItem('token')) {
        alert('Sesi login Anda telah berakhir. Silakan login kembali.');
        logout();
      }
    } catch (error) {
      console.error('Error in checkTokenExpiry:', error);
    }
  };

  // Check every 5 minutes and store interval reference
  window.authInterval = setInterval(checkTokenExpiry, 300000);
  
  // Check immediately
  checkTokenExpiry();
};

// Warning before token expires
export const setupTokenWarning = () => {
  const checkForWarning = () => {
    const timeLeft = getTimeUntilExpiry();
    
    // Warn when 5 minutes left
    if (timeLeft > 0 && timeLeft < 300) {
      const minutes = Math.floor(timeLeft / 60);
      alert(`Sesi login Anda akan berakhir dalam ${minutes} menit. Silakan simpan pekerjaan Anda.`);
    }
  };

  // Check every 2 minutes
  setInterval(checkForWarning, 120000);
};
