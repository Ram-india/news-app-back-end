// controllers/preferenceController.js

import User from "../models/User.js";

export const getPreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    res.status(200).json({
      preferences: user.preferences || [],
      alertFrequency: user.alertFrequency,
      
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res.status(500).json({ message: "Failed to fetch preferences" });
  }
};
export const savePreferences = async (req, res) => {
  try {
    const { preferences, alertFrequency } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.preferences = preferences || user.preferences;
    user.alertFrequency = alertFrequency || user.alertFrequency;
    await user.save();
 
    
    // res.json({ message: "Preferences saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving preferences", error });
  }
};