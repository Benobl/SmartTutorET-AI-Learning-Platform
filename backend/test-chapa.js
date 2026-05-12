import axios from "axios";
import "dotenv/config";

const test = async () => {
  try {
    console.log("CHAPA_SECRET_KEY:", process.env.CHAPA_SECRET_KEY);
    
    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount: "100",
        currency: "ETB",
        email: "nebilbromance@gmail.com",
        first_name: "Nebil",
        last_name: "Bromance",
        tx_ref: "test-" + Date.now(),
        return_url: "http://localhost:3000"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Response:", response.data);
  } catch (error) {
    console.log("Error:", error.response?.data || error.message);
  }
};

test();
