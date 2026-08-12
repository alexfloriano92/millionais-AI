import fs from 'fs';
import path from 'path';

// On Vercel (serverless), the project directory is read-only.
// We must use /tmp for writable storage.
const isVercel = !!process.env.VERCEL;
const DB_DIR = isVercel ? '/tmp' : process.cwd();
const SRC_DIR = process.cwd(); // Where initial data files live (bundled with deploy)

const USERS_PATH = path.join(DB_DIR, 'users.json');
const PRODUCTS_PATH = path.join(DB_DIR, 'products.json');
const AVATARS_PATH = path.join(DB_DIR, 'avatars.json');

function ensureFile(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    // On Vercel, try to copy initial data from the project root first
    const basename = path.basename(filePath);
    const srcPath = path.join(SRC_DIR, basename);
    if (isVercel && fs.existsSync(srcPath)) {
      try {
        fs.copyFileSync(srcPath, filePath);
        return;
      } catch (e) {
        // Fall through to create empty file
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}

// Users
export function readUsers() {
  try {
    ensureFile(USERS_PATH);
    const data = fs.readFileSync(USERS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users DB:', error);
    return [];
  }
}

export function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users DB:', error);
  }
}

// Products
export function readProducts(userId) {
  try {
    ensureFile(PRODUCTS_PATH);
    const data = fs.readFileSync(PRODUCTS_PATH, 'utf8');
    const products = JSON.parse(data);
    return products.filter(p => p.userId === userId);
  } catch (error) {
    console.error('Error reading products DB:', error);
    return [];
  }
}

export function writeProducts(allProducts) {
  try {
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(allProducts, null, 2));
  } catch (error) {
    console.error('Error writing products DB:', error);
  }
}

export function readAllProducts() {
  try {
    ensureFile(PRODUCTS_PATH);
    const data = fs.readFileSync(PRODUCTS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Avatars
export function readAvatars(userId) {
  try {
    ensureFile(AVATARS_PATH);
    const data = fs.readFileSync(AVATARS_PATH, 'utf8');
    const avatars = JSON.parse(data);
    return avatars.filter(a => a.userId === userId || a.isDefault);
  } catch (error) {
    console.error('Error reading avatars DB:', error);
    return [];
  }
}

export function writeAvatars(allAvatars) {
  try {
    fs.writeFileSync(AVATARS_PATH, JSON.stringify(allAvatars, null, 2));
  } catch (error) {
    console.error('Error writing avatars DB:', error);
  }
}

export function readAllAvatars() {
  try {
    ensureFile(AVATARS_PATH);
    const data = fs.readFileSync(AVATARS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}
