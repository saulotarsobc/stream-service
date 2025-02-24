import axios from "axios";
// import { parseCookies } from "nookies";

// const { "token-llbi-leads": token } = parseCookies();

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// if (token) {
//   api.defaults.headers["Authorization"] = `Bearer ${token}`;
// }
