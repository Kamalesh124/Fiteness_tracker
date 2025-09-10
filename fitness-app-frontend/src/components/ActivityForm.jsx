"use client"

import { useState } from "react"
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Alert,
  Grid,
  Paper,
  Tooltip,
} from "@mui/material"
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Delete as DeleteIcon,
  Lightbulb as LightbulbIcon,
  Speed as SpeedIcon,
  FitnessCenter as FitnessCenterIcon,
  Timer as TimerIcon,
} from "@mui/icons-material"
import { addActivity } from "../services/api"

const ActivityForm = ({ onActivityAdded }) => {
  const [activity, setActivity] = useState({
    type: "RUNNING",
    duration: "",
    caloriesBurned: "",
    additionalMetrices: {},
  })

  const [showMetrics, setShowMetrics] = useState(false)
  const [newMetricKey, setNewMetricKey] = useState("")
  const [newMetricValue, setNewMetricValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const activityTypes = [
    { value: "RUNNING", label: "🏃‍♂️ Running", color: "#FF6B6B" },
    { value: "WALKING", label: "🚶‍♂️ Walking", color: "#4ECDC4" },
    { value: "CYCLING", label: "🚴‍♂️ Cycling", color: "#45B7D1" },
    { value: "SWIMMING", label: "🏊‍♂️ Swimming", color: "#96CEB4" },
    { value: "WEIGHT_TRAINNING", label: "🏋️‍♂️ Weight Lifting", color: "#FFEAA7" },
    { value: "YOGA", label: "🧘‍♂️ Yoga", color: "#DDA0DD" },
  ]

  // Suggested metrics for each activity type
  const suggestedMetrics = {
    RUNNING: [
      { key: "distance", label: "Distance (km)", placeholder: "e.g., 5.2", icon: "🏃", description: "Total distance covered" },
      { key: "pace", label: "Average Pace (min/km)", placeholder: "e.g., 5:30", icon: "⏱️", description: "Average time per kilometer" },
      { key: "heartRate", label: "Avg Heart Rate (bpm)", placeholder: "e.g., 150", icon: "❤️", description: "Average heart rate during run" },
      { key: "steps", label: "Step Count", placeholder: "e.g., 7500", icon: "👣", description: "Total number of steps" },
      { key: "elevation", label: "Elevation Gain (m)", placeholder: "e.g., 120", icon: "⛰️", description: "Total elevation climbed" },
    ],
    WALKING: [
      { key: "distance", label: "Distance (km)", placeholder: "e.g., 3.5", icon: "🚶", description: "Total distance walked" },
      { key: "steps", label: "Step Count", placeholder: "e.g., 5000", icon: "👣", description: "Total number of steps" },
      { key: "pace", label: "Average Pace (min/km)", placeholder: "e.g., 8:00", icon: "⏱️", description: "Average walking pace" },
      { key: "heartRate", label: "Avg Heart Rate (bpm)", placeholder: "e.g., 110", icon: "❤️", description: "Average heart rate" },
    ],
    CYCLING: [
      { key: "distance", label: "Distance (km)", placeholder: "e.g., 25.5", icon: "🚴", description: "Total distance cycled" },
      { key: "speed", label: "Avg Speed (km/h)", placeholder: "e.g., 22.5", icon: "💨", description: "Average cycling speed" },
      { key: "elevation", label: "Elevation Gain (m)", placeholder: "e.g., 450", icon: "⛰️", description: "Total elevation climbed" },
      { key: "cadence", label: "Average Cadence (rpm)", placeholder: "e.g., 85", icon: "🔄", description: "Pedal revolutions per minute" },
      { key: "maxSpeed", label: "Max Speed (km/h)", placeholder: "e.g., 45", icon: "🚀", description: "Maximum speed reached" },
    ],
    SWIMMING: [
      { key: "distance", label: "Distance (m)", placeholder: "e.g., 1500", icon: "🏊", description: "Total distance swum" },
      { key: "laps", label: "Number of Laps", placeholder: "e.g., 30", icon: "🔄", description: "Total laps completed" },
      { key: "stroke", label: "Primary Stroke", placeholder: "e.g., Freestyle", icon: "🏊", description: "Main swimming stroke used" },
      { key: "poolLength", label: "Pool Length (m)", placeholder: "e.g., 50", icon: "📏", description: "Length of swimming pool" },
      { key: "pace", label: "Pace (min/100m)", placeholder: "e.g., 2:15", icon: "⏱️", description: "Time per 100 meters" },
    ],
    WEIGHT_TRAINNING: [
      { key: "sets", label: "Number of Sets", placeholder: "e.g., 4", icon: "🔢", description: "Total number of sets" },
      { key: "reps", label: "Total Reps", placeholder: "e.g., 48", icon: "🔁", description: "Total repetitions across all sets" },
      { key: "weight", label: "Max Weight (kg)", placeholder: "e.g., 80", icon: "🏋️", description: "Maximum weight lifted" },
      { key: "restTime", label: "Rest Between Sets (min)", placeholder: "e.g., 2", icon: "⏸️", description: "Rest time between sets" },
      { key: "exercises", label: "Number of Exercises", placeholder: "e.g., 6", icon: "💪", description: "Different exercises performed" },
    ],
    YOGA: [
      { key: "poses", label: "Number of Poses", placeholder: "e.g., 15", icon: "🧘", description: "Different poses practiced" },
      { key: "style", label: "Yoga Style", placeholder: "e.g., Hatha", icon: "🕉️", description: "Type of yoga practiced" },
      { key: "difficulty", label: "Difficulty Level", placeholder: "e.g., Intermediate", icon: "📊", description: "Session difficulty level" },
      { key: "meditation", label: "Meditation Time (min)", placeholder: "e.g., 10", icon: "🧠", description: "Time spent in meditation" },
    ],
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Format the data to match backend expectations
      const activityData = {
        type: activity.type,
        duration: Number.parseInt(activity.duration), // Convert to integer
        caloriesBurned: Number.parseInt(activity.caloriesBurned), // Convert to integer
        startTime: new Date().toISOString(), // Add current timestamp
        additionalMetrices: activity.additionalMetrices,
      }

      console.log("Sending activity data:", activityData) // Debug log

      await addActivity(activityData)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      // Reset form
      setActivity({
        type: "RUNNING",
        duration: "",
        caloriesBurned: "",
        additionalMetrices: {},
      })

      onActivityAdded()
    } catch (error) {
      console.error("Error adding activity:", error)
      const errorMessage = error.response?.data?.message || error.message || "Failed to add activity"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const addMetric = () => {
    if (newMetricKey && newMetricValue) {
      setActivity((prev) => ({
        ...prev,
        additionalMetrices: {
          ...prev.additionalMetrices,
          [newMetricKey]: newMetricValue,
        },
      }))
      setNewMetricKey("")
      setNewMetricValue("")
    }
  }

  const removeMetric = (key) => {
    setActivity((prev) => {
      const newMetrics = { ...prev.additionalMetrices }
      delete newMetrics[key]
      return {
        ...prev,
        additionalMetrices: newMetrics,
      }
    })
  }

  // Add suggested metric with one click
  const addSuggestedMetric = (metric) => {
    if (!activity.additionalMetrices[metric.key]) {
      setActivity((prev) => ({
        ...prev,
        additionalMetrices: {
          ...prev.additionalMetrices,
          [metric.key]: "",
        },
      }))
    }
  }

  // Update metric value
  const updateMetricValue = (key, value) => {
    setActivity((prev) => ({
      ...prev,
      additionalMetrices: {
        ...prev.additionalMetrices,
        [key]: value,
      },
    }))
  }

  // Get current activity's suggested metrics
  const getCurrentSuggestedMetrics = () => {
    return suggestedMetrics[activity.type] || []
  }

  // Check if metric is already added
  const isMetricAdded = (metricKey) => {
    return activity.additionalMetrices.hasOwnProperty(metricKey)
  }

  const selectedActivity = activityTypes.find((type) => type.value === activity.type)

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 3,
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Add New Activity
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2, color: "white" }}>
            Activity added successfully! 🎉
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2, color: "white" }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: "white" }}>Activity Type</InputLabel>
            <Select
              value={activity.type}
              onChange={(e) => setActivity({ ...activity, type: e.target.value })}
              sx={{
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.3)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.5)",
                },
              }}
            >
              {activityTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        backgroundColor: type.color,
                      }}
                    />
                    {type.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Duration (Minutes)"
              type="number"
              value={activity.duration}
              onChange={(e) => setActivity({ ...activity, duration: e.target.value })}
              required
              inputProps={{ min: 1, max: 1440 }} // 1 minute to 24 hours
              sx={{
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                },
              }}
            />
            <TextField
              fullWidth
              label="Calories Burned"
              type="number"
              value={activity.caloriesBurned}
              onChange={(e) => setActivity({ ...activity, caloriesBurned: e.target.value })}
              required
              inputProps={{ min: 1, max: 10000 }} // Reasonable range
              sx={{
                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                },
              }}
            />
          </Box>

          <Button
            onClick={() => setShowMetrics(!showMetrics)}
            startIcon={showMetrics ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ color: "white", mb: 2 }}
          >
            Additional Metrics
          </Button>

          <Collapse in={showMetrics}>
            <Box sx={{ mb: 2, p: 2, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
              {/* Suggested Metrics Section */}
              {getCurrentSuggestedMetrics().length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <LightbulbIcon sx={{ color: "#FFD700", fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ color: "white", fontWeight: 600 }}>
                      Suggested Metrics for {selectedActivity?.label}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={1}>
                    {getCurrentSuggestedMetrics().map((metric) => (
                      <Grid item xs={12} sm={6} md={4} key={metric.key}>
                        <Tooltip title={metric.description} arrow>
                          <Paper
                            sx={{
                              p: 1.5,
                              backgroundColor: isMetricAdded(metric.key) 
                                ? "rgba(76, 175, 80, 0.2)" 
                                : "rgba(255,255,255,0.1)",
                              border: isMetricAdded(metric.key) 
                                ? "1px solid rgba(76, 175, 80, 0.5)" 
                                : "1px solid rgba(255,255,255,0.2)",
                              borderRadius: 2,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: isMetricAdded(metric.key) 
                                  ? "rgba(76, 175, 80, 0.3)" 
                                  : "rgba(255,255,255,0.2)",
                                transform: "translateY(-1px)",
                              },
                            }}
                            onClick={() => !isMetricAdded(metric.key) && addSuggestedMetric(metric)}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                              <Typography sx={{ fontSize: 16 }}>{metric.icon}</Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: "white", 
                                  fontWeight: 500,
                                  fontSize: "0.75rem",
                                  lineHeight: 1.2
                                }}
                              >
                                {metric.label}
                              </Typography>
                              {isMetricAdded(metric.key) && (
                                <Typography sx={{ color: "#4CAF50", fontSize: 12, ml: "auto" }}>✓</Typography>
                              )}
                            </Box>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: "rgba(255,255,255,0.6)", 
                                fontSize: "0.65rem",
                                display: "block"
                              }}
                            >
                              {metric.placeholder}
                            </Typography>
                          </Paper>
                        </Tooltip>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Added Metrics Section */}
              {Object.keys(activity.additionalMetrices).length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: "white", mb: 1, fontWeight: 600 }}>
                    Added Metrics
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(activity.additionalMetrices).map(([key, value]) => {
                      const suggestedMetric = getCurrentSuggestedMetrics().find(m => m.key === key)
                      return (
                        <Grid item xs={12} sm={6} key={key}>
                          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                            {suggestedMetric && (
                              <Typography sx={{ fontSize: 14 }}>{suggestedMetric.icon}</Typography>
                            )}
                            <TextField
                              label={suggestedMetric ? suggestedMetric.label : key}
                              value={value}
                              onChange={(e) => updateMetricValue(key, e.target.value)}
                              placeholder={suggestedMetric ? suggestedMetric.placeholder : "Enter value"}
                              size="small"
                              fullWidth
                              sx={{
                                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                                "& .MuiOutlinedInput-root": {
                                  color: "white",
                                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                                },
                              }}
                            />
                            <IconButton 
                              onClick={() => removeMetric(key)} 
                              sx={{ color: "rgba(255,255,255,0.7)" }}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      )
                    })}
                  </Grid>
                </Box>
              )}

              {/* Custom Metric Entry */}
              <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.1)", pt: 2 }}>
                <Typography variant="subtitle2" sx={{ color: "white", mb: 1, fontWeight: 600 }}>
                  Add Custom Metric
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    label="Metric Name"
                    value={newMetricKey}
                    onChange={(e) => setNewMetricKey(e.target.value)}
                    size="small"
                    sx={{
                      "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      },
                    }}
                  />
                  <TextField
                    label="Value"
                    value={newMetricValue}
                    onChange={(e) => setNewMetricValue(e.target.value)}
                    size="small"
                    sx={{
                      "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                      },
                    }}
                  />
                  <IconButton onClick={addMetric} sx={{ color: "white" }}>
                    <AddIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Collapse>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || !activity.duration || !activity.caloriesBurned}
            sx={{
              background: "rgba(255,255,255,0.2)",
              color: "white",
              borderRadius: 2,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              textTransform: "none",
              backdropFilter: "blur(10px)",
              "&:hover": {
                background: "rgba(255,255,255,0.3)",
              },
              "&:disabled": {
                background: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
              },
            }}
          >
            {loading ? "Adding..." : `Add ${selectedActivity?.label || "Activity"}`}
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ActivityForm