const jwt = require("jsonwebtoken");
const supabase = require("../config/db");
require("dotenv").config();

const authenticate = async (req) => {
  const token = req.headers.authorization || "";

  if (token) {
    try {
      console.log("Current time:", new Date());
      console.log(token);
      const decodedToken = jwt.decode(token);
      console.log(decodedToken);
      if (decodedToken && decodedToken.exp) {
        const expirationDate = new Date(decodedToken.exp * 1000); // Convert from seconds to milliseconds
        console.log("Token expiration time:", expirationDate);
      } else {
        console.log("Token does not have an expiration time.");
      }

      const decoded = jwt.verify(
        token.replace("Bearer ", ""),
        process.env.JWT_SECRET
      );

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", decoded.id)
        .single();

      if (error) {
        throw new Error("Your session expired. Please log in again.");
      }

      return data;
    } catch (err) {
      console.error("JWT Authentication Error:", err);
      return null;
    }
  }

  return null;
};

module.exports = authenticate;
