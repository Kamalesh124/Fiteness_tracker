"use client"

import { useState } from "react"
import { Box, Typography, AppBar, Toolbar, IconButton, Avatar, Menu, MenuItem, Container, Fade } from "@mui/material"
import { Logout as LogoutIcon, Person as PersonIcon, FitnessCenter as FitnessCenterIcon } from "@mui/icons-material"
import ActivityForm from "./ActivityForm"
import ActivityList from "./ActivityList"

const Dashboard = ({ user, onLogout }) => {
  const [anchorEl, setAnchorEl] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleActivityAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <AppBar
        position="sticky"
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}>
            <FitnessCenterIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              FitTracker
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1">Welcome, {user?.given_name || user?.name || "User"}!</Typography>
            <IconButton onClick={handleMenuOpen} sx={{ color: "white" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "rgba(255,255,255,0.2)" }}>
                <PersonIcon />
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose()
                onLogout()
              }}
            >
              <LogoutIcon sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Fade in timeout={500}>
          <Box>
            <ActivityForm onActivityAdded={handleActivityAdded} />
            <ActivityList refreshTrigger={refreshTrigger} />
          </Box>
        </Fade>
      </Container>
    </Box>
  )
}

export default Dashboard
