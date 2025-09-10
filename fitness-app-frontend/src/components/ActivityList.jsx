"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Skeleton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Snackbar,
} from "@mui/material"
import {
  DirectionsRun as RunIcon,
  DirectionsWalk as WalkIcon,
  DirectionsBike as BikeIcon,
  Pool as SwimIcon,
  FitnessCenter as GymIcon,
  SelfImprovement as YogaIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
import { getActivities, deleteActivity } from "../services/api"

const ActivityList = ({ refreshTrigger }) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, activity: null })
  const [deleting, setDeleting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })
  const navigate = useNavigate()

  const activityIcons = {
    RUNNING: { icon: RunIcon, color: "#FF6B6B", gradient: "linear-gradient(135deg, #FF6B6B, #FF8E8E)" },
    WALKING: { icon: WalkIcon, color: "#4ECDC4", gradient: "linear-gradient(135deg, #4ECDC4, #6EDDD6)" },
    CYCLING: { icon: BikeIcon, color: "#45B7D1", gradient: "linear-gradient(135deg, #45B7D1, #67C5DA)" },
    SWIMMING: { icon: SwimIcon, color: "#96CEB4", gradient: "linear-gradient(135deg, #96CEB4, #A8D5C4)" },
    WEIGHTLIFTING: { icon: GymIcon, color: "#FFEAA7", gradient: "linear-gradient(135deg, #FFEAA7, #FFECB7)" },
    YOGA: { icon: YogaIcon, color: "#DDA0DD", gradient: "linear-gradient(135deg, #DDA0DD, #E5B0E5)" },
  }

  const fetchActivities = async () => {
    try {
      const response = await getActivities()
      setActivities(response.data)
    } catch (error) {
      console.error("Error fetching activities:", error)
      setSnackbar({ open: true, message: "Failed to load activities", severity: "error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [refreshTrigger])

  const handleDeleteClick = (activity, event) => {
    event.stopPropagation() // Prevent card click
    setDeleteDialog({ open: true, activity })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.activity) return

    setDeleting(true)
    try {
      await deleteActivity(deleteDialog.activity.id)
      setActivities((prev) => prev.filter((activity) => activity.id !== deleteDialog.activity.id))
      setSnackbar({ open: true, message: "Activity deleted successfully! 🗑️", severity: "success" })
    } catch (error) {
      console.error("Error deleting activity:", error)
      const errorMessage = error.response?.data?.message || "Failed to delete activity"
      setSnackbar({ open: true, message: errorMessage, severity: "error" })
    } finally {
      setDeleting(false)
      setDeleteDialog({ open: false, activity: null })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, activity: null })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(6)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Your Activities ({activities.length})
      </Typography>

      <Grid container spacing={3}>
        {activities.map((activity, index) => {
          const activityConfig = activityIcons[activity?.type] || activityIcons.RUNNING
          const IconComponent = activityConfig.icon

          return (
            <Grid item xs={12} sm={6} md={4} key={activity.id}>
              <Fade in timeout={300 + index * 100}>
                <Card
                  sx={{
                    borderRadius: 3,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    background: activityConfig.gradient,
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "100px",
                      height: "100px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "50%",
                      transform: "translate(30px, -30px)",
                    },
                  }}
                  onClick={() => navigate(`/activities/${activity.id}`)}
                >
                  <CardContent sx={{ position: "relative", zIndex: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconComponent sx={{ fontSize: 32 }} />
                        <Typography variant="h6" fontWeight="bold">
                          {activity.type
                            ? activity.type.charAt(0) + activity.type.slice(1).toLowerCase()
                            : "Unknown Activity"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/activities/${activity.id}`)
                          }}
                          sx={{
                            color: "white",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.3)" },
                          }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleDeleteClick(activity, e)}
                          sx={{
                            color: "white",
                            backgroundColor: "rgba(255,0,0,0.3)",
                            "&:hover": { backgroundColor: "rgba(255,0,0,0.5)" },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                      <Chip
                        label={`${activity.duration} min`}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.2)",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        label={`${activity.caloriesBurned} cal`}
                        size="small"
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.2)",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    {activity.additionalMetrices && Object.keys(activity.additionalMetrices).length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mb: 0.5 }}>
                          Additional Metrics:
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                          {Object.entries(activity.additionalMetrices)
                            .slice(0, 2)
                            .map(([key, value]) => (
                              <Chip
                                key={key}
                                label={`${key}: ${value}`}
                                size="small"
                                sx={{
                                  backgroundColor: "rgba(255,255,255,0.15)",
                                  color: "white",
                                  fontSize: "0.7rem",
                                }}
                              />
                            ))}
                          {Object.keys(activity.additionalMetrices).length > 2 && (
                            <Chip
                              label={`+${Object.keys(activity.additionalMetrices).length - 2} more`}
                              size="small"
                              sx={{
                                backgroundColor: "rgba(255,255,255,0.15)",
                                color: "white",
                                fontSize: "0.7rem",
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {formatDate(activity.createdAt)}
                    </Typography>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          )
        })}
      </Grid>

      {activities.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            color: "text.secondary",
          }}
        >
          <Typography variant="h6" gutterBottom>
            No activities yet
          </Typography>
          <Typography variant="body2">Add your first activity to get started!</Typography>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Activity</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {deleteDialog.activity?.type?.toLowerCase()} activity? This action
            cannot be undone.
          </Typography>
          {deleteDialog.activity && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>{deleteDialog.activity.type}</strong> - {deleteDialog.activity.duration} min,{" "}
                {deleteDialog.activity.caloriesBurned} cal
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(deleteDialog.activity.createdAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ActivityList
