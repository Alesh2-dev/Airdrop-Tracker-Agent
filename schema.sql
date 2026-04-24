-- Airdrop Tracker Agent - MySQL Schema

CREATE DATABASE IF NOT EXISTS airdrop_tracker;
USE airdrop_tracker;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL DEFAULT 'demo_user',
  telegram_chat_id VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS airdrops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  link VARCHAR(500),
  deadline DATETIME NOT NULL,
  status ENUM('active', 'expired', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  airdrop_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_order INT DEFAULT 0,
  FOREIGN KEY (airdrop_id) REFERENCES airdrops(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task_id INT NOT NULL,
  airdrop_id INT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_task (user_id, task_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  FOREIGN KEY (airdrop_id) REFERENCES airdrops(id) ON DELETE CASCADE
);

-- Seed default user
INSERT INTO users (username) VALUES ('demo_user') ON DUPLICATE KEY UPDATE username = username;

-- Seed airdrops
INSERT INTO airdrops (name, description, link, deadline, status) VALUES
(
  'LayerZero',
  'Cross-chain interoperability protocol. Complete quests on their platform to qualify for ZRO airdrop.',
  'https://layerzero.network',
  DATE_ADD(NOW(), INTERVAL 2 DAY),
  'active'
),
(
  'zkSync Era',
  'ZK rollup on Ethereum. Bridge assets, swap on DEXs, and mint NFTs to maximize eligibility.',
  'https://zksync.io',
  DATE_ADD(NOW(), INTERVAL 6 HOUR),
  'active'
),
(
  'Scroll',
  'EVM-compatible zkRollup. Interact with the network to qualify for SCROLL token distribution.',
  'https://scroll.io',
  DATE_ADD(NOW(), INTERVAL 5 DAY),
  'active'
),
(
  'Starknet',
  'STARK-powered L2. Use StarkEx apps and deploy contracts to earn STRK tokens.',
  'https://starknet.io',
  DATE_ADD(NOW(), INTERVAL 12 HOUR),
  'active'
),
(
  'Linea',
  'ConsenSys zkEVM rollup. Bridge ETH and interact with dApps on Linea mainnet.',
  'https://linea.build',
  DATE_ADD(NOW(), INTERVAL 10 DAY),
  'active'
);

-- Seed tasks for LayerZero
INSERT INTO tasks (airdrop_id, title, task_order) VALUES
(1, 'Bridge tokens via Stargate Finance', 1),
(1, 'Complete 3 cross-chain swaps', 2),
(1, 'Mint LayerZero OFT NFT', 3),
(1, 'Follow @LayerZero_Labs on Twitter', 4);

-- Seed tasks for zkSync
INSERT INTO tasks (airdrop_id, title, task_order) VALUES
(2, 'Bridge ETH to zkSync Era', 1),
(2, 'Swap on SyncSwap or Mute.io', 2),
(2, 'Mint an NFT on zkSync', 3);

-- Seed tasks for Scroll
INSERT INTO tasks (airdrop_id, title, task_order) VALUES
(3, 'Bridge ETH to Scroll mainnet', 1),
(3, 'Deploy a smart contract on Scroll', 2),
(3, 'Use Scroll native DEX', 3),
(3, 'Provide liquidity on Scroll', 4);

-- Seed tasks for Starknet
INSERT INTO tasks (airdrop_id, title, task_order) VALUES
(4, 'Set up ArgentX or Braavos wallet', 1),
(4, 'Bridge assets to Starknet', 2),
(4, 'Swap on JediSwap', 3);

-- Seed tasks for Linea
INSERT INTO tasks (airdrop_id, title, task_order) VALUES
(5, 'Bridge ETH to Linea', 1),
(5, 'Swap on Linea-native DEX', 2),
(5, 'Mint Linea Voyage NFT', 3),
(5, 'Use Linea LXP Program', 4);