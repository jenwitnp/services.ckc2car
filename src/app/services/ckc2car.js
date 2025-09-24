import axios from "axios";

// Use NEXT_PUBLIC_ prefix for client-side compatibility
const CLIENT_ID = process.env.NEXT_PUBLIC_CKC_CLIENT_ID;
const BASE_URL = process.env.NEXT_PUBLIC_CKC_URL || "http://localhost";
// const BASE_URL = "http://localhost";

const ckc2carService = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Clientid: CLIENT_ID,
  },
});

export default ckc2carService;
