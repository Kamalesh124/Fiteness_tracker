"use client"

import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { logout, checkAuthStatus } from "./store/authSlice"
import AuthForm from "./components/AuthForm"
import Dashboard from "./components/Dashboard"
import ActivityDetail from "./components/ActivityDetail"

const theme = createTheme({
  palette: {
    primary: {
      main: "#667eea",
    },
    secondary: {
      main: "#764ba2",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
})

function App() {
  const { user, token, isLoading } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(checkAuthStatus())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        {!token ? (
          <AuthForm />
        ) : (
          <Routes>
            <Route path="/activities" element={<Dashboard user={user} onLogout={handleLogout} />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />
            <Route path="/" element={<Navigate to="/activities" replace />} />
          </Routes>
        )}
      </Router>
    </ThemeProvider>
  )
}

export default App
