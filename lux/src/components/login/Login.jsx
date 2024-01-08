import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await auth.signInWithEmailAndPassword(email, password);
      setSuccessMsg("Login successful! You will now be redirected.");

      const user = auth.currentUser;

      if (user) {
        const customClaims = (await user.getIdTokenResult()).claims;
        const userRole = customClaims.role;
        console.log(userRole);
        // Redirect user based on their role
        switch (userRole) {
          case 'admin':
            navigate('/admin');
            break;
          case 'superAdmin':
            navigate('/superAdmin');
            break;
          case 'regularUser':
            navigate('/userhome');
            break;
          case 'business':
            navigate('/business');
            break;
          case 'company':
            navigate('/company');
            break;
          case 'nonprofit':
            navigate('/nonprofit');
            break;
          case 'semiprofit':
            navigate('/semiprofit');
            break;
          case 'employee':
            navigate('/employee');
            break;
          default:
            navigate('/userhome'); // You can redirect to a general dashboard or specific route
            break;
        }
      }
    } catch (error) {
      console.error('Error logging in:', error);

      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setErrorMsg('Invalid combination of email and password.');
          break;
        default:
          setErrorMsg('An error occurred during login.');
          break;
      }
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      {successMsg && (
        <>
          <div className="success-msg">{successMsg}</div>
          <br />
        </>
      )}
      <form className="form-group" autoComplete="off" onSubmit={handleLogin}>
        <label htmlFor="email">Email:</label>
        <input
          className="form-control"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password">Password:</label>
        <input
          className="form-control"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br />
        <div className="btn-box">
          <span>
            Don't have an account?
            <Link to="/signup" className="link">
              Sign Up Here
            </Link>
          </span>
          <br />
          <button className="btn btn-success btn-md" type="submit">
            Login
          </button>
        </div>
      </form>
      <br />
      {errorMsg && <div className="error-msg">{errorMsg}</div>}
    </div>
  );
};

export default Login;
