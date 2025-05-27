import express from "express";
import cloudinary from "../lib/cloudinary.js";
import protectRoute from "../middleware/auth.middleware.js";
import Book from "../models/Book.js";
const router = express.Router();

//create a book
router.post("/", protectRoute, async (req, res) => {
   try {
    const { title, caption, rating, image } = req.body;

    // Validate the input
    if (!image || !title || !caption || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //upload image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    // Create a new book object
    const newBook = new Book ({
        title,
        caption,
        rating,
        image: imageUrl,
        user: req.user._id, // Assuming req.user is set by the protectRoute middleware
      });

    await newBook.save();
    res.status(201).json(newBook)
    } catch (error) {
        console.log("Error creating book:", error);
        res.status(500).json({ message: error });
    }
  });
//example
// const response = await fetch("http://localhost:3000/api/books?page=3&limit=5"), {


//pagination => infinite scroll
router.get("/", protectRoute, async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)


        const totalBooks = await Book.countDocuments();

        res.send({
          books,
          currentPage: page,
          totalBooks,
          totalPages: Math.ceil(totalBooks / limit),
        });
    } catch (error) {
        console.log("Error fetching books:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
//get recommended books
router.get("/recommended", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({user: req.user._id}).sort({ createdAt: -1 })
        res.json(books);
    } catch (error) {
        console.log("Get user books error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});
//delete a book
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        if (book.user.toString() !== req.user._id.toString()) 
          return res.status(401).json({ message: "Unauthorized" });

        // Delete the book on Cloudinary
        if (book.image && book.image.includes("cloudinary")) {
            await cloudinary.uploader.destroy(book.image.public_id);
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.error("Error deleting image from Cloudinary:", deleteError);
            }
        }
        await Book.deleteOne();

        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.log("Error deleting book:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;