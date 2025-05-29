import React from "react";
import { Link } from "react-router-dom";

function Homepage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 text-center max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Welcome to Practice App!</h1>
        <p className="text-gray-700 mb-8">
          This is a simple authentication demo. Please login or register to continue.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2 bg-gray-200 text-blue-700 rounded-lg font-semibold hover:bg-blue-300 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Homepage;