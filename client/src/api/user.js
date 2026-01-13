import { clearCurrentUser } from "../redux/feature/userSlice";
import api from "./api";

// Register User

export const authUser = async (endpoint, body) => {
  const { data } = await api.post(`/user${endpoint}`, body, {
    withCredentials: true,
  });
  return data;
};

export const fetchCurrentUser = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  const { data } = await api.get("/user/secure");
  return data.user;
};

export const usersPrediction = async () => {
  const res = await api.get("/user/myPredictions", { withCredentials: true });
  return res.data;
};

export const deletePrediction = async (slug, timeframe) => {
  const res = await api.delete(`/user/delete/${slug}/${timeframe}`, {
    withCredentials: true,
  });

  return res;
};


export const logoutUser = async (dispatch) => {
  try {
    const res = await api.post("/logout");
    return res;
  } finally {
    localStorage.removeItem("accessToken");
    dispatch(clearCurrentUser());
    window.location.href = "/login";
  }
};
