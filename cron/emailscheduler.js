// cron/emailscheduler.js
import cron from "node-cron";
import { sendCategoryNewsEmails } from "../controllers/emailController.js";

// Every hour
cron.schedule("0 * * * *", async () => {
  console.log("Running hourly news email job...");
  await sendCategoryNewsEmails("hourly");
});

// Every day at 8 AM
cron.schedule("0 8 * * *", async () => {
  console.log("Running daily news email job...");
  await sendCategoryNewsEmails("daily");
});

// IMMEDIATE is triggered manually via API when breaking news occurs
console.log("Email scheduler active");