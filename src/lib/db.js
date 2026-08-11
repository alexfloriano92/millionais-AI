import fs from 'fs';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), 'users.json');
const PRODUCTS_PATH = path.join(process.cwd(), 'products.json');
const AVATARS_PATH = path.join(process.cwd(), 'avatars.json');

function ensureFile(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
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
