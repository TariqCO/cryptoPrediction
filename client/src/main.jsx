import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";

import { Provider } from "react-redux";
import "./index.css";
import App from "./App.jsx";
import { store } from "./redux/store/store.js";
import { setTopics } from "./redux/feature/predictionTopicSlice.js";
import { fetchAllCryptoCoins } from "./api/crypto.js";



fetchAllCryptoCoins()
  .then((data) => store.dispatch(setTopics(Array.isArray(data) ? data : data.data)))
  .catch((err) => console.error("Failed to load topics:", err));


createRoot(document.getElementById("root")).render(

    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
 
);
