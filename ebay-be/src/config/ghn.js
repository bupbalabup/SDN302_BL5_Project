import axios from "axios";

const ghnAxios = axios.create({
  baseURL: process.env.GHN_BASE_URL,
  headers: {
    Token: process.env.GHN_API_TOKEN,
    ShopId: process.env.GHN_SHOP_ID,
    "Content-Type": "application/json",
  },
});

export default ghnAxios;