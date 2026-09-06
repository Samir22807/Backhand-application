import dotenv from "dotenv";
import connectDB from "./db/dbindex.js";

dotenv.config({path: "./.env"});

connectDB();