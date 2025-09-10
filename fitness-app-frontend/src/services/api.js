import axios from "axios"

const API_URL = "http://localhost:8085/api"

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const userId = localStorage.getItem("userId")
    const token = localStorage.getItem("token")

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    if (userId) {
      config.headers["X-User-ID"] = userId
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("userId")
      window.location.href = "/"
    }
    return Promise.reject(error)
  },
)

export const getActivities = () => api.get("/activities")
export const addActivity = (activity) => api.post("/activities", activity)
export const getActivityDetail = (id) => api.get(`/recommendations/activity/${id}`)
export const deleteActivity = (id) => api.delete(`/activities/${id}`)
