import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function test() {
  for (let i = 1; i <= 15; i++) {
    try {
      const res = await axios.post(`${process.env.BASE_URL}/shorten`, {
        originalUrl: "https://example.com",
      });

      console.log(i, "Allowed", res.status);
    } catch (err) {
      console.log(i, err.code, err.message);

      if (err.response) {
        console.log(err.response.data);
      }
    }
  }
}

test();
