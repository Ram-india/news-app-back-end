import cron from "node-cron";
import { sendCategoryNewsEmails } from "../controllers/emailController.js";
// Every hour
cron.schedule("0 * * * *", async () => {
    await sendCategoryNewsEmails("hourly");
  });
  
  // Every day at 8 AM
  cron.schedule("0 8 * * *", async () => {
    await sendCategoryNewsEmails("daily");
  });
  
  // For "immediate", you’ll likely trigger it on-demand, like when breaking news arrives.