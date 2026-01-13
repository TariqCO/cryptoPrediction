// src/api/predictions.js
import api from "./api";

// Create a prediction
export const submitPrediction = async ({
  heading,
  slug,
  symbol,
  prediction,
}) => {

  const res = await api.post(
    "/crypto",
    {
      heading,
      slug,
      symbol,
      prediction,
    },
 
  );
  return res.data;
};


export const fetchPredictionsByTopic = async () => {
  const res = await api.get(`/crypto`);
  return res;
};



export const fetchAllCryptoCoins = async () => {
  const res = await api.get("/crypto/", );
  return res.data;
};




export const fetchPredictionsBySlug = async (slug, timeframe) => {
  const res = await api.get(`/crypto/${slug}/${timeframe}`, {
    withCredentials: true,
  });
  return res.data;
};
