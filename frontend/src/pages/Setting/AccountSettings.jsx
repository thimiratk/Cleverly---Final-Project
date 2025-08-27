import React, { useState } from 'react';
import { User, Mail, Lock } from 'lucide-react';
import Alert from '@mui/material/Alert';

const AccountSettings = ({ themeClasses }) => {
  const [email, setEmail] = useState('sewmini@gmail.com'); //old email
  const [newEmail, setNewEmail] = useState("");  // input for new email
  const [newPassword, setNewPassword] = useState("");  // input for new password
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  // Handle email change
  const handleEmailChange = () => {
    if (!newEmail || !newEmail.includes("@")) { // simple validation
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); // auto-hide after 3 sec
      return;
    }
    setIsChangingEmail(true);
    setTimeout(() => {
      setEmail(newEmail);
      setNewEmail('');
      setIsChangingEmail(false);
      setShowSuccess(true);
      // Auto-hide alert after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000); // 3000ms = 3 seconds
    }, 1500);
  };

  // Handle password change
  const handlePasswordChange = () => {
    if(!newPassword){
      setShowError(true);
      setTimeout(() => setShowError(false), 3000); // auto-hide after 3 sec
      return;
    }
    setIsChangingPassword(true);
    setTimeout(() => {
      setIsChangingPassword(newPassword);
      setNewPassword('');
      setIsChangingPassword(false);
      setShowSuccess(true);
      // Auto-hide alert after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000); // 3000ms = 3 seconds
    }, 1500);
  };

  return (
    <div className={`${themeClasses.section} rounded-2xl p-8 border transition-all duration-200 hover:shadow-lg`}>
      <div className="flex items-center mb-6">
        <User className={`w-6 h-6 ${themeClasses.text} mr-3`} />
        <h2 className={`text-2xl font-semibold ${themeClasses.text}`}>Account Settings</h2>
      </div>
      
      <div className="space-y-6">
        {/* Email Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white/50 rounded-xl">
          <div className="flex items-center space-x-4">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className={`font-semibold ${themeClasses.text}`}>Email Address</h3>
              <p className={`text-sm ${themeClasses.subtext}`}>Current: {email}</p>
              <input
                type="email"
                placeholder="Enter new email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={`mt-2 px-3 py-2 ${themeClasses.input} rounded-lg w-full sm:w-72`}
              />
            </div>
          </div>
          <button
            onClick={handleEmailChange}
            disabled={isChangingEmail}
            className={`
              px-6 py-3 ${themeClasses.button} text-white rounded-xl font-medium transition-all duration-200
              hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]
            `}
          >
            {isChangingEmail ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </div>
            ) : (
              'Change Email'
            )}
          </button>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <Alert variant="outlined" severity="success"> Updated successfully!</Alert>              
        )}

        {/* Failure Alert */}
        {showError && (
          <Alert variant="outlined" severity="error">Error</Alert>
        )}

        {/* Password Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white/50 rounded-xl">
          <div className="flex items-center space-x-4">
            <Lock className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className={`font-semibold ${themeClasses.text}`}>Password</h3>
              <p className={`text-sm ${themeClasses.subtext}`}>Keep your account secure</p>
              <input
                type="password"
                placeholder="Enter new Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`mt-2 px-3 py-2 ${themeClasses.input} rounded-lg w-full sm:w-72`}
              />
            </div>
          </div>
          <button
            onClick={handlePasswordChange}
            disabled={isChangingPassword}
            className={`
              px-6 py-3 ${themeClasses.button} text-white rounded-xl font-medium transition-all duration-200
              hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]
            `}
          >
            {isChangingPassword ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </div>
            ) : (
              'Change Password'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;