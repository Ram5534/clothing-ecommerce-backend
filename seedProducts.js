require('dotenv').config()
const Product = require("./models/Product");
const connectDB = require("./config/db");

connectDB();

const data = [
  {title:"T-Shirt",price:499,brand:"Nike",category:"Men",stock:10,image:"uploads/tshirt.jpg"},
  {title:"Shoes",price:1999,brand:"Adidas",category:"Men",stock:5,image:"uploads/shoes.jpg"},
  {title:"Hoodie",price:899,brand:"Puma",category:"Men",stock:7,image:"uploads/hoodie.jpg"}
];

async function seed(){
  await Product.deleteMany();
  await Product.insertMany(data);
  console.log("Seed done");
  process.exit();
}

seed();
