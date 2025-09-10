"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material"
import { Visibility, VisibilityOff, FitnessCenter } from "@mui/icons-material"
import { loginUser, registerUser, clearError } from "../store/authSlice"

const AuthForm = () => {
  const dispatch = useDispatch()
  const { isLoading, error } = useSelector((state) => state.auth)

  const [tabValue, setTabValue] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
    setRegistrationSuccess(false)
    dispatch(clearError())
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    })
  }

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    dispatch(clearError())

    if (tabValue === 1) {
      // Register
      if (formData.password !== formData.confirmPassword) {
        return
      }

      const result = await dispatch(
        registerUser({
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
        }),
      )

      if (registerUser.fulfilled.match(result)) {
        setRegistrationSuccess(true)
        setTabValue(0) // Switch to login tab
        setFormData({
          username: formData.username, // Keep username for easy login
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
        })
      }
    } else {
      // Login
      dispatch(
        loginUser({
          username: formData.username,
          password: formData.password,
        }),
      )
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: "100%",
          borderRadius: 3,
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
            p: 3,
            textAlign: "center",
            color: "white",
          }}
        >
          <FitnessCenter sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold">
            FitTracker
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Your Personal Fitness Journey
          </Typography>
        </Box>

        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
              },
            }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {registrationSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Registration successful! Your account has been created in both Keycloak and our system. Please login
                with your credentials.
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {tabValue === 1 && (
                <>
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange("firstName")}
                      required
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange("lastName")}
                      required
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    required
                    sx={{ mb: 2 }}
                  />
                </>
              )}

              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={handleInputChange("username")}
                required
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange("password")}
                required
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {tabValue === 1 && (
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  required
                  error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ""}
                  helperText={
                    formData.password !== formData.confirmPassword && formData.confirmPassword !== ""
                      ? "Passwords do not match"
                      : ""
                  }
                  sx={{ mb: 3 }}
                />
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading || (tabValue === 1 && formData.password !== formData.confirmPassword)}
                sx={{
                  background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #FE6B8B 60%, #FF8E53 100%)",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : tabValue === 0 ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AuthForm
