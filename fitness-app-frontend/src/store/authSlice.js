import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

// Async thunk for login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await fetch("http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "password",
          client_id: "oauth2-pkce-client",
          username,
          password,
          scope: "openid profile email",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || "Login failed");
      }

      const tokenData = await response.json();

 
      const userInfoResponse = await fetch(
        "http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        }
      );

      const userInfo = await userInfoResponse.json();

      return {
        token: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        user: userInfo,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      
      const keycloakRes = await fetch("http://localhost:8085/api/keycloak/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          password: userData.password,
        }),
      });

      if (!keycloakRes.ok) {
        const errorText = await keycloakRes.text();
        throw new Error("Keycloak registration failed: " + errorText);
      }

     
      const backendRes = await fetch("http://localhost:8085/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username, 
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }),
      });

      if (!backendRes.ok) {
        const errorText = await backendRes.text();
        throw new Error("Backend registration failed: " + errorText);
      }

      const backendUserData = await backendRes.json();

      return {
        message: "Registration successful! Please login with your credentials.",
        user: backendUserData,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    userId: localStorage.getItem("userId") || null,
    isLoading: true,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.userId = null;
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
    },
    clearError: (state) => {
      state.error = null;
    },
    checkAuthStatus: (state) => {
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
     
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.userId = action.payload.user.sub;
        state.error = null;

        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("userId", action.payload.user.sub);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

   
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError, checkAuthStatus } = authSlice.actions;
export default authSlice.reducer;
