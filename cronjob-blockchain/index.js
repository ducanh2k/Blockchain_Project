const express = require("express");
const mongoose = require("mongoose");
const schedule = require("node-schedule");
const ethers = require("ethers");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

// MongoDB setup
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Define User schema for MetaMask login
const userSchema = new mongoose.Schema({
  publicAddress: { type: String, unique: true, required: true },
  nonce: { type: Number, default: () => Math.floor(Math.random() * 1000000) },
});

const User = mongoose.model("User", userSchema);

// Define the Transaction schema
const transactionSchema = new mongoose.Schema({
  user: String,
  amount: String,
  depositTime: Date,
  eventType: String,
  transactionHash: { type: String, unique: true },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

const JWT_SECRET = process.env.JWT_SECRET || "qkeTOR5lJ6dguqhHF6PuyI9x5HG9WhJZ";

// Blockchain interaction setup
const provider = new ethers.JsonRpcProvider(
  "https://bsc-testnet.infura.io/v3/a4f44717a79d4c159f24bb89bc2642dd"
);
const contractAddress = "0xFA59E603266fe375287fEc7fc027b2B502f05286";
const abi = [
  "event DepositMade(address indexed user, uint256 amount, uint256 depositTime)",
  "event Withdraw(address indexed user, uint256 amount)",
  "event RewardClaimed(address indexed user, uint256 reward)",
  "function deposit(uint256 _amount) public",
  "function withdraw(uint256 _amount) external",
  "function balanceOf(address account) external view returns (uint256)",
];

const contract = new ethers.Contract(contractAddress, abi, provider);

// Helper function to fetch events in a block range
async function fetchEventsInRange(fromBlock, toBlock, filter) {
  let events = [];
  const batchSize = 1000;

  for (
    let startBlock = fromBlock;
    startBlock < toBlock;
    startBlock += batchSize
  ) {
    const endBlock = Math.min(startBlock + batchSize - 1, toBlock);
    console.log(`Fetching events from block ${startBlock} to ${endBlock}`);

    const batchEvents = await contract.queryFilter(
      filter,
      startBlock,
      endBlock
    );
    events = events.concat(batchEvents);
  }

  return events;
}

// Helper function to save a transaction if it doesn't already exist
async function saveIfNotExists(event, eventType) {
  const transactionHash = event.transactionHash;
  const existingTransaction = await Transaction.findOne({ transactionHash });

  if (!existingTransaction) {
    console.log(`Saving new transaction for hash: ${transactionHash}`);

    let depositTimeMillis = Date.now(); // Default to current time
    if (eventType === "DepositMade" && event.args.depositTime) {
      const depositTimeBigInt = event.args.depositTime;
      depositTimeMillis = Number(depositTimeBigInt) * 1000; // Convert to milliseconds
    }

    const newTransaction = new Transaction({
      user: event.args.user || event.args.account, // Handle different event formats
      amount: ethers.formatUnits(event.args.amount || event.args.reward, 18),
      depositTime: new Date(depositTimeMillis),
      eventType,
      transactionHash,
    });

    await newTransaction.save().catch((error) => {
      console.error("Error saving transaction:", error);
    });

    console.log("Transaction saved successfully.");
  } else {
    console.log(`Transaction ${transactionHash} already exists.`);
  }
}

// Function to fetch and save blockchain transaction history
async function fetchTransactionHistory() {
  try {
    console.log("Fetching transaction history...");
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = 43717956;
    // Fetch DepositMade events
    const depositFilter = contract.filters.DepositMade();
    const depositEvents = await fetchEventsInRange(
      fromBlock,
      latestBlock,
      depositFilter
    );
    for (const event of depositEvents) {
      await saveIfNotExists(event, "DepositMade");
    }

    // Fetch Withdraw events
    const withdrawFilter = contract.filters.Withdraw();
    const withdrawEvents = await fetchEventsInRange(
      fromBlock,
      latestBlock,
      withdrawFilter
    );
    for (const event of withdrawEvents) {
      await saveIfNotExists(event, "Withdraw");
    }

    // Fetch RewardClaimed events
    const rewardFilter = contract.filters.RewardClaimed();
    const rewardEvents = await fetchEventsInRange(
      fromBlock,
      latestBlock,
      rewardFilter
    );
    for (const event of rewardEvents) {
      await saveIfNotExists(event, "RewardClaimed");
    }

    console.log("Transactions saved to database!");
  } catch (error) {
    console.error("Error fetching transaction history:", error);
  }
}

// Schedule the cron job to fetch transaction history every 5 minutes
const job = schedule.scheduleJob("*/1 * * * *", function () {
  console.log("Running scheduled task...");
  fetchTransactionHistory().catch((error) => {
    console.error("Scheduled task failed:", error);
  });
});

// API to fetch nonce from MetaMask
app.get("/api/getNonce", async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ message: "Address is required." });
  }

  let user = await User.findOne({ publicAddress: address.toLowerCase() });

  // if user doesn't exist, create a new one
  if (!user) {
    user = new User({ publicAddress: address.toLowerCase() });
    await user.save();
  }

  return res.json({ nonce: user.nonce });
});

// API sign in with MetaMask
app.post("/signin", async (req, res) => {
  const { address, signature, message } = req.body;

  if (!address || !signature || !message) {
    return res.status(400).json({ message: "Request not valid!" });
  }

  try {
    // Tìm người dùng theo địa chỉ ví
    const user = await User.findOne({ publicAddress: address.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log(message, signature);
    let signerAddress;
    try {
      signerAddress = ethers.verifyMessage(message, signature); 
    } catch (e) {
      return res.status(500).json({ message: "Verification failed." });
    }

    if (signerAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ message: "Signature not valid!" });
    }

    // Cập nhật nonce trong database
    user.nonce = Math.floor(Math.random() * 1000000);
    await user.save();

    // Tạo JWT token
    const token = jwt.sign({ address: user.publicAddress }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ token });
  } catch (error) {
    console.error("Error in sign-in process:", error);
    return res.status(500).json({ message: "Sign-in failed!" });
  }
});

// Middleware protecting routes required authentication
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Access token required." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token." });
    req.user = user;
    next();
  });
}

// API protected required authentication
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ message: `Welcome user with address: ${req.user.address}` });
});

// API fetch transactions
app.get("/api/transactions", async (req, res) => {
  const { address } = req.query;
  try {
    const transactions = await Transaction.find({ user: address });
    res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

// Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
