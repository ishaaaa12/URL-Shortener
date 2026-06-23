import request from "supertest";

import app from "../app.js";

async function run() {
  try {
    const res = await request(app)
      .get("/health");

    if (res.status !== 200) {
      throw new Error(
        "Health endpoint failed"
      );
    }

    console.log(
      "Health test passed"
    );

    process.exit(0);
  } catch (err) {
    console.error(err);

    process.exit(1);
  }
}

run();