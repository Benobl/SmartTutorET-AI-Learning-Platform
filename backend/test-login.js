import axios from "axios";

const testLogin = async () => {
  try {
    const response = await axios.post(
      "http://localhost:5001/api/auth/login",
      {
        email: "nebilbromance@gmail.com",
        password: "password123"
      }
    );

    console.log("Status:", response.status);
    console.log("Set-Cookie:", response.headers["set-cookie"]);
  } catch (error) {
    console.log("Error:", error.response?.data || error.message);
  }
};

testLogin();
