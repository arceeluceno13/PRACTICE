import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import api from '../api';

function Register() {
  const navigate = useNavigate();
  const initialValues = { username: '', email: '', password: '' };

  const validate = (values) => {
    const errors = {};
    if (!values.username.trim()) errors.username = 'Required';
    if (!values.email.trim()) errors.email = 'Required';
    if (values.password.length < 8) errors.password = 'Use at least 8 characters';
    return errors;
  };

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      await api.post('/auth/register', values);
      navigate('/login', { state: { message: 'Account created. Please sign in.' } });
    } catch (error) {
      setStatus(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">Register</h2>
        <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
          {({ isSubmitting, status }) => (
            <Form>
              {status && <p role="alert" className="mb-4 text-sm text-red-600">{status}</p>}
              <div className="mb-4">
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">Username:</label>
                <Field type="text" name="username" id="username" autoComplete="username" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                <ErrorMessage name="username" component="div" className="text-red-500 text-sm" />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">Email:</label>
                <Field type="email" name="email" id="email" autoComplete="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">Password:</label>
                <Field type="password" name="password" id="password" autoComplete="new-password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-2 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition disabled:opacity-60">
                {isSubmitting ? 'Creating account…' : 'Register'}
              </button>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-blue-600 hover:underline font-semibold">Login</Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Register;
