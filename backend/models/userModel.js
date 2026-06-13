import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
    authProvider: {
        type: String,
        default: 'local'
    },
    cartData: {
        type: Object,
        default: {}
    },
    address: {
        type: Object,
        default: {}
    },
    addresses: {
        type: Array,
        default: []
    },
    defaultAddressId: {
        type: String,
        default: ''
    }
} , {minimize: false});

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
