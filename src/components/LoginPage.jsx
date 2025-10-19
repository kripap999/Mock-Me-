import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('user'); // 'user' | 'recruiter'
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recruiterCode, setRecruiterCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    // Simple client-side validation for MVP
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password.');
      return;
    }
    if (role === 'recruiter' && recruiterCode.trim().length === 0) {
      setError('Please enter your recruiter code.');
      return;
    }
    // Persist selected role for later use
    localStorage.setItem('authRole', role);
    localStorage.setItem('authEmail', email.trim());
    // Navigate to a sensible start page based on role (MVP)
    if (role === 'recruiter') {
      navigate('/?section=programs');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen academic-dark" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px'}}>
      <div style={{width: '100%', maxWidth: '460px'}}>
        {/* Brand */}
          <div style={{textAlign: 'center', marginBottom: '18px'}}>
          <div style={{fontSize: '34px', fontWeight: 700, color: '#d4af37'}}>Mock Me?!</div>
          <div style={{color: '#e0d5c5'}}>{mode === 'login' ? 'Sign in to continue' : 'Create your account'}</div>
        </div>

        {/* Card */}
        <div className="glass-panel" style={{backgroundColor: '#2a2a2a', borderRadius: '14px', padding: '18px', boxShadow: '0 0 0 2px #4b3832 inset'}}>
          {/* Mode + Role switch */}
          <div style={{display: 'flex', gap: '8px', marginBottom: '10px', justifyContent: 'center'}}>
            <button onClick={() => setMode('login')} className="custom-button" style={{backgroundColor: mode==='login' ? '#4b3832' : 'transparent', border: '1px solid #4b3832'}}>Login</button>
            <button onClick={() => setMode('signup')} className="custom-button" style={{backgroundColor: mode==='signup' ? '#4b3832' : 'transparent', border: '1px solid #4b3832'}}>Sign up</button>
          </div>
          <div style={{display: 'flex', gap: '8px', marginBottom: '14px'}}>
            <button
              onClick={() => setRole('user')}
              className="custom-button"
              style={{
                flex: 1,
                backgroundColor: role === 'user' ? '#4b3832' : 'transparent',
                border: '1px solid #4b3832'
              }}
            >
              User Login
            </button>
            <button
              onClick={() => setRole('recruiter')}
              className="custom-button"
              style={{
                flex: 1,
                backgroundColor: role === 'recruiter' ? '#4b3832' : 'transparent',
                border: '1px solid #4b3832'
              }}
            >
              Recruiter Login
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <label style={{display: 'block', color: '#e0d5c5', marginBottom: '6px'}}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                width: '100%',
                backgroundColor: '#1c1c1c',
                color: '#e0d5c5',
                border: '1px solid #4b3832',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '12px'
              }}
            />

            <label style={{display: 'block', color: '#e0d5c5', marginBottom: '6px'}}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                backgroundColor: '#1c1c1c',
                color: '#e0d5c5',
                border: '1px solid #4b3832',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: role === 'recruiter' ? '12px' : '18px'
              }}
            />

            {role === 'recruiter' && (
              <>
                <label style={{display: 'block', color: '#e0d5c5', marginBottom: '6px'}}>Recruiter Code</label>
                <input
                  type="text"
                  value={recruiterCode}
                  onChange={(e) => setRecruiterCode(e.target.value)}
                  placeholder="Enter your recruiter code"
                  style={{
                    width: '100%',
                    backgroundColor: '#1c1c1c',
                    color: '#e0d5c5',
                    border: '1px solid #4b3832',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '18px'
                  }}
                />
              </>
            )}

            {error && (
              <div style={{backgroundColor: '#4a2a2a', border: '1px solid #6a4a4a', color: '#e0d5c5', borderRadius: '8px', padding: '10px', marginBottom: '12px'}}>
                {error}
              </div>
            )}

            <button type="submit" className="custom-button" style={{width: '100%', fontSize: '16px', padding: '12px'}}>{mode === 'login' ? 'Continue' : 'Create account'}</button>
            <div style={{textAlign: 'center', color: '#9aa0a6', fontSize: '12px', marginTop: '10px'}}>or</div>
            <button type="button" onClick={() => window.location.href=(import.meta.env?.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/auth/google/start` : '/login')} className="custom-button" style={{width: '100%', fontSize: '16px', padding: '12px', marginTop: '8px', backgroundColor: '#2a2a2a'}}>Continue with Google</button>
          </form>
        </div>

        <div style={{textAlign: 'center', color: '#9aa0a6', fontSize: '12px', marginTop: '10px'}}>
          By continuing you agree to our terms.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


