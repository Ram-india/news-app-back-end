import cron from "node-cron";
import { sendCategoryNewsEmails } from "../controllers/emailController.js";

cron.schedule("0 * * * *", async () => {
  console.log("⏰ Running hourly news email job...");
  try {
    await sendCategoryNewsEmails("hourly");
    console.log("✅ Hourly job completed successfully!");
  } catch (err) {
    console.error("❌ Hourly job failed:", err.message);
  }
});

cron.schedule("0 8 * * *", async () => {
  console.log("🌅 Running daily news email job...");
  try {
    await sendCategoryNewsEmails("daily");
    console.log("✅ Daily job completed successfully!");
  } catch (err) {
    console.error("❌ Daily job failed:", err.message);
  }
});

console.log("✅ Email scheduler active");