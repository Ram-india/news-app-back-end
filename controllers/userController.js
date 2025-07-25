import User from '../models/User.js';   

export const getUserProfile = async (req,res) => {
    try{
        const user = await User.findById(req.user.userId).select('emailLogs');
        if(!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ emailLogs: user.emailLogs });
    }catch (error){
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Failed to fetch user profile" });
    }
};
