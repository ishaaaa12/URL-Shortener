import redisClient, {
  connectRedis,
} from "../config/redis.js";

async function run() {
  try {
    await connectRedis();

    await redisClient.set(
      "ci:test",
      "hello"
    );

    const value =
      await redisClient.get(
        "ci:test"
      );

    if (value !== "hello") {
      throw new Error(
        "Redis test failed"
      );
    }

    await redisClient.del(
      "ci:test"
    );

    console.log(
      "Redis test passed"
    );

    process.exit(0);
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

run();