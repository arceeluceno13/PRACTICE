import { createSlice } from '@reduxjs/toolkit';

function getStoredUser() {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return token && user ? { ...user, token } : null;
  } catch {
    return null;
  }
}

const initialState = getStoredUser() || {
  id: null,
  username: null,
  email: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(_state, action) {
      return action.payload;
    },
    clearUser() {
      return { id: null, username: null, email: null, token: null };
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
