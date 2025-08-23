import React, { useState, useEffect } from 'react';

const AuthDebugger = () => {
  const [authInfo, setAuthInfo] = useState({});
  const [tokenDetails, setTokenDetails] = useState(null);

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    let decodedToken = null;
    if (token) {
      try {
        // Decode JWT token (just the payload part)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        decodedToken = JSON.parse(jsonPayload);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        decodedToken.isExpired = decodedToken.exp < currentTime;
        decodedToken.expiresIn = Math.floor((decodedToken.exp - currentTime) / 60); // minutes
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    setAuthInfo({
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      hasUser: !!user,
      userInfo: user ? JSON.parse(user) : null,
      currentTimestamp: Math.floor(Date.now() / 1000)
    });
    
    setTokenDetails(decodedToken);
  }, []);

  const testAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    console.log('🔐 Auth Headers:', headers);
    console.log('🪙 Token:', token);
    console.log('👤 User Info:', localStorage.getItem('user'));
    
    return headers;
  };

  const refreshAuthInfo = () => {
    window.location.reload();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🔍 Authentication Debugger</h2>
      
      {/* Token Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">🪙 Token Status</h3>
          <div className="space-y-2 text-sm">
            <div className={`flex justify-between ${authInfo.hasToken ? 'text-green-600' : 'text-red-600'}`}>
              <span>Has Token:</span>
              <span>{authInfo.hasToken ? '✅ Yes' : '❌ No'}</span>
            </div>
            {authInfo.hasToken && (
              <div className="text-gray-600">
                <div className="flex justify-between">
                  <span>Token Length:</span>
                  <span>{authInfo.tokenLength} characters</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">👤 User Status</h3>
          <div className="space-y-2 text-sm">
            <div className={`flex justify-between ${authInfo.hasUser ? 'text-green-600' : 'text-red-600'}`}>
              <span>Has User Data:</span>
              <span>{authInfo.hasUser ? '✅ Yes' : '❌ No'}</span>
            </div>
            {authInfo.userInfo && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>User ID:</span>
                  <span>{authInfo.userInfo.id || authInfo.userInfo._id || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Role:</span>
                  <span className={authInfo.userInfo.role === 'admin' ? 'text-green-600 font-semibold' : 'text-yellow-600'}>
                    {authInfo.userInfo.role || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Email:</span>
                  <span>{authInfo.userInfo.email || 'N/A'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Token Details */}
      {tokenDetails && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">🔐 Token Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex justify-between mb-2">
                <span>User ID:</span>
                <span>{tokenDetails.id || tokenDetails.userId || 'N/A'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Role:</span>
                <span className={tokenDetails.role === 'admin' ? 'text-green-600 font-semibold' : 'text-yellow-600'}>
                  {tokenDetails.role || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Email:</span>
                <span>{tokenDetails.email || 'N/A'}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Issued At:</span>
                <span>{tokenDetails.iat ? new Date(tokenDetails.iat * 1000).toLocaleString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Expires At:</span>
                <span>{tokenDetails.exp ? new Date(tokenDetails.exp * 1000).toLocaleString() : 'N/A'}</span>
              </div>
              <div className={`flex justify-between mb-2 ${tokenDetails.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                <span>Status:</span>
                <span>{tokenDetails.isExpired ? '❌ Expired' : '✅ Valid'}</span>
              </div>
              {!tokenDetails.isExpired && (
                <div className="flex justify-between text-blue-600">
                  <span>Expires In:</span>
                  <span>{tokenDetails.expiresIn > 0 ? `${tokenDetails.expiresIn} minutes` : 'Soon'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Raw Token Display */}
      {authInfo.hasToken && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">🔤 Raw Token (First 50 chars)</h3>
          <code className="text-xs bg-gray-800 text-green-400 p-2 rounded block overflow-x-auto">
            {localStorage.getItem('token')?.substring(0, 50)}...
          </code>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <button 
          onClick={testAuthHeaders}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          🔍 Log Auth Headers
        </button>
        <button 
          onClick={refreshAuthInfo}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          🔄 Refresh Info
        </button>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            alert('Auth data cleared! Please login again.');
            window.location.reload();
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
        >
          🗑️ Clear Auth Data
        </button>
      </div>

      {/* Recommendations */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Troubleshooting Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure you're logged in as an admin user</li>
          <li>• Check if your token has expired and needs refresh</li>
          <li>• Verify the token format is correct (Bearer token)</li>
          <li>• Make sure your backend auth middleware is working</li>
          <li>• Check CORS settings if making cross-origin requests</li>
        </ul>
      </div>
    </div>
  );
};

export default AuthDebugger;