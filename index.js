const express = require("express");
const axios = require("axios");
const app = express();
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();
app.use(express.json());

const HASURA_URL = process.env.HASURA_URL;
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

app.post("/deposit", async (req, res) => {
  const { userId, amount } = req.body;
  try {
    const result = await axios.post(
      HASURA_URL,
      {
        query: `
          mutation($userId: Int!, $amount: Int!) {
            insert_transactions(objects: {user_id: $userId, amount: $amount, type: "deposit"}) {
              returning {
                id
              }
            }
            update_accounts(where: {user_id: {_eq: $userId}}, _inc: {balance: $amount}) {
              returning {
                balance
              }
            }
          }
        `,
        variables: { userId, amount },
      },
      {
        headers: {
          "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
        },
      }
    );
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/withdraw", async (req, res) => {
  const { userId, amount } = req.body;
  const withdrawalAmount = -Math.abs(amount);

  try {
    const result = await axios.post(
      HASURA_URL,
      {
        query: `
          mutation Withdraw($userId: Int!, $amount: Int!) {
            insert_transactions(objects: {user_id: $userId, amount: $amount, type: "withdrawal"}) {
              returning {
                id
              }
            }
            update_accounts(where: {user_id: {_eq: $userId}}, _inc: {balance: $amount}) {
              returning {
                balance
              }
            }
          }
        `,
        variables: { userId, amount: withdrawalAmount },
      },
      {
        headers: {
          "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
        },
      }
    );
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
