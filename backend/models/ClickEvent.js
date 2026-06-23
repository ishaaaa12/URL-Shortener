import mongoose from "mongoose";

const clickEventSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      index: true,
    },

    country: String,
    city: String,

    browser: String,
    os: String,
    device: String,

    referrer: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ClickEvent",
  clickEventSchema
);