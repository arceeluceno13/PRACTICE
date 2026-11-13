import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import api from '../api';
import { setUser } from '../slices/userSlice';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const initialValues = { username: '', password: '' };

  const validate = (values) => {
    const errors = {};
    if (!values.username.trim()) errors.username = 'Required';
    if (!values.password) errors.password = 'Required';
    return errors;
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const { data } = await api.post('/auth/login', values);
      const session = { ...data.user, token: data.token };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch(setUser(session));
      navigate('/dashboard');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Login</h2>
        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
          {({ isSubmitting, status }) => (
            <Form>
              {status && <p role="alert" className="mb-4 text-sm text-red-600">{status}</p>}
              <div className="mb-4">
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">Username:</label>
                <Field type="text" name="username" id="username" autoComplete="username" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                <ErrorMessage name="username" component="div" className="text-red-500 text-sm" />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password:</label>
                <Field type="password" name="password" id="password" autoComplete="current-password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-2 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition disabled:opacity-60">
                {isSubmitting ? 'Signing in…' : 'Login'}
              </button>
              <div className="mt-4 text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link to="/register" className="text-blue-600 hover:underline font-semibold">Register</Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Login;
