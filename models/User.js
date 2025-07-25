import mongoose from 'mongoose';
import bcrypt from'bcryptjs';

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows for unique values while permitting nulls
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    preferences:{
        type:[String],
        default: [],
    },
    alertFrequency: {
        type: String,
        enum: ['immediate', 'hourly', 'daily'],
        default: 'daily',
      },
    emailLogs:[
        {
            category: String,
            subject: String,
            sentAt: {
              type: Date,
              default: Date.now,
            },
          },
    ]

    
});

// Hash password before saving
userSchema.pre('save', async function(next) {
if(!this.isModified('password')) {
    return next();
}
this.password = await bcrypt.hash(this.password, 10);
next();

});
// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Export the User model
const User = mongoose.model('User', userSchema);

export default User;

