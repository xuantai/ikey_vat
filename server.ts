import express from "express";
import compression from "compression";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";
import { CompanyInfo } from "./src/types";
import https from "node:https";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const searchCache = new Map<string, any>();
const lookupCache = new Map<string, any>();

const METADATA_CACHE_TTL_MS = 60_000;
const metadataCache = new Map<string, { value: any; expiresAt: number }>();

function getCachedMetadata<T>(key: string): T | null {
  const cached = metadataCache.get(key);
  if (!cached || cached.expiresAt <= Date.now()) {
    metadataCache.delete(key);
    return null;
  }
  return cached.value as T;
}

function setCachedMetadata<T>(key: string, value: T): T {
  metadataCache.set(key, { value, expiresAt: Date.now() + METADATA_CACHE_TTL_MS });
  return value;
}

function invalidateMetadataCache(): void {
  metadataCache.clear();
}

// Administration Credentials Configuration (can be modified directly here)
const ADMIN_CONFIG = {
  username: "admin",
  password: "123321"
};

// Compress textual API and HTML responses before they leave the origin.
app.use(compression());

// Body parser with 10MB limit to safely support base64 logos
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

import { GoogleGenAI, Type } from "@google/genai";

// Initialize Firebase SDK
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId); // CRITICAL: The app will break without this line

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Data fetching helper functions
async function getCompanies(): Promise<CompanyInfo[]> {
  const cached = getCachedMetadata<CompanyInfo[]>("companies:all");
  if (cached) return cached;

  const pathStr = "companies";
  try {
    const colRef = collection(db, pathStr);
    const snapshot = await getDocs(colRef);
    const result: CompanyInfo[] = [];
    snapshot.forEach((d) => {
      result.push(d.data() as CompanyInfo);
    });
    return setCachedMetadata("companies:all", result);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, pathStr);
    return [];
  }
}

async function getCompanyByUsername(username: string): Promise<CompanyInfo | null> {
  const cacheKey = `companies:${username}`;
  const cached = getCachedMetadata<CompanyInfo | null>(cacheKey);
  if (cached !== null) return cached;

  const pathStr = `companies/${username}`;
  try {
    const docRef = doc(db, "companies", username);
    const snap = await getDoc(docRef);
    const company = snap.exists() ? (snap.data() as CompanyInfo) : null;
    return setCachedMetadata(cacheKey, company);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, pathStr);
    return null;
  }
}

async function getGlobalSettings(): Promise<Record<string, any>> {
  const cached = getCachedMetadata<Record<string, any>>("settings:global");
  if (cached) return cached;

  const pathStr = "settings/global";
  try {
    const settingsRef = doc(db, "settings", "global");
    const settingsSnap = await getDoc(settingsRef);
    const settings = settingsSnap.exists() ? settingsSnap.data() : {};
    return setCachedMetadata("settings:global", settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, pathStr);
    return {};
  }
}

async function saveCompany(company: CompanyInfo): Promise<void> {
  const pathStr = `companies/${company.username}`;
  try {
    const docRef = doc(db, "companies", company.username);
    await setDoc(docRef, company);
    invalidateMetadataCache();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, pathStr);
  }
}

async function deleteCompany(username: string): Promise<void> {
  const pathStr = `companies/${username}`;
  try {
    const docRef = doc(db, "companies", username);
    await deleteDoc(docRef);
    invalidateMetadataCache();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, pathStr);
  }
}

// ==================== API ENDPOINTS ====================

// 1. Get health check status
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// System Settings API endpoints
app.get("/api/system-settings", async (req, res) => {
  try {
    const settings = await getGlobalSettings();
    return res.json({
      success: true,
      data: {
        globalBaseUrl: "",
        siteTitle: "",
        globalSeoTitle: "",
        siteSubtitle: "",
        siteLogo: "",
        footerText: "",
        headerLink: "",
        footerLink: "",
        footerSecondaryLinks: [],
        ...settings,
      },
    });
  } catch (err) {
    console.error("Failed to get system settings", err);
    res.status(500).json({ success: false, message: "Lỗi đọc cấu hình hệ thống từ máy chủ" });
  }
});

app.post("/api/system-settings", async (req, res) => {
  const settings = req.body;
  try {
    const docRef = doc(db, "settings", "global");
    await setDoc(docRef, settings);
    invalidateMetadataCache();
    res.json({ success: true, message: "Đã lưu cài đặt hệ thống thành công!" });
  } catch (err) {
    console.error("Failed to save system settings", err);
    res.status(500).json({ success: false, message: "Lỗi lưu cấu hình hệ thống" });
  }
});

// Admin CP Login verification endpoint
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu." });
  }

  if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
    res.json({ success: true, message: "Đăng nhập trang quản trị thành công!" });
  } else {
    res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu quản trị." });
  }
});

// 2. Get registered company list (public - no secret info)
app.get("/api/companies", async (req, res) => {
  try {
    const companies = await getCompanies();
    const summary = companies.map((c) => ({
      username: c.username,
      companyName: c.companyName,
      logoUrl: c.logoUrl,
      primaryColor: c.primaryColor,
      taxCode: c.taxCode || "",
      customDomain: c.customDomain || "",
      isPublic: c.isPublic,
    }));
    res.json({ success: true, count: summary.length, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi tải danh sách công ty" });
  }
});

// 3. Get specific company profile by username
app.get("/api/companies/:username", async (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  try {
    const company = await getCompanyByUsername(username);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy thông tin công ty cho username "${username}"`,
      });
    }

    // Strip password before sending to client
    const { adminPassword, ...safeCompany } = company;
    res.json({ success: true, data: safeCompany });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi đọc dữ liệu từ máy chủ" });
  }
});

// 3b. Serve company logo/thumbnail as direct image for SEO metadata if base64 or URL
app.get("/api/companies/:username/logo.png", async (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  try {
    const company = await getCompanyByUsername(username);
    if (!company) {
      return res.status(404).send("Company not found");
    }

    // Determine the source image (thumbnailUrl or logoUrl)
    let rawImg = company.thumbnailUrl || company.logoUrl;
    
    if (!rawImg) {
      return res.redirect("/favicon.ico");
    }

    if (rawImg.startsWith("data:")) {
      const match = rawImg.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        const contentType = match[1];
        const base64Data = match[2];
        const imgBuffer = Buffer.from(base64Data, "base64");
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
        return res.send(imgBuffer);
      }
    }

    // If it's already an external URL, redirect to it
    if (rawImg.startsWith("http://") || rawImg.startsWith("https://")) {
      return res.redirect(rawImg);
    }

    return res.redirect("/favicon.ico");
  } catch (err) {
    console.error("Error serving company logo:", err);
    return res.status(500).send("Internal server error");
  }
});

// 4. Create new company profile
app.post("/api/companies", async (req, res) => {
  const payload: Partial<CompanyInfo> = req.body;
  
  if (!payload.username) {
    return res.status(400).json({ success: false, message: "Username không được để trống" });
  }

  const username = payload.username.toLowerCase().trim();
  
  // Validate username format (lowercase alphanumeric & dash only)
  const usernameRegex = /^[a-z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      success: false,
      message: "Username chỉ được chứa chữ thường không dấu, số, dấu gạch ngang (-) và gạch dưới (_)",
    });
  }

  try {
    const isExisting = await getCompanyByUsername(username);
    if (isExisting) {
      return res.status(400).json({
        success: false,
        message: "Username này đã được sử dụng. Vui lòng chọn một cái tên khác",
      });
    }

    if (!payload.adminPassword || payload.adminPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu quản lý phải có ít nhất 4 ký tự",
      });
    }

    const newCompany: CompanyInfo = {
      username,
      companyName: payload.companyName || "",
      taxCode: payload.taxCode || "",
      address: payload.address || "",
      email: payload.email || "",
      phone: payload.phone || "",
      logoUrl: payload.logoUrl || "",
      bankName: payload.bankName || "",
      bankAccount: payload.bankAccount || "",
      bankOwner: payload.bankOwner || "",
      primaryColor: payload.primaryColor || "#10B981", // default EMERALD
      customDomain: payload.customDomain || "",
      faviconUrl: payload.faviconUrl || "",
      thumbnailUrl: payload.thumbnailUrl || "",
      websiteTitle: payload.websiteTitle || "",
      adminPassword: payload.adminPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveCompany(newCompany);

    const { adminPassword, ...safeCompany } = newCompany;
    res.status(201).json({
      success: true,
      message: "Tạo trang thông tin hóa đơn thành công!",
      data: safeCompany,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi ghi nhận thông tin trang" });
  }
});

// 5. Verify admin password of a company
app.post("/api/companies/:username/verify", async (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: "Vui lòng nhập mật khẩu" });
  }

  try {
    const company = await getCompanyByUsername(username);

    if (!company) {
      return res.status(404).json({ success: false, message: "Không tìm thấy công ty" });
    }

    if (company.adminPassword !== password && password !== ADMIN_CONFIG.password) {
      return res.status(401).json({ success: false, message: "Mật khẩu quản lý không chính xác" });
    }

    res.json({ success: true, message: "Xác thực mật khẩu quản lý thành công!" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi xác thực thông tin" });
  }
});

// 5.1. Lookup Tax Code via VietQR (Safe server-side proxy to bypass CORS) with server caching
app.get("/api/lookup-tax/:mst", async (req, res) => {
  const mst = req.params.mst.trim();
  if (lookupCache.has(mst)) {
    return res.json(lookupCache.get(mst));
  }
  try {
    const response = await fetch(`https://api.vietqr.io/v2/business/${mst}`);
    const json = await response.json();
    if (json && json.code === "00") {
      if (json.data && json.data.address) {
        // removed replace
      }
      lookupCache.set(mst, json);
    }
    res.json(json);
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi kết nối API tra cứu từ máy chủ" });
  }
});

// 5.15. Autocomplete / Search Vietnamese Company by Tax Code only
app.get("/api/search-company", async (req, res) => {
  const query = req.query.q as string;
  if (!query || query.trim().length < 2) {
    return res.json({ success: true, data: [] });
  }

  const cleanQuery = query.trim();
  const lowerQuery = cleanQuery.toLowerCase();

  // Check memory cache first to return instantly
  if (searchCache.has(lowerQuery)) {
    return res.json({ success: true, data: searchCache.get(lowerQuery) });
  }

  const isTaxDigits = /^[0-9-]+$/.test(cleanQuery.replace(/\s+/g, ""));

  if (isTaxDigits) {
    const cleanTax = cleanQuery.replace(/[^0-9]/g, "");
    if (cleanTax.length >= 8) {
      try {
        const response = await fetch(`https://api.vietqr.io/v2/business/${cleanTax}`);
        const json = await response.json();
        if (json.code === "00" && json.data) {
          const result = [{
            taxCode: cleanTax,
            name: json.data.name || json.data.displayName || "",
            address: json.data.address || "",
            phone: json.data.phone || "",
            director: "" // API might not have this, we return empty so UI handles fallback
          }];
          searchCache.set(lowerQuery, result);
          return res.json({
            success: true,
            data: result
          });
        }
      } catch (e) {
        // Fallback to empty results
      }
    }
    return res.json({ success: true, data: [] });
  }

  // Not digits, perform search by name via dichvuthongtin.dkkd.gov.vn
  try {
    const fetchDKKD = (q: string, retries: number = 0, cookies: string = ''): Promise<string> => {
      return new Promise((resolve, reject) => {
        const url = new URL(`https://dichvuthongtin.dkkd.gov.vn/inf/default.aspx?search=${encodeURIComponent(q)}&customsearch=1`);
        const options = {
          rejectUnauthorized: false,
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Cookie': cookies,
            'Accept': '*/*, text/html',
            'Connection': 'close'
          }
        };
        const request = https.get(url, options, (resMsg) => {
          let data = '';
          const setCookie = resMsg.headers['set-cookie'];
          let newCookies = cookies;
          if (setCookie) {
             newCookies = setCookie.map(c => c.split(';')[0]).join('; ');
          }
          if (resMsg.statusCode === 307 || resMsg.statusCode === 302 || resMsg.statusCode === 301) {
            if (retries > 3) return resolve('');
            return resolve(fetchDKKD(q, retries + 1, newCookies));
          }
          resMsg.on('data', c => data += c);
          resMsg.on('end', () => resolve(data));
        });
        request.on('error', reject);
        request.on('timeout', () => {
          request.destroy();
          reject(new Error('timeout'));
        });
      });
    };
    
    let rawHtml = await fetchDKKD(cleanQuery);
    let results: any[] = [];
    
    if (rawHtml) {
      // DKKD often returns ul li structures with Company Name followed by (TaxCode)
      // let's loosely parse it to grab tax codes
      const matches = rawHtml.matchAll(/<li[^>]*>.*?([^<]+)\s*\((\d{10,13})\).*?<\/li>/gi);
      for (const match of matches) {
        results.push({
          name: match[1].trim(),
          taxCode: match[2].trim(),
          address: '',
          phone: '',
          director: ''
        });
      }
      
      // Fallback regex if above didn't match
      if (results.length === 0) {
        // sometimes it's text nodes
        const looseMatches = rawHtml.matchAll(/([A-ZÂĐÊÔƠƯÁÀÃẢẠẤẦẪẨẬẮẰẴẲẶÉÈẼẺẸẾỀỄỂỆÍÌĨỈỊÓÒÕỎỌỐỒỖỔỘỚỜỠỞỢÚÙŨỦỤỨỪỮỬỰÝỲỸỶỴ\w \-\.]+)\s*\((\d{10,13})\)/g);
        for (const match of looseMatches) {
           results.push({
             name: match[1].trim(),
             taxCode: match[2].trim(),
             address: '',
             phone: '',
             director: ''
           });
        }
      }
    }
    
    // Deduplicate
    const seen = new Set();
    const finalResults = results.filter(r => {
      if (seen.has(r.taxCode)) return false;
      seen.add(r.taxCode);
      return true;
    });

    searchCache.set(lowerQuery, finalResults);
    res.json({ success: true, data: finalResults });
  } catch (err) {
    res.json({ success: true, data: [] });
  }
});

// 5.2. Lookup Bank Account Name via VietQR (Safe server-side proxy using credentials)
app.post("/api/lookup-bank-account", async (req, res) => {
  const { bin, accountNumber } = req.body;
  if (!bin || !accountNumber) {
    return res.status(400).json({ success: false, message: "Thiếu thông tin BIN ngân hàng hoặc số tài khoản" });
  }

  const clientId = process.env.VIETQR_CLIENT_ID || "";
  const apiKey = process.env.VIETQR_API_KEY || "";

  if (!clientId || !apiKey) {
    return res.status(400).json({ 
      success: false, 
      message: "Chưa cấu hình API VietQR (VIETQR_CLIENT_ID / VIETQR_API_KEY) trên môi trường." 
    });
  }

  try {
    const response = await fetch("https://api.vietqr.io/v2/lookup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": clientId,
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ bin, accountNumber }),
    });

    const json = await response.json();
    if (json && json.code === "00" && json.data) {
      res.json({ success: true, accountName: json.data.accountName });
    } else {
      res.json({ success: false, message: json?.desc || "Không tìm thấy thông tin tài khoản ngân hàng này" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi kết nối máy chủ tra cứu ngân hàng" });
  }
});

// Proxy Image to bypass CORS on html-to-image canvas capture (mainly for Safari/iOS)
app.get("/api/proxy-image", async (req, res) => {
  try {
    const targetUrl = req.query.url as string;
    if (!targetUrl) return res.status(400).send("Missing URL");
    
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!response.ok) throw new Error("Failed to fetch image");
    
    res.set("Content-Type", response.headers.get("content-type") || "image/jpeg");
    res.set("Cache-Control", "public, max-age=31536000"); // Cache it aggressively
    
    // We send as binary buffer
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).send("Error proxying image");
  }
});

// 6. Update company profile (AdminCP actions)
app.put("/api/companies/:username", async (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const password = req.headers["x-admin-password"] || req.body.adminPassword;
  const updatedData: Partial<CompanyInfo> = req.body;

  if (!password) {
    return res.status(401).json({ success: false, message: "Yêu cầu nhập mật khẩu quản lý" });
  }

  try {
    const currentCompany = await getCompanyByUsername(username);

    if (!currentCompany) {
      return res.status(404).json({ success: false, message: "Không tìm thấy công ty" });
    }
    
    // Guard with password
    if (currentCompany.adminPassword !== password && password !== ADMIN_CONFIG.password) {
      return res.status(401).json({ success: false, message: "Mật khẩu quản lý không chính xác" });
    }

    // Update only permitted fields
    const updatedCompany: CompanyInfo = {
      ...currentCompany,
      companyName: updatedData.companyName !== undefined ? updatedData.companyName : currentCompany.companyName,
      taxCode: updatedData.taxCode !== undefined ? updatedData.taxCode : currentCompany.taxCode,
      address: updatedData.address !== undefined ? updatedData.address : currentCompany.address,
      email: updatedData.email !== undefined ? updatedData.email : currentCompany.email,
      phone: updatedData.phone !== undefined ? updatedData.phone : currentCompany.phone,
      logoUrl: updatedData.logoUrl !== undefined ? updatedData.logoUrl : currentCompany.logoUrl,
      bankName: updatedData.bankName !== undefined ? updatedData.bankName : currentCompany.bankName,
      bankAccount: updatedData.bankAccount !== undefined ? updatedData.bankAccount : currentCompany.bankAccount,
      bankOwner: updatedData.bankOwner !== undefined ? updatedData.bankOwner : currentCompany.bankOwner,
      primaryColor: updatedData.primaryColor !== undefined ? updatedData.primaryColor : currentCompany.primaryColor,
      customDomain: updatedData.customDomain !== undefined ? updatedData.customDomain : currentCompany.customDomain,
      faviconUrl: updatedData.faviconUrl !== undefined ? updatedData.faviconUrl : currentCompany.faviconUrl,
      thumbnailUrl: updatedData.thumbnailUrl !== undefined ? updatedData.thumbnailUrl : currentCompany.thumbnailUrl,
      websiteTitle: updatedData.websiteTitle !== undefined ? updatedData.websiteTitle : currentCompany.websiteTitle,
      adminPassword: updatedData.newAdminPassword || currentCompany.adminPassword, // support changing password
      isPublic: updatedData.isPublic !== undefined ? updatedData.isPublic : currentCompany.isPublic,
      updatedAt: new Date().toISOString(),
    };

    await saveCompany(updatedCompany);

    const { adminPassword, ...safeCompany } = updatedCompany;
    res.json({
      success: true,
      message: "Cập nhật thông tin xuất hóa đơn thành công!",
      data: safeCompany,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi cập nhật thông tin xuất hóa đơn" });
  }
});

// 7. Delete company profile
app.delete("/api/companies/:username", async (req, res) => {
  const username = req.params.username.toLowerCase().trim();
  const password = req.headers["x-admin-password"] || req.body.adminPassword;

  if (!password) {
    return res.status(401).json({ success: false, message: "Yêu cầu nhập mật khẩu quản lý" });
  }

  try {
    const company = await getCompanyByUsername(username);

    if (!company) {
      return res.status(404).json({ success: false, message: "Không tìm thấy công ty" });
    }

    if (company.adminPassword !== password && password !== ADMIN_CONFIG.password) {
      return res.status(401).json({ success: false, message: "Mật khẩu quản lý không chính xác" });
    }

    await deleteCompany(username);

    res.json({ success: true, message: `Đã xóa trang thông tin "${username}" thành công.` });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi hủy trang thông tin" });
  }
});

// 8. AI Scan Image for Company Details
app.post("/api/scan-image", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: "Missing image data" });

    // Try to get API key from Firestore settings or fallback to process.env
    let apiKey = process.env.GEMINI_API_KEY;
    let hasDbKey = false;
    try {
      const settingsRef = doc(db, "settings", "global");
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists() && settingsSnap.data().geminiApiKey) {
        apiKey = settingsSnap.data().geminiApiKey.trim();
        hasDbKey = true;
      }
    } catch (e) {
      console.error("Failed to read settings for Gemini API Key", e);
    }
    
    if (apiKey) {
      apiKey = apiKey.trim();
    }

    if (!apiKey) {
      return res.status(500).json({ success: false, message: `Hệ thống chưa thiết lập API Key của Gemini. DB Status: ${hasDbKey}. Env: ${!!process.env.GEMINI_API_KEY}` });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } }
    });

    const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const imagePart = {
      inlineData: { mimeType, data },
    };

    const textPart = {
      text: "Trích xuất thông tin doanh nghiệp, hoá đơn, hoặc danh thiếp từ hình ảnh. Tìm Mã số thuế (taxCode). Các trường: Tên công ty (name), Địa chỉ (address), Số điện thoại (phone), Email (email), và tên miền website (domain).\nCHÚ Ý RẤT QUAN TRỌNG: Bạn CẦN TỰ PHÂN TÍCH LOGO HOẶC TÊN CÔNG TY. Nếu đó là các công ty/tập đoàn lớn quen thuộc (Viettel, Vingroup, FPT, Vietcombank, Momo, VNPT, Shopee, v.v.), BẠN PHẢI TỰ ĐỘNG điền tên miền CHÍNH THỨC của họ vào trường domain NGAY CẢ KHI TRÊN ẢNH KHÔNG GHI rõ web (VD: viettel.com.vn, vingroup.net, fpt.com.vn, vietcombank.com.vn, momo.vn, v.v.). CHỈ GHI MỖI TÊN MIỀN GỐC (vd: viettel.vn). Nếu tìm thấy Email, hãy lấy phần đuôi (sau @) làm domain trừ gmail/yahoo. MỤC TIÊU LÀ PHẢI TÌM/ĐOÁN ĐƯỢC TÊN MIỀN NẾU CÓ THỂ.",
    };

    let response;
    
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              taxCode: { type: Type.STRING },
              name: { type: Type.STRING },
              address: { type: Type.STRING },
              phone: { type: Type.STRING },
              email: { type: Type.STRING },
              domain: { type: Type.STRING }
            }
          }
        }
      });
    } catch (err: any) {
      if (err.status === 503 || err.status === 429 || err.message?.includes("503") || err.message?.includes("429") || err.message?.includes("UNAVAILABLE") || err.message?.includes("RESOURCE_EXHAUSTED") || err.message?.includes("high demand")) {
        console.warn("gemini-2.5-flash unavailable or quota exceeded, falling back to gemini-2.0-flash");
        response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: { parts: [imagePart, textPart] },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                taxCode: { type: Type.STRING },
                name: { type: Type.STRING },
                address: { type: Type.STRING },
                phone: { type: Type.STRING },
                email: { type: Type.STRING },
                domain: { type: Type.STRING }
              }
            }
          }
        });
      } else {
        throw err;
      }
    }

    if (response.text) {
      const result = JSON.parse(response.text);
      
      // Fallback domain logic based on tax code for major companies
      if (!result.domain && result.taxCode) {
        const tc = result.taxCode.replace(/[^0-9]/g, "");
        if (tc === "0100109106") result.domain = "viettel.com.vn";
        else if (tc === "0101245486") result.domain = "vingroup.net";
        else if (tc === "0101248141") result.domain = "fpt.com.vn";
        else if (tc === "0100112437") result.domain = "vietcombank.com.vn";
        else if (tc.startsWith("0313980000")) result.domain = "momo.vn"; // Momo tax code varies, this is one of them
        else if (tc === "0106869738") result.domain = "vnpt.vn";
        else if (tc === "0106773786") result.domain = "shopee.vn";
        else if (tc === "0100150619") result.domain = "bidv.com.vn";
        else if (tc === "0100283873") result.domain = "mbbank.com.vn";
        else if (tc === "0100230800") result.domain = "techcombank.com";
      }

      res.json({ success: true, data: result });
    } else {
      res.json({ success: false, message: "Không đọc được dữ liệu." });
    }
  } catch (err: any) {
    console.error("Lỗi AI Scan:", err);
    if (err.message?.includes("exceeded your current quota") || err.status === 429) {
      return res.status(429).json({ success: false, message: "Tính năng phân tích ảnh bằng AI bị quá tải, bạn vui lòng tìm bằng MST hoặc nhập thủ công" });
    }
    res.status(500).json({ success: false, message: "Lỗi AI phân tích: " + (err.message || 'Unknown error') });
  }
});


// ==================== VITE MIDDLEWARE SETUP ====================

async function startServer() {
  let viteInstance: any = null;

  const handleDynamicHtml = async (req: any, res: any, next: any) => {
    // Bypass APIs, assets or requests with extension
    if (req.path.startsWith("/api/") || req.path.includes(".")) {
      return next();
    }

    // Read global settings for fallback
    let siteTitle = "Tạo trang thông tin xuất hóa đơn VAT";
    let siteSubtitle = "Công cụ tạo trang thông tin chuyển khoản và xuất hóa đơn VAT nhanh chóng";
    let siteLogo = "";
    let globalSeoTitle = "";
    let globalBaseUrl = "";
    
    try {
      const val = await getGlobalSettings();
      siteTitle = val.siteTitle || siteTitle;
      siteSubtitle = val.siteSubtitle || siteSubtitle;
      siteLogo = val.siteLogo || siteLogo;
      globalSeoTitle = val.globalSeoTitle || globalSeoTitle;
      globalBaseUrl = val.globalBaseUrl || globalBaseUrl;
    } catch (e) {
      console.error("Failed to read global settings for dynamic metadata:", e);
    }

    const host = req.get("host") || "";
    const protocol = (req.headers["x-forwarded-proto"] as string) || req.protocol || "http";
    const baseUrl = globalBaseUrl ? globalBaseUrl.replace(/\/$/, "") : `${protocol}://${host}`;

    // Recognize potential username
    const cleanPath = req.path.replace(/^\//, "").split("/")[0].trim();
    const isPotentialUsername = cleanPath && !cleanPath.includes(".") && !["api", "admin", "assets", "favicon"].includes(cleanPath.toLowerCase());

    let company: CompanyInfo | null = null;
    
    // 1) Search first to see if any company matches customDomain === host
    try {
      const companies = await getCompanies();
      company = companies.find((c) => {
        if (!c.customDomain) return false;
        const cd = c.customDomain.toLowerCase().trim();
        const hn = host.toLowerCase().trim().split(":")[0];
        return cd === hn || cd === `www.${hn}` || `www.${cd}` === hn;
      }) || null;
    } catch (err) {
      console.error("Failed to query companies by custom domain:", err);
    }

    // 2) Fallback to path username if not resolved via custom domain
    if (!company && isPotentialUsername) {
      try {
        company = await getCompanyByUsername(cleanPath.toLowerCase());
      } catch (err) {
        console.error(`Failed to fetch company metadata for "${cleanPath}":`, err);
      }
    }

    let title = globalSeoTitle || siteTitle;
    let description = siteSubtitle;
    let image = siteLogo || `${baseUrl}/default-thumb.png`;
    const ogUrl = `${baseUrl}${req.originalUrl}`;

    if (company) {
      title = company.websiteTitle || `${company.companyName} - Thông tin xuất hóa đơn`;
      const companyDetails = [];
      if (company.taxCode) companyDetails.push(`Mã số thuế: ${company.taxCode}`);
      if (company.address) companyDetails.push(`Địa chỉ: ${company.address}`);
      if (company.phone) companyDetails.push(`SĐT: ${company.phone}`);
      if (company.email) companyDetails.push(`Email: ${company.email}`);
      
      description = `Chi tiết thông tin xuất hóa đơn VAT và tài khoản nhận thanh toán của ${company.companyName}. ${companyDetails.join(". ")}`;
      
      // Prioritize serving company's customized/uploaded assets via our direct raw image endpoint
      let ogImageCandidate = "";
      if (company.thumbnailUrl || company.logoUrl) {
        ogImageCandidate = `${baseUrl}/api/companies/${company.username}/logo.png`;
      } else {
        ogImageCandidate = `https://api.microlink.io?url=${encodeURIComponent(`${baseUrl}/${company.username}`)}&screenshot=true&embed=screenshot.url`;
      }
      image = ogImageCandidate || siteLogo || `${baseUrl}/default-thumb.png`;
    }

    // Guard against base64 logos/thumbnails for global site level since social scrapers cannot render base64 in metadata og:image
    if (image && image.startsWith("data:")) {
      const screenshotUrl = `https://api.microlink.io?url=${encodeURIComponent(`${baseUrl}/${company?.username || cleanPath}`)}&screenshot=true&embed=screenshot.url`;
      image = screenshotUrl || `${baseUrl}/default-thumb.png`;
    }

    // Safe character escaping for HTML attributes
    const escapeHtmlAttr = (str: string) => {
      return (str || "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    };

    const escapedTitle = escapeHtmlAttr(title);
    const escapedDesc = escapeHtmlAttr(description);
    const escapedImage = escapeHtmlAttr(image);
    const escapedUrl = escapeHtmlAttr(ogUrl);

    try {
      const isProd = process.env.NODE_ENV === "production";
      const templatePath = isProd 
        ? path.join(process.cwd(), "dist", "index.html")
        : path.join(process.cwd(), "index.html");

      if (fs.existsSync(templatePath)) {
        let html = fs.readFileSync(templatePath, "utf8");

        const metaSnippet = `
    <title>${escapedTitle}</title>
    <meta name="description" content="${escapedDesc}" />
    <meta property="og:title" content="${escapedTitle}" />
    <meta property="og:description" content="${escapedDesc}" />
    <meta property="og:image" content="${escapedImage}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapedUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapedTitle}" />
    <meta name="twitter:description" content="${escapedDesc}" />
    <meta name="twitter:image" content="${escapedImage}" />
        `.trim();

        // Replace standard <title> tag with full dynamic SEO snippet
        html = html.replace(/<title>.*?<\/title>/, metaSnippet);

        if (!isProd && viteInstance) {
          html = await viteInstance.transformIndexHtml(req.originalUrl, html);
        }

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
        res.setHeader("Vary", "Host, Accept-Encoding");
        return res.send(html);
      }
    } catch (err) {
      console.error("Error generating dynamic metatags for index.html:", err);
    }

    if (process.env.NODE_ENV === "production") {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    } else {
      return next();
    }
  };

  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Register dynamic SEO metadata check before Vite middleware so it hits HTML requests first
    app.get("*", async (req, res, next) => {
      // Bypass API paths
      if (req.path.startsWith("/api/")) {
        return next();
      }
      // Bypass standard file assets with extensions
      if (req.path.includes(".")) {
        return next();
      }
      // Bypass Vite-specific dev asset routing paths
      const isVitePath = req.path.startsWith("/@") || 
                         req.path.startsWith("/node_modules/") || 
                         req.path.startsWith("/src/") ||
                         req.path.includes("__vite_ping");
      
      if (isVitePath) {
        return next();
      }

      // Serve all other page routing paths (and scraper user-agents) with dynamic SEO metadata HTML
      return handleDynamicHtml(req, res, next);
    });

    app.use(viteInstance.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static frontend assets
    app.use(express.static(distPath, {
      maxAge: "1y",
      immutable: true,
      index: false,
    }));
    
    // Handles Vite single-page application fallback for route path routing with dynamic Open Graph (OG) metadata injection for Zalo/FB sharing
    app.get("*", async (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      return handleDynamicHtml(req, res, next);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully booted and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Critical server boot failure:", err);
});
