import Message from "../models/Messages.js";
import User from "../models/User.js";
// import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";


export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserID = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserID } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getAllContacts controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getMessagesByUserID = async (req, res) => {
    try {
        const myId = req.user._id;
        const { id: userToChatId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId }
            ]
        })

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getAllContacts controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!text && !image) {
            return res.status(400).json({ message: "Text or image is required." });
        }
        if (senderId.equals(receiverId)) {
            return res.status(400).json({ message: "Cannot send messages to yourself." });
        }
        const receiverExists = await User.exists({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({ message: "Receiver not found." });
        }

        let imageURL;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageURL = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageURL
        })

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const getChatPartners = async (req, res) => {
    try {
        const loggedInUserID = req.user._id;

        //find all the messages where the logged in user is the sender or the receiver
        const messages = await Message.find({
            $or: [
                { senderId: loggedInUserID },
                { receiverId: loggedInUserID }
            ]
        });

        const chatPartnerIds = [...new Set(messages.map(msg => msg.senderId.toString() === loggedInUserID ? msg.receiverId.toString() : msg.senderId.toString()))];

        const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");
        res.status(200).json(chatPartners);
    } catch (error) {
        console.log("Error in getAllContacts controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
