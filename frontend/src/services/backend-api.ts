import axios from "axios";

export const backendApi = axios.create({
  baseURL: "https://fast-forest-42728.herokuapp.com/api",
});
