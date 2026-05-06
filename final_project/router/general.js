const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
//const axios = require('axios');

// چک کردن اینکه آیا کاربر از قبل وجود دارد یا خیر
const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}

// ثبت‌نام کاربر جدید
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // ۱. بررسی ارائه شدن نام کاربری و رمز عبور
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // ۲. بررسی تکراری نبودن نام کاربری
    if (doesExist(username)) {
        return res.status(409).json({ message: "User already exists!" });
    }

    // ۳. افزودن کاربر جدید به لیست
    users.push({ "username": username, "password": password });
    
    return res.status(200).json({ 
        message: "User successfully registered. Now you can login" 
    });
 
});

//Get the book list available in the shop
public_users.get('/', async function (req, res) {
    const getBooks = new Promise((resolve) => {
        resolve(books);
    });

    try {
        const booksList = await getBooks;
        res.status(200).send(JSON.stringify(booksList, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error fetching books" });
    }
});



//  Get book details based on ISBN using Promises/Async-Await 
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    // ایجاد یک Promise برای شبیه‌سازی عملیات ناهمگام
    const findBookByIsbn = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ status: 404, message: "Book not found" });
        }
    });

    // مدیریت نتیجه Promise
    findBookByIsbn
        .then((book) => {
            res.status(200).send(JSON.stringify(book, null, 4));
        })
        .catch((error) => {
            res.status(error.status || 500).json({ message: error.message });
        });
});
  




//Get book details based on Author using Promise callbacks
public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;

    // ۱. ایجاد یک Promise برای شبیه‌سازی عملیات ناهمگام جستجو
    const findBooksByAuthor = new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        const filteredBooks = [];

        // جستجو در میان تمام کتاب‌ها
        bookKeys.forEach(key => {
            if (books[key].author === author) {
                filteredBooks.push({ isbn: key, ...books[key] });
            }
        });

        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject({ status: 404, message: "No books found by this author" });
        }
    });

    // ۲. استفاده از .then() و .catch() برای مدیریت نتیجه
    findBooksByAuthor
        .then((result) => {
            return res.status(200).send(JSON.stringify(result, null, 4));
        })
        .catch((error) => {
            return res.status(error.status || 500).json({ message: error.message });
        });
});



// Get all books based on title
// Task 13: Get book details based on Title using Promise callbacks
public_users.get('/title/:title', function (req, res) {
    const title = req.params.title;

    // ۱. ایجاد Promise برای شبیه‌سازی عملیات ناهمگام
    const findBooksByTitle = new Promise((resolve, reject) => {
        const bookKeys = Object.keys(books);
        const filteredBooks = [];

        // پیمایش دیتابیس برای پیدا کردن کتاب‌هایی با عنوان مشابه
        bookKeys.forEach(key => {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                filteredBooks.push({ isbn: key, ...books[key] });
            }
        });

        if (filteredBooks.length > 0) {
            resolve(filteredBooks);
        } else {
            reject({ status: 404, message: "No books found with this title" });
        }
    });

    // ۲. مدیریت نتیجه با استفاده از Callbackهای Promise
    findBooksByTitle
        .then((result) => {
            res.status(200).send(JSON.stringify(result, null, 4));
        })
        .catch((error) => {
            res.status(error.status || 500).json({ message: error.message });
        });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    // 1. استخراج ISBN از پارامترهای درخواست
    const isbn = req.params.isbn;

    // 2. پیدا کردن کتاب مورد نظر در آبجکت books
    const book = books[isbn];

    // 3. بررسی وجود کتاب و ارسال بخش نظرات
    if (book) {
        // بازگرداندن فقط بخش نظرات (reviews) مربوط به آن کتاب
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        // اگر کتابی با این ISBN پیدا نشد
        return res.status(404).json({ message: "No reviews found. Book not found." });
    }
});

module.exports.general = public_users;
