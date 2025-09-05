import cron from "node-cron";
import { sendCategoryNewsEmails } from "../controllers/emailController.js";

// Every hour
cron.schedule("0 * * * *", async () => {
  console.log(" Running hourly news email job...");
  await sendCategoryNewsEmails("hourly");
});

// Every day at 8 AM
cron.schedule("0 8 * * *", async () => {
  console.log(" Running daily news email job...");
  await sendCategoryNewsEmails("daily");
});

// Every Monday at 8 AM
cron.schedule("0 8 * * 1", async () => {
  console.log("Running weekly news email job...");
  await sendCategoryNewsEmails("weekly");
});

console.log(" Email scheduler is active...");