import React from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useDispatch } from "react-redux";
import { setUser } from "../slices/userSlice";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialValues = { username: "", password: "" };

  const validate = (values) => {
    const errors = {};
    if (!values.username) errors.username = "Required";
    if (!values.password) errors.password = "Required";
    return errors;
  };

  const handleSubmit = (values, { setSubmitting }) => {
    axios
      .post("http://localhost:3000/login", values)
      .then((res) => {
        if (res.data.token) {
          // Save to Redux
          dispatch(setUser({
            id: res.data.user.id,
            username: res.data.user.username,
            email: res.data.user.email,
            token: res.data.token,
          }));
          // Optionally save to localStorage for persistence
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user_id", res.data.user.id);
          localStorage.setItem("username", res.data.user.username);
          navigate("/dashboard");
        } else {
          alert("Login failed!");
        }
      })
      .catch(() => {
        alert("Invalid username or password!");
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Login
        </h2>
        <Formik
          initialValues={initialValues}
          validate={validate}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="mb-4">
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-700">
                  Username:
                </label>
                <Field
                  type="text"
                  name="username"
                  id="username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
                <ErrorMessage name="username" component="div" className="text-red-500 text-sm" />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                  Password:
                </label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition"
              >
                Login
              </button>
              <div className="mt-4 text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link to="/register" className="text-blue-600 hover:underline font-semibold">
                  Register
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

export default Login;