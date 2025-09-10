"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Chip,
  IconButton,
  Skeleton,
  Alert,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from "@mui/material"
import {
  ArrowBack as ArrowBackIcon,
  DirectionsRun as RunIcon,
  DirectionsWalk as WalkIcon,
  DirectionsBike as BikeIcon,
  Pool as SwimIcon,
  FitnessCenter as GymIcon,
  SelfImprovement as YogaIcon,
  TrendingUp as TrendingUpIcon,
  Lightbulb as LightbulbIcon,
  Security as SecurityIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material"
import { getActivityDetail, deleteActivity } from "../services/api"

const ActivityDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" })

  const activityIcons = {
    RUNNING: { icon: RunIcon, color: "#FF6B6B", gradient: "linear-gradient(135deg, #FF6B6B, #FF8E8E)" },
    WALKING: { icon: WalkIcon, color: "#4ECDC4", gradient: "linear-gradient(135deg, #4ECDC4, #6EDDD6)" },
    CYCLING: { icon: BikeIcon, color: "#45B7D1", gradient: "linear-gradient(135deg, #45B7D1, #67C5DA)" },
    SWIMMING: { icon: SwimIcon, color: "#96CEB4", gradient: "linear-gradient(135deg, #96CEB4, #A8D5C4)" },
    WEIGHTLIFTING: { icon: GymIcon, color: "#FFEAA7", gradient: "linear-gradient(135deg, #FFEAA7, #FFECB7)" },
    YOGA: { icon: YogaIcon, color: "#DDA0DD", gradient: "linear-gradient(135deg, #DDA0DD, #E5B0E5)" },
  }

  useEffect(() => {
    let isMounted = true
    let retries = 0
    const maxRetries = 10

    const fetchActivityDetail = async () => {
      try {
        const response = await getActivityDetail(id)
        if (!isMounted) return
        setActivity(response.data)
        setError(null)
        setLoading(false)
      } catch (error) {
        if (!isMounted) return

        if (error.response?.status === 404 || error.response?.status === 500) {
          retries++
          if (retries < maxRetries) {
            setTimeout(fetchActivityDetail, 1500 * retries)
          } else {
            setError("Activity details are still processing. Please check back shortly.")
            setLoading(false)
          }
        } else {
          setError("Failed to load activity details.")
          setLoading(false)
        }
      }
    }

    fetchActivityDetail()

    return () => {
      isMounted = false
    }
  }, [id])

  const handleDeleteClick = () => setDeleteDialog(true)

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await deleteActivity(id)
      setSnackbar({ open: true, message: "Activity deleted successfully! 🗑️", severity: "success" })
      setTimeout(() => {
        navigate("/activities")
      }, 1500)
    } catch (error) {
      console.error("Error deleting activity:", error)
      const errorMessage = error.response?.data?.message || "Failed to delete activity"
      setSnackbar({ open: true, message: errorMessage, severity: "error" })
    } finally {
      setDeleting(false)
      setDeleteDialog(false)
    }
  }

  const handleDeleteCancel = () => setDeleteDialog(false)

  if (loading) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  if (!activity) {
    return (
      <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
        <Alert severity="info">Activity not found</Alert>
      </Box>
    )
  }

  const activityConfig = activityIcons[activity?.type] || activityIcons.RUNNING
  const IconComponent = activityConfig.icon

  const getGrade = () => {
    const calPerMin = +activity.caloriesBurned / +activity.duration
    if (!Number.isFinite(calPerMin)) return "N/A"
    if (calPerMin >= 15) return "A+"
    if (calPerMin >= 10) return "A"
    if (calPerMin >= 5) return "B"
    return "C"
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => navigate("/activities")} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          {/* <Typography variant="h4" fontWeight="bold">Activity Details</Typography> */}
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDeleteClick}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Delete Activity
        </Button>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3, background: activityConfig.gradient, color: "white", position: "relative", overflow: "hidden" }}>
        <Box sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "150px",
          height: "150px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          transform: "translate(50px, -50px)",
        }} />
        <CardContent sx={{ position: "relative", zIndex: 1, p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <TrendingUpIcon sx={{ fontSize: 48 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Activity Analysis
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                {new Date(activity.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {activity.additionalMetrices && Object.keys(activity.additionalMetrices).length > 0 && (
        <Card sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Additional Metrics</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {Object.entries(activity.additionalMetrices).map(([key, value]) => (
                <Chip key={key} label={`${key}: ${value}`} variant="outlined" sx={{ fontWeight: 600 }} />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {activity.recommendation && (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <LightbulbIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">AI Recommendations</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="h6" fontWeight="bold">Analysis</Typography>
              </Box>
              <Typography paragraph sx={{ pl: 4 }}>{activity.recommendation}</Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            {activity.improvements && activity.improvements.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>💪 Improvements</Typography>
                {activity.improvements.map((improvement, index) => (
                  <Typography key={index} paragraph sx={{ pl: 2 }}>• {improvement}</Typography>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {activity.suggestions && activity.suggestions.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>💡 Suggestions</Typography>
                {activity.suggestions.map((suggestion, index) => (
                  <Typography key={index} paragraph sx={{ pl: 2 }}>• {suggestion}</Typography>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {activity.safety && activity.safety.length > 0 && (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <SecurityIcon color="warning" />
                  <Typography variant="h6" fontWeight="bold">Safety Guidelines</Typography>
                </Box>
                {activity.safety.map((safety, index) => (
                  <Typography key={index} paragraph sx={{ pl: 4 }}>• {safety}</Typography>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteDialog} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Activity</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {activity?.type?.toLowerCase()} activity? This action cannot be undone.
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>{activity?.type}</strong> - {activity?.duration} min, {activity?.caloriesBurned} cal
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(activity?.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ActivityDetail
