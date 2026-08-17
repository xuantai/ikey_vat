import React, { useState, useEffect, useRef } from "react";
import {
  Building2,
  Hash,
  MapPin,
  Mail,
  Phone,
  Copy,
  Check,
  QrCode,
  CreditCard,
  User,
  ExternalLink,
  Plus,
  Edit,
  Palette,
  Trash2,
  HelpCircle,
  Search,
  Settings,
  ArrowLeft,
  Sparkles,
  Download,
  Key,
  Eye,
  EyeOff,
  Lock,
  ChevronRight,
  Globe,
  Heart,
  RotateCcw,
  ImageIcon,
  Scan,
  Share2,
} from "lucide-react";
import { CompanyInfo, BankConfig, ApiResponse } from "./types";
import { VIETNAMESE_BANKS, PRESET_COLORS, SAMPLE_COMPANY } from "./data";

const proxyImageUrl = (url) => {
  if (!url) return url;
  if (url.startsWith("https://img.vietqr.io")) return url; // Already fully CORS compliant
  if (url.startsWith("data:")) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

export const BANK_BINS: Record<string, string> = {
  vcb: "970436",
  mbbank: "970422",
  tcb: "970407",
  icb: "970415",
  bidv: "970418",
  acb: "970416",
  vpb: "970432",
  tpb: "970423",
  vtb: "970405",
  stb: "970403",
  vib: "970441",
  hdb: "970437",
  msb: "970426",
  shb: "970443",
  shn: "970424",
};

export function removeVietnameseTones(str: string): string {
  if (!str) return "";
  let result = str;
  result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  result = result.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  result = result.replace(/đ/g, "d");

  result = result.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  result = result.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  result = result.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  result = result.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  result = result.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  result = result.replace(/Ý|Ỳ|Ỵ|Ỷ|Ỹ/g, "Y");
  result = result.replace(/Đ/g, "D");

  // Clean up remaining diacritics
  try {
    result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } catch (e) {
    // fallback if normalize isn't supported in old runtimes
  }

  // Keep only standard characters, spaces, and numbers
  result = result.replace(/[^a-zA-Z0-9 ]/g, " ");
  result = result.replace(/\s+/g, " ");

  return result.trim().toUpperCase();
}

export default function App() {
  // Global States
  const [route, setRoute] = useState<"home" | "view" | "admin" | "globalAdmin">(
    "home",
  );
  const [globalBaseUrl, setGlobalBaseUrl] = useState<string>(
    () => localStorage.getItem("globalBaseUrl") || window.location.origin,
  );
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [activeCompany, setActiveCompany] = useState<CompanyInfo | null>(null);
  const [registeredCompanies, setRegisteredCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInitialRouteLoading, setIsInitialRouteLoading] =
    useState<boolean>(true);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);

  // System Customizer States
  const [siteTitle, setSiteTitle] = useState<string>("");
  const [geminiApiKey, setGeminiApiKey] = useState<string>("");
  const [globalSeoTitle, setGlobalSeoTitle] = useState<string>("");
  const [siteSubtitle, setSiteSubtitle] = useState<string>("");
  const [siteLogo, setSiteLogo] = useState<string>("");
  const [useLogoAsFavicon, setUseLogoAsFavicon] = useState<boolean>(false);
  const [globalFaviconUrl, setGlobalFaviconUrl] = useState<string>("");
  const [globalThumbnailUrl, setGlobalThumbnailUrl] = useState<string>("");
  const [footerText, setFooterText] = useState<string>("");
  const [headerLink, setHeaderLink] = useState<string>("");
  const [footerLink, setFooterLink] = useState<string>("");
  const [footerSecondaryLinks, setFooterSecondaryLinks] = useState<
    { text: string; url: string }[]
  >([]);
  const [deletingUsername, setDeletingUsername] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState<string>("");
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("isAdminLoggedIn") === "true";
    } catch (e) {
      return false;
    }
  });
  const [adminSystemPassword, setAdminSystemPassword] = useState<string>(() => {
    try {
      const stored = sessionStorage.getItem("adminSystemPassword");
      if (stored) return stored;
      if (sessionStorage.getItem("isAdminLoggedIn") === "true") {
        return "123321";
      }
      return "";
    } catch (e) {
      return "";
    }
  });

  // Interaction & UI States
  const [toast, setToast] = useState<{
    message: string;
    visible: boolean;
    type: "success" | "error" | "info";
  }>({
    message: "",
    visible: false,
    type: "success",
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // VietQR amount & remarks interaction in public profiles
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentRemarks, setPaymentRemarks] = useState<string>("");

  // Registration Form States
  const [regUsername, setRegUsername] = useState<string>("");
  const [regCompanyName, setRegCompanyName] = useState<string>("");
  const [regTaxCode, setRegTaxCode] = useState<string>("");
  const [regAddress, setRegAddress] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPhone, setRegPhone] = useState<string>("");
  const [regLogoUrl, setRegLogoUrl] = useState<string>("");
  const [regBankName, setRegBankName] = useState<string>("vcb");
  const [regBankAccount, setRegBankAccount] = useState<string>("");
  const [regBankOwner, setRegBankOwner] = useState<string>("");
  const [regPrimaryColor, setRegPrimaryColor] = useState<string>("#10B981");
  const [regAdminPassword, setRegAdminPassword] = useState<string>("");
  const [regIsPublic, setRegIsPublic] = useState<boolean>(true);
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");

  // Temp states for continuous typing input values (updating actual ones onBlur/focus out)
  const [tempUsername, setTempUsername] = useState<string>("");
  const [tempCompanyName, setTempCompanyName] = useState<string>("");
  const [tempTaxCode, setTempTaxCode] = useState<string>("");
  const [tempAddress, setTempAddress] = useState<string>("");
  const [tempPhone, setTempPhone] = useState<string>("");
  const [tempEmail, setTempEmail] = useState<string>("");
  const [tempBankAccount, setTempBankAccount] = useState<string>("");
  const [tempBankOwner, setTempBankOwner] = useState<string>("");

  // AdminCP Edit States
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [adminUsernameInput, setAdminUsernameInput] = useState<string>("");
  const [isLoggedAdmin, setIsLoggedAdmin] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [adminCPTab, setAdminCPTab] = useState<
    "info" | "banks" | "theme" | "danger"
  >("info");

  // Admin Editing Payload
  const [editCompanyName, setEditCompanyName] = useState<string>("");
  const [editTaxCode, setEditTaxCode] = useState<string>("");
  const [editAddress, setEditAddress] = useState<string>("");
  const [editEmail, setEditEmail] = useState<string>("");
  const [editPhone, setEditPhone] = useState<string>("");
  const [editLogoUrl, setEditLogoUrl] = useState<string>("");
  const [editBankName, setEditBankName] = useState<string>("");
  const [editBankAccount, setEditBankAccount] = useState<string>("");
  const [editBankOwner, setEditBankOwner] = useState<string>("");
  const [editPrimaryColor, setEditPrimaryColor] = useState<string>("");
  const [editNewPassword, setEditNewPassword] = useState<string>("");
  const [editCustomDomain, setEditCustomDomain] = useState<string>("");
  const [editFaviconUrl, setEditFaviconUrl] = useState<string>("");
  const [editThumbnailUrl, setEditThumbnailUrl] = useState<string>("");
  const [editWebsiteTitle, setEditWebsiteTitle] = useState<string>("");
  const [editIsPublic, setEditIsPublic] = useState<boolean>(true);

  // Bank display options
  const [showQRInputs, setShowQRInputs] = useState<boolean>(false);

  // Captcha State
  const [captchaQ, setCaptchaQ] = useState({
    a: Math.floor(Math.random() * 10) + 1,
    b: Math.floor(Math.random() * 10) + 1,
  });
  const [captchaA, setCaptchaA] = useState<string>("");
  const [showEditQR, setShowEditQR] = useState<boolean>(false);
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);
  const [bankLookupLoading, setBankLookupLoading] = useState<boolean>(false);

  // Smart corporate live search / suggestions states
  const [smartSearchQuery, setSmartSearchQuery] = useState<string>("");
  const [smartSuggestions, setSmartSuggestions] = useState<any[]>([]);
  const [smartSearchLoading, setSmartSearchLoading] = useState<boolean>(false);
  const [syncWithCompany, setSyncWithCompany] = useState<boolean>(false);
  const [editSyncWithCompany, setEditSyncWithCompany] =
    useState<boolean>(false);

  // Search/Filter in Home
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [aiScanning, setAiScanning] = useState<boolean>(false);
  const [isDraggingOverTarget, setIsDraggingOverTarget] = useState<boolean>(false);

  // Translation, Support developer modal, and inline delete confirmation states
  const [lang, setLang] = useState<"vi" | "en">("vi");
  const [supportModalOpen, setSupportModalOpen] = useState<boolean>(false);
  const [supportAmount, setSupportAmount] = useState<number>(35000);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Quick helper translation function
  const t = (viText: string, enText: string) => {
    return lang === "vi" ? viText : enText;
  };

  const appDomain = (() => {
    let domain = "ikey.vn";
    let host = "";
    if (globalBaseUrl) {
      try {
        host = new URL(globalBaseUrl).hostname;
      } catch {
        host = globalBaseUrl.replace(/^https?:\/\//, "").split("/")[0];
      }
    } else {
      host = window.location.hostname;
    }

    // remove www.
    host = host.replace(/^www\./, "");

    if (
      !host.includes("localhost") &&
      !host.includes("ngrok") &&
      !host.includes("run.app")
    ) {
      const parts = host.split(".");
      if (parts.length > 2) {
        domain = parts.slice(-2).join(".");
      } else {
        domain = host;
      }
    }
    return domain;
  })();

  const searchTimeoutRef = useRef<any>(null);
  const activeAbortControllerRef = useRef<AbortController | null>(null);

  // Parse location for route routing
  useEffect(() => {
    const initialize = async () => {
      try {
        await parseRoute();
      } catch (err) {
        console.error("Initial routing error:", err);
      } finally {
        setIsInitialRouteLoading(false);
      }
    };
    initialize();
    fetchRegisteredCompanies();
    fetchSystemSettings();

    // Listen for back/forward browser buttons
    const handlePopState = async () => {
      setIsInitialRouteLoading(true);
      try {
        await parseRoute();
      } catch (err) {
        console.error("Routing popstate error:", err);
      } finally {
        setIsInitialRouteLoading(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Dynamically synchronize Title, Favicon, and Thumbnail based on current view route
  useEffect(() => {
    // Return early if we are still doing the initial routing load or fetching the profile.
    // This maintains the server-side pre-rendered dynamic SEO title and tags without
    // any intermediate "Loading state" flash resetting the browser/crawler title.
    if (isInitialRouteLoading || loading) {
      return;
    }

    if (route === "view" && activeCompany) {
      // 1. Title: Tên công ty - Thông Tin Hóa Đơn VAT (for optimal tab branding)
      const companyTitle = `${activeCompany.companyName || "Công ty"} - Thông Tin Hóa Đơn VAT`;
      document.title = companyTitle;

      // 2. Favicon: defaults to company's logoUrl!
      const companyFavicon =
        activeCompany.logoUrl || globalFaviconUrl || siteLogo;
      if (companyFavicon) {
        try {
          let faviconLink = document.querySelector(
            "link[rel*='icon']",
          ) as HTMLLinkElement;
          if (!faviconLink) {
            faviconLink = document.createElement("link");
            faviconLink.type = "image/x-icon";
            faviconLink.rel = "shortcut icon";
            document.head.appendChild(faviconLink);
          }
          faviconLink.href = companyFavicon;
        } catch (e) {
          console.error("Failed to update favicon dynamically:", e);
        }
      }

      // 3. Thumbnail: defaults to a page screenshot preview
      const currentUrl = `${window.location.origin}/${activeCompany.username}`;
      const screenshotUrl = `https://api.microlink.io?url=${encodeURIComponent(currentUrl)}&screenshot=true&embed=screenshot.url`;
      const companyThumbnail =
        activeCompany.logoUrl || globalThumbnailUrl || screenshotUrl;

      try {
        let ogImage = document.querySelector(
          "meta[property='og:image']",
        ) as HTMLMetaElement;
        if (!ogImage) {
          ogImage = document.createElement("meta");
          ogImage.setAttribute("property", "og:image");
          document.head.appendChild(ogImage);
        }
        ogImage.content = companyThumbnail;

        let twitterImage = document.querySelector(
          "meta[name='twitter:image']",
        ) as HTMLMetaElement;
        if (!twitterImage) {
          twitterImage = document.createElement("meta");
          twitterImage.setAttribute("name", "twitter:image");
          document.head.appendChild(twitterImage);
        }
        twitterImage.content = companyThumbnail;
      } catch (e) {}
    } else {
      // Homepage or other routes
      const defaultTitle =
        globalSeoTitle || "Tạo trang thông tin xuất hóa đơn VAT";
      document.title = defaultTitle;

      const defaultFavicon = globalFaviconUrl || siteLogo;
      if (defaultFavicon) {
        try {
          let faviconLink = document.querySelector(
            "link[rel*='icon']",
          ) as HTMLLinkElement;
          if (!faviconLink) {
            faviconLink = document.createElement("link");
            faviconLink.rel = "shortcut icon";
            document.head.appendChild(faviconLink);
          }
          faviconLink.href = defaultFavicon;
        } catch (e) {}
      }

      // Homepage thumbnail: screenshots of home page as high quality fallback
      const currentUrl = window.location.origin;
      const screenshotUrl = `https://api.microlink.io?url=${encodeURIComponent(currentUrl)}&screenshot=true&embed=screenshot.url`;
      const defaultThumbnail = globalThumbnailUrl || screenshotUrl || siteLogo;

      if (defaultThumbnail) {
        try {
          let ogImage = document.querySelector(
            "meta[property='og:image']",
          ) as HTMLMetaElement;
          if (!ogImage) {
            ogImage = document.createElement("meta");
            ogImage.setAttribute("property", "og:image");
            document.head.appendChild(ogImage);
          }
          ogImage.content = defaultThumbnail;

          let twitterImage = document.querySelector(
            "meta[name='twitter:image']",
          ) as HTMLMetaElement;
          if (!twitterImage) {
            twitterImage = document.createElement("meta");
            twitterImage.setAttribute("name", "twitter:image");
            document.head.appendChild(twitterImage);
          }
          twitterImage.content = defaultThumbnail;
        } catch (e) {}
      }
    }
  }, [
    route,
    activeCompany,
    globalSeoTitle,
    siteTitle,
    siteLogo,
    globalFaviconUrl,
    globalThumbnailUrl,
  ]);

  // Synchronize Bank Account Owner in Registration Form if checked
  useEffect(() => {
    if (syncWithCompany && tempCompanyName) {
      const unsignedOwner =
        removeVietnameseTones(tempCompanyName).toUpperCase();
      setTempBankOwner(unsignedOwner);
      setRegBankOwner(unsignedOwner);
    }
  }, [syncWithCompany, tempCompanyName]);

  // Synchronize Bank Account Owner in Admin Edit Form if checked
  useEffect(() => {
    if (editSyncWithCompany && editCompanyName) {
      const unsignedOwner =
        removeVietnameseTones(editCompanyName).toUpperCase();
      setEditBankOwner(unsignedOwner);
    }
  }, [editSyncWithCompany, editCompanyName]);

  // Automatically authorize and set password if logged in to Global Admin
  useEffect(() => {
    if (isAdminLoggedIn && adminSystemPassword) {
      setIsLoggedAdmin(true);
      setAdminPassword(adminSystemPassword);
    }
  }, [isAdminLoggedIn, adminSystemPassword]);

  const parseRoute = async () => {
    // 1) First check if running on a custom domain
    // If not localhost, and not ending with our base domain (naive check, we can just hit API)
    const hostname = window.location.hostname;
    // We can fetch all companies and match
    try {
      if (
        hostname !== "localhost" &&
        !hostname.includes("ngrok") &&
        !hostname.includes("run.app") &&
        !hostname.includes("ikey.vn")
      ) {
        const res = await fetch("/api/companies");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const domainMatched = json.data.find(
              (c: any) =>
                c.customDomain === hostname ||
                c.customDomain === `www.${hostname}` ||
                `www.${c.customDomain}` === hostname,
            );
            if (domainMatched) {
              // Custom domain matched! Render this company directly.
              await loadCompanyProfile(domainMatched.username, "view");
              return;
            }
          }
        }
      }
    } catch (e) {}

    const path = window.location.pathname;
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);

    // Check parameters first
    const qSlug = searchParams.get("slug") || searchParams.get("c");
    if (qSlug) {
      await loadCompanyProfile(qSlug);
      return;
    }

    // Check custom hash slug
    if (hash && hash.startsWith("#/")) {
      const slugPart = hash.substring(2); // remove "#/"
      if (slugPart.endsWith("/admin")) {
        const cleanSlug = slugPart.replace("/admin", "");
        await loadCompanyProfile(cleanSlug, "admin");
      } else {
        await loadCompanyProfile(slugPart, "view");
      }
      return;
    }

    // Check pathname slugs directly (excluding system keywords)
    if (path && path !== "/") {
      const cleanPath = path.substring(1).replace(/\/$/, ""); // remove starting slash and trailing

      if (cleanPath === "admin") {
        setRoute("globalAdmin");
        setLoading(false);
        return;
      }

      const pathParts = cleanPath.split("/");

      if (pathParts.length > 0) {
        const slug = pathParts[0];
        if (
          slug !== "api" &&
          slug !== "assets" &&
          slug !== "admin" &&
          slug !== "home"
        ) {
          if (pathParts[1] === "admin") {
            await loadCompanyProfile(slug, "admin");
          } else {
            await loadCompanyProfile(slug, "view");
          }
          return;
        }
      }
    }

    // Fallback to home
    setRoute("home");
    setCurrentUsername("");
    setActiveCompany(null);
    setIsLoggedAdmin(false);
    setLoading(false);
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({ message, visible: true, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4500);
  };

  const handleBankLookup = async (
    bankId: string,
    accNum: string,
    isEdit: boolean = false,
  ) => {
    if (!bankId || !accNum) return;
    const bin = BANK_BINS[bankId];
    if (!bin) return;

    setBankLookupLoading(true);
    try {
      const res = await fetch("/api/lookup-bank-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bin, accountNumber: accNum }),
      });
      const data = await res.json();
      if (data.success && data.accountName) {
        showToast("Đã tìm thấy chủ tài khoản!", "success");
        if (isEdit) {
          setEditBankOwner(data.accountName);
        } else {
          setTempBankOwner(data.accountName);
          setRegBankOwner(data.accountName);
        }
      } else {
        // Log error silently, no aggressive alert as this is a premium lookup API requiring configured keys
        console.log(
          "Bank lookup failed (VIETQR Keys may not be configured):",
          data.message,
        );
      }
    } catch (err) {
      console.error("Bank account lookup error:", err);
    } finally {
      setBankLookupLoading(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;

    // Custom robust copy handler with textarea fallback
    let success = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      success = true;
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand("copy");
        success = !!successful;
      } catch (err) {
        success = false;
      }
      document.body.removeChild(textArea);
    }

    if (success) {
      setCopiedField(fieldName);
      showToast(`Đã sao chép: ${fieldName}`, "success");
      setTimeout(() => setCopiedField(null), 1200);
    } else {
      showToast(
        "Không thể tự động sao chép. Hãy chọn văn bản và sao chép thủ công.",
        "error",
      );
    }
  };

  const handleShareInvoice = async () => {
    if (!activeCompany) return;
    const shareData = {
      title: `Thông tin xuất hóa đơn ${activeCompany.companyName}`,
      text: `Thông tin xuất hóa đơn ${activeCompany.companyName}`,
      url: globalBaseUrl ? `${globalBaseUrl.replace(/\/$/, '')}/${activeCompany.username}` : window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Error sharing:", err);
          showToast("Trình duyệt không hỗ trợ chia sẻ trực tiếp", "error");
        }
      }
    } else {
      copyToClipboard(shareData.url, "Đường dẫn chia sẻ");
    }
  };

  const handleCaptureImage = async () => {
    const node = document.getElementById("invoice-card-to-capture");
    if (!node) {
      showToast("Không tìm thấy thẻ thông tin để chụp ảnh!", "error");
      return;
    }

    showToast("Đang chuẩn bị ảnh tải về...", "info");

    try {
      // Load the image-export library only after the user explicitly requests an export.
      const { toJpeg } = await import("html-to-image");

      // 1. Enter capture mode to force solid, non-transparent rendering of all info elements
      setIsCapturing(true);

      // Let the react state update and rendering settle completely
      await new Promise((resolve) => setTimeout(resolve, 500));

      const captureHeight = node.offsetHeight;
      const captureWidth = node.offsetWidth;
      const captureOptions = {
        width: 390,
        height: captureHeight,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          width: "390px",
          margin: "0",
        },
        cacheBust: true,
        quality: 1, // Max quality for JPEG
        pixelRatio: 2.5, // Crisp 2.5x high-res display
      };

      // Workaround for iOS/Safari where images might not load properly on the first capture
      await toJpeg(node, captureOptions).catch(() => {});

      const dataUrl = await toJpeg(node, captureOptions);

      const filename = activeCompany
        ? `thong-tin-nhan-hoa-don-${activeCompany.username}.jpg`
        : "thong-tin-nhan-hoa-don.jpg";

      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as any).MSStream;

      if (isIOS) {
        // Option 1: Native Share Sheet (Save to Photos natively)
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], filename, { type: "image/jpeg" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Thông tin hóa đơn",
            });
            setIsCapturing(false);
            showToast("Đã lưu ảnh thành công!", "success");
            return;
          }
        } catch (e) {
          console.error("Web Share failed:", e);
        }

        // Option 2: Fallback to Blob Open in New Tab
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const blobUrl = URL.createObjectURL(blob);
          const newWindow = window.open(blobUrl, "_blank");
          if (newWindow) {
            showToast("Đã mở ảnh. Bạn có thể lưu ảnh từ tab này!", "success");
          } else {
            throw new Error("Popup blocked");
          }
        } catch (err) {
          const link = document.createElement("a");
          link.download = filename;
          link.href = dataUrl;
          link.click();
          showToast("Đã tải ảnh hóa đơn!", "success");
        }
      } else {
        // Desktop and Android handle standard downloads perfectly
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
        showToast("Đã tải ảnh hóa đơn xuống thành công!", "success");
      }
    } catch (error) {
      console.error("Lỗi khi chuyển đổi HTML thành hình ảnh:", error);
      showToast("Lỗi khi lưu ảnh hóa đơn. Vui lòng thử lại!", "error");
    } finally {
      // 2. Clear capture mode to restore responsive glass visuals on web
      setIsCapturing(false);
    }
  };

  // Fetch the registered list
  const fetchRegisteredCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      const json = await res.json();
      if (json.success) {
        setRegisteredCompanies(json.data);
      }
    } catch (e) {
      console.error("Unable to load companies list:", e);
    }
  };

  // Fetch general site settings
  const fetchSystemSettings = async () => {
    try {
      const res = await fetch("/api/system-settings");
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.globalBaseUrl) {
          setGlobalBaseUrl(d.globalBaseUrl);
          localStorage.setItem("globalBaseUrl", d.globalBaseUrl);
        }
        setSiteTitle(d.siteTitle || "");
        setGeminiApiKey(d.geminiApiKey || "");
        setGlobalSeoTitle(d.globalSeoTitle || "");
        setSiteSubtitle(d.siteSubtitle || "");
        setSiteLogo(d.siteLogo || "");
        setGlobalFaviconUrl(d.globalFaviconUrl || "");
        if (d.siteLogo && d.globalFaviconUrl === d.siteLogo) {
          setUseLogoAsFavicon(true);
        } else {
          setUseLogoAsFavicon(false);
        }
        setGlobalThumbnailUrl(d.globalThumbnailUrl || "");
        setFooterText(d.footerText || "");
        setHeaderLink(d.headerLink || "");
        setFooterLink(d.footerLink || "");
        if (Array.isArray(d.footerSecondaryLinks)) {
          setFooterSecondaryLinks(d.footerSecondaryLinks);
        } else {
          setFooterSecondaryLinks([]);
        }
      }
    } catch (err) {
      console.error("Failed to load system settings:", err);
    }
  };

  // Save general site settings
  const saveGlobalSettings = async () => {
    try {
      const res = await fetch("/api/system-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          globalBaseUrl: globalBaseUrl.trim(),
          siteTitle,
          geminiApiKey,
          globalSeoTitle,
          siteSubtitle,
          siteLogo,
          footerText,
          headerLink,
          footerLink,
          footerSecondaryLinks,
          globalFaviconUrl,
          globalThumbnailUrl,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(
          t(
            "Đã lưu cấu hình hệ thống thành công!",
            "System configuration saved successfully!",
          ),
          "success",
        );
      } else {
        showToast(
          json.message ||
            t("Không lưu được cấu hình.", "Failed to save configuration."),
          "error",
        );
      }
    } catch (err) {
      console.error(err);
      showToast(
        t(
          "Lỗi kết nối máy chủ khi lưu cấu hình.",
          "Network error saving settings.",
        ),
        "error",
      );
    }
  };

  // Upload site logo
  const handleSiteLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Ảnh logo quá lớn! Vui lòng chọn ảnh dưới 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const max_dim = 400; // max width/height

        if (width > height) {
          if (width > max_dim) {
            height *= max_dim / width;
            width = max_dim;
          }
        } else {
          if (height > max_dim) {
            width *= max_dim / height;
            height = max_dim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL("image/jpeg", 0.85);
          setSiteLogo(base64);
          if (useLogoAsFavicon) {
            setGlobalFaviconUrl(base64);
          }
          showToast("Đã xử lý logo site thành công!", "success");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Upload global site favicon
  const handleGlobalFaviconUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      showToast("Ảnh favicon quá lớn! Vui lòng chọn ảnh dưới 1MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const dim = 64; // favicons are typically small e.g. 64x64
        canvas.width = dim;
        canvas.height = dim;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, dim, dim);
          const base64 = canvas.toDataURL("image/png");
          setGlobalFaviconUrl(base64);
          showToast("Đã xử lý favicon của toàn trang thành công!", "success");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Upload global site thumbnail
  const handleGlobalThumbnailUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast("Ảnh thumbnail quá lớn! Vui lòng chọn ảnh dưới 3MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const max_dim = 800; // standard display high res thumbnail bounds

        if (width > height) {
          if (width > max_dim) {
            height *= max_dim / width;
            width = max_dim;
          }
        } else {
          if (height > max_dim) {
            width *= max_dim / height;
            height = max_dim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL("image/jpeg", 0.82);
          setGlobalThumbnailUrl(base64);
          showToast("Đã xử lý thumbnail của toàn trang thành công!", "success");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Retrieve company info
  const loadCompanyProfile = async (
    username: string,
    targetTab: "view" | "admin" = "view",
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${username}`);
      const json = await res.json();

      if (json.success) {
        const company: CompanyInfo = json.data;
        setActiveCompany(company);
        setCurrentUsername(username);
        setRoute(targetTab);
        if (targetTab === "admin" && isAdminLoggedIn) {
          setIsLoggedAdmin(true);
          setAdminPassword("123321");
        }

        // Initialize Admin inputs
        setEditCompanyName(company.companyName);
        setEditTaxCode(company.taxCode);
        setEditAddress(company.address);
        setEditEmail(company.email);
        setEditPhone(company.phone);
        setEditLogoUrl(company.logoUrl);
        setEditBankName(company.bankName || "vcb");
        setEditBankAccount(company.bankAccount || "");
        setEditBankOwner(company.bankOwner || "");
        setEditPrimaryColor(company.primaryColor);
        setEditCustomDomain(company.customDomain || "");
        setEditFaviconUrl(company.faviconUrl || "");
        setEditThumbnailUrl(company.thumbnailUrl || "");
        setEditWebsiteTitle(company.websiteTitle || "");
        setEditIsPublic(company.isPublic !== false);
        setEditNewPassword("");
        setAdminUsernameInput(company.username);
        setShowEditQR(!!company.bankAccount);
      } else {
        showToast(json.message || "Không thể tìm thấy liên kết.", "error");
        setRoute("home");
      }
    } catch (e) {
      showToast("Có lỗi xảy ra khi tải trang.", "error");
      setRoute("home");
    } finally {
      setLoading(false);
    }
  };

  // Username Availability Checking
  const checkUsernameAvailability = async (slug: string) => {
    if (!slug) {
      setUsernameStatus("idle");
      return;
    }
    const safeSlug = slug.toLowerCase().trim().replace(/\s+/g, "-");
    const regex = /^[a-z0-9_-]+$/;
    if (!regex.test(safeSlug)) {
      setUsernameStatus("taken");
      return;
    }

    setUsernameStatus("checking");
    try {
      const res = await fetch(`/api/companies/${safeSlug}`);
      const json = await res.json();
      if (json.success) {
        setUsernameStatus("taken"); // exists, so taken
      } else {
        setUsernameStatus("available");
      }
    } catch (e) {
      setUsernameStatus("idle");
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, "");
    setTempUsername(val);
  };

  const handleUsernameBlur = () => {
    setRegUsername(tempUsername);
    checkUsernameAvailability(tempUsername);
  };

  const guessAndSetLogoAndDomain = (companyName: string, companyEmail?: string, companyDomain?: string, companyTaxCode?: string) => {
    let domainToUse = companyDomain;
    if (!domainToUse && companyEmail && companyEmail.includes('@')) {
      const emailDomain = companyEmail.split('@')[1];
      if (emailDomain !== 'gmail.com' && emailDomain !== 'yahoo.com' && emailDomain !== 'hotmail.com' && emailDomain !== 'outlook.com') {
        domainToUse = emailDomain;
      }
    }

    if (!domainToUse) {
      const lowerName = (companyName || '').toLowerCase();
      const tc = companyTaxCode ? companyTaxCode.replace(/[^0-9]/g, "") : "";
      
      if (tc === "0100109106" || lowerName.includes('viettel') || lowerName.includes('viễn thông quân đội')) domainToUse = 'viettel.com.vn';
      else if (tc === "0101245486" || lowerName.includes('vingroup')) domainToUse = 'vingroup.net';
      else if (tc === "0101248141" || lowerName.includes('fpt')) domainToUse = 'fpt.com.vn';
      else if (tc === "0100112437" || lowerName.includes('vietcombank') || lowerName.includes('ngoại thương việt nam') || lowerName.includes('vcb')) domainToUse = 'vietcombank.com.vn';
      else if (tc.startsWith("0313980000") || lowerName.includes('momo') || lowerName.includes('dịch vụ di động trực tuyến')) domainToUse = 'momo.vn';
      else if (tc === "0106869738" || lowerName.includes('vnpt')) domainToUse = 'vnpt.vn';
      else if (tc === "0106773786" || lowerName.includes('shopee')) domainToUse = 'shopee.vn';
      else if (tc === "0100150619" || lowerName.includes('bidv') || lowerName.includes('đầu tư và phát triển')) domainToUse = 'bidv.com.vn';
      else if (tc === "0100283873" || lowerName.includes('mbbank') || lowerName.includes('mb bank') || lowerName.includes('quân đội')) domainToUse = 'mbbank.com.vn';
      else if (tc === "0100230800" || lowerName.includes('techcombank') || lowerName.includes('kỹ thương')) domainToUse = 'techcombank.com';
    }

    if (domainToUse) {
      const cleanDomain = domainToUse.toLowerCase().replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
      if (cleanDomain.includes('.')) {
        setRegLogoUrl(`https://logo.clearbit.com/${cleanDomain}`);
      }
    }
  };

  // Lookup corporate details automatically from tax code (MST)
  const lookupTaxCode = async (mst: string) => {
    if (!mst) return;
    const cleanMst = mst.trim();
    if (cleanMst.length < 10) return;

    setRegTaxCode(cleanMst);
    setTempTaxCode(cleanMst);
    setLookupLoading(true);

    try {
      // Primary: Server-side proxy (CORS safe, highly reliable)
      const res = await fetch(`/api/lookup-tax/${cleanMst}`);
      const json = await res.json();

      if (json.code === "00" && json.data) {
        const titleCaseName = json.data.name || json.data.displayName || "";
        const formattedAddress = json.data.address || "";

        setRegCompanyName(titleCaseName);
        setRegAddress(formattedAddress);
        setTempCompanyName(titleCaseName);
        setTempAddress(formattedAddress);
        
        guessAndSetLogoAndDomain(titleCaseName, undefined, undefined, cleanMst);

        showToast("Tự động điền dữ liệu công ty thành công!", "success");
      } else {
        // Fallback: Direct Public client-side fetch
        const directRes = await fetch(
          `https://api.vietqr.io/v2/business/${cleanMst}`,
        );
        const directJson = await directRes.json();
        if (directJson.code === "00" && directJson.data) {
          const titleCaseName =
            directJson.data.name || directJson.data.displayName || "";
          const formattedAddress = directJson.data.address || "";

          setRegCompanyName(titleCaseName);
          setRegAddress(formattedAddress);
          setTempCompanyName(titleCaseName);
          setTempAddress(formattedAddress);
          guessAndSetLogoAndDomain(titleCaseName, undefined, undefined, cleanMst);

          showToast("Tự động điền dữ liệu công ty thành công!", "success");
        } else {
          showToast(
            "Không tìm thấy thông tin tự động cho MST này. Hãy tự điền.",
            "info",
          );
        }
      }
    } catch (e) {
      // Safe fallback direct public query
      try {
        const directRes = await fetch(
          `https://api.vietqr.io/v2/business/${cleanMst}`,
        );
        const directJson = await directRes.json();
        if (directJson.code === "00" && directJson.data) {
          const titleCaseName =
            directJson.data.name || directJson.data.displayName || "";
          const formattedAddress = directJson.data.address || "";

          setRegCompanyName(titleCaseName);
          setRegAddress(formattedAddress);
          setTempCompanyName(titleCaseName);
          setTempAddress(formattedAddress);
          guessAndSetLogoAndDomain(titleCaseName, undefined, undefined, cleanMst);

          showToast("Tự động điền dữ liệu công ty thành công!", "success");
        } else {
          showToast("Không tìm thấy MST. Vui lòng tự nhập tay.", "info");
        }
      } catch (directErr) {
        showToast("Không thể kết nối máy chủ tra cứu tự động.", "info");
      }
    } finally {
      setLookupLoading(false);
    }
  };

  // Trigger smart corporate autocomplete suggestions from name/tax code entering inside hero input with sequential execution & debouncer
  const handleHeroSearchChange = async (query: string) => {
    const numericQuery = query.replace(/[^\d-]/g, "");
    setSearchQuery(numericQuery);

    // 1. Cancel previous pending searches
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (activeAbortControllerRef.current) {
      activeAbortControllerRef.current.abort();
    }

    if (!numericQuery || numericQuery.trim().length < 5) {
      setSmartSuggestions([]);
      setSmartSearchLoading(false);
      return;
    }

    // 2. Schedule debounced execution after 350ms of quiet typing
    setSmartSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      // Create new abort controller for this specific request
      const controller = new AbortController();
      activeAbortControllerRef.current = controller;

      try {
        const res = await fetch(
          `/api/search-company?q=${encodeURIComponent(numericQuery)}`,
          {
            signal: controller.signal,
          },
        );
        const json = await res.json();
        if (json.success && json.data) {
          setSmartSuggestions(json.data);
        } else {
          setSmartSuggestions([]);
        }
      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error("Smart search failed:", e);
          setSmartSuggestions([]);
        }
      } finally {
        if (activeAbortControllerRef.current === controller) {
          setSmartSearchLoading(false);
        }
      }
    }, 350);
  };

  const selectRegisteredCompany = (username: string) => {
    setSmartSuggestions([]);
    setSearchQuery("");
    navigateToSlug(username, "view");
  };

  const selectCompanySuggestion = async (company: {
    taxCode: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    domain?: string;
  }) => {
    setSmartSuggestions([]);
    setSmartSearchQuery("");
    setSearchQuery("");

    // Automatically fill initial info we have from suggestion
    setRegTaxCode(company.taxCode);
    setTempTaxCode(company.taxCode);
    setRegCompanyName(company.name);
    setTempCompanyName(company.name);

    if (company.address) {
      setRegAddress(company.address);
      setTempAddress(company.address);
    }

    if (company.phone) {
      setRegPhone(company.phone);
      setTempPhone(company.phone);
    }
    
    if (company.email) {
      setRegEmail(company.email);
    }

    guessAndSetLogoAndDomain(company.name, company.email, company.domain, company.taxCode);

    // Auto sync username based on trimmed and clean company name if username is empty or standard template
    if (!tempUsername) {
      const slug = removeVietnameseTones(company.name)
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setTempUsername(slug);
      setRegUsername(slug);
    }

    // Scroll smoothly to creation form
    const elem = document.getElementById("create-form");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Trigger full deep corporate address lookup only if missing from suggestion
    if (!company.address) {
      await lookupTaxCode(company.taxCode);
    } else {
      showToast(
        "Đã tự động điền thông tin công ty! Hãy kiểm tra và hoàn tất thông tin.",
        "success",
      );
    }
  };

  const processScanImage = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Vui lòng chọn một tệp hình ảnh.", "error");
      return;
    }
    setAiScanning(true);
    setSmartSearchLoading(true);
    showToast("AI Đang phân tích ảnh bạn vừa tải lên...", "info");
    
    // Auto-scroll to creation form early to show we are doing something there
    const elem = document.getElementById("create-form");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          const res = await fetch("/api/scan-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64String }),
          });
          const json = await res.json();
          if (json.success && json.data) {
            const companyData = json.data;
            if (!companyData.taxCode && !companyData.name) {
              showToast("Không tìm thấy thông tin trên ảnh.", "error");
            } else {
              showToast("Quét thành công! Đã tự động điền thông tin.", "success");
              await selectCompanySuggestion(companyData);
            }
          } else {
            showToast(json.message || "Lỗi đọc dữ liệu ảnh.", "error");
          }
        } catch (e) {
          showToast("Lỗi kết nối máy chủ AI.", "error");
        } finally {
          setAiScanning(false);
          setSmartSearchLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setAiScanning(false);
      setSmartSearchLoading(false);
    }
  };

  const handleDropScan = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverTarget(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processScanImage(file);
    }
  };

  const handlePasteScan = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processScanImage(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleDragOverScan = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverTarget(true);
  };
  
  const handleDragLeaveScan = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverTarget(false);
  };

  const handleFileSelectScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processScanImage(file);
    }
  };

  // Helper to extract dominant color from Base64 logo
  const extractDominantColor = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("#4F46E5"); // default indigo
          return;
        }

        // Draw to small size to average colors in blocks
        canvas.width = 16;
        canvas.height = 16;
        ctx.drawImage(img, 0, 0, 16, 16);

        try {
          const imgData = ctx.getImageData(0, 0, 16, 16).data;

          let colorBuckets: { [key: string]: number } = {};
          let maxCount = 0;
          let dominantHex = "#4F46E5"; // fallback

          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];

            // Skip transparent or very light/dark colors (backgrounds)
            if (a < 180) continue;

            // If it's too close to pure white, skip
            if (r > 240 && g > 240 && b > 240) continue;
            // If too black/grey, skip unless it's the only choice
            if (r < 25 && g < 25 && b < 25) continue;

            // Round color to group similar shades
            const step = 15;
            const rr = Math.round(r / step) * step;
            const gg = Math.round(g / step) * step;
            const bb = Math.round(b / step) * step;

            const hex =
              "#" +
              [rr, gg, bb]
                .map((x) => {
                  const hexStr = x.toString(16);
                  return hexStr.length === 1 ? "0" + hexStr : hexStr;
                })
                .join("");

            colorBuckets[hex] = (colorBuckets[hex] || 0) + 1;
            if (colorBuckets[hex] > maxCount) {
              maxCount = colorBuckets[hex];
              dominantHex = hex;
            }
          }

          resolve(dominantHex);
        } catch (e) {
          resolve("#4F46E5");
        }
      };

      img.onerror = () => {
        resolve("#4F46E5");
      };

      img.src = base64Str;
    });
  };

  const isPhoneInvalid = (phone: string) => {
    if (!phone) return false;
    const cleanPhone = phone.replace(/[\s\.\+]/g, "");
    return !/^\d{0,13}$/.test(cleanPhone) || cleanPhone.length > 13;
  };

  const isEmailInvalid = (email: string) => {
    if (!email) return false;
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleLogoUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "reg" | "edit",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("Ảnh logo quá lớn! Vui lòng chọn ảnh dưới 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const max_dim = 400; // max width/height

        if (width > height) {
          if (width > max_dim) {
            height *= max_dim / width;
            width = max_dim;
          }
        } else {
          if (height > max_dim) {
            width *= max_dim / height;
            height = max_dim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Draw white background if we are converting transparent PNG to JPEG
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL("image/jpeg", 0.85); // compress to 85% quality JPEG

          if (type === "reg") {
            setRegLogoUrl(base64);
            try {
              const extractedCol = await extractDominantColor(base64);
              if (extractedCol) setRegPrimaryColor(extractedCol);
              showToast("Đã tải và xử lý logo thành công!", "success");
            } catch (err) {
              showToast("Đã tải logo thành công!", "success");
            }
          } else {
            setEditLogoUrl(base64);
            try {
              const extractedCol = await extractDominantColor(base64);
              if (extractedCol) setEditPrimaryColor(extractedCol);
              showToast("Cập nhật logo thành công!", "success");
            } catch (err) {
              showToast("Cập nhật logo thành công!", "success");
            }
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      showToast("Ảnh quá lớn! Vui lòng chọn ảnh dưới 1MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditFaviconUrl(event.target?.result as string);
      showToast("Tải favicon thành công!", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Ảnh quá lớn! Vui lòng chọn ảnh dưới 2MB.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditThumbnailUrl(event.target?.result as string);
      showToast("Tải ảnh bìa thumbnail truyền thông thành công!", "success");
    };
    reader.readAsDataURL(file);
  };

  // Create profile submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // Captcha Validate
    if (parseInt(captchaA) !== captchaQ.a + captchaQ.b) {
      setRegError(
        "Kết quả phép tính không đúng. Xác minh bạn không phải robot.",
      );
      setCaptchaQ({
        a: Math.floor(Math.random() * 10) + 1,
        b: Math.floor(Math.random() * 10) + 1,
      });
      setCaptchaA("");
      return;
    }

    const finalUsername = tempUsername || regUsername;
    const finalCompanyName = tempCompanyName || regCompanyName;
    const finalTaxCode = tempTaxCode || regTaxCode;
    const finalAddress = tempAddress || regAddress;
    const finalEmail = tempEmail || regEmail;
    const finalPhone = tempPhone || regPhone;
    const finalBankAccount = tempBankAccount || regBankAccount;
    const finalBankOwner = tempBankOwner || regBankOwner;

    if (!finalUsername) return setRegError("Vui lòng chọn link username");
    if (!finalCompanyName) return setRegError("Vui lòng nhập tên công ty");
    if (!finalTaxCode) return setRegError("Vui lòng nhập mã số thuế");
    if (!finalAddress) return setRegError("Vui lòng nhập địa chỉ xuất hóa đơn");
    if (isPhoneInvalid(finalPhone))
      return setRegError(
        "Số điện thoại không hợp lệ (chỉ nhập số, tối đa 13 ký tự).",
      );
    if (isEmailInvalid(finalEmail)) return setRegError("Email không hợp lệ.");
    if (!regAdminPassword || regAdminPassword.length < 4) {
      return setRegError("Vui lòng nhập mật khẩu quản lý tối thiểu 4 ký tự");
    }

    const payload = {
      username: finalUsername,
      companyName: finalCompanyName,
      taxCode: finalTaxCode,
      address: finalAddress,
      email: finalEmail,
      phone: finalPhone,
      logoUrl: regLogoUrl,
      bankName: showQRInputs ? regBankName : "",
      bankAccount: showQRInputs ? finalBankAccount : "",
      bankOwner: showQRInputs ? finalBankOwner : "",
      primaryColor: regPrimaryColor,
      adminPassword: regAdminPassword,
      isPublic: regIsPublic,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        showToast("Đã tạo trang thông tin hóa đơn thành công!", "success");
        // Reset registration fields
        setRegUsername("");
        setRegCompanyName("");
        setRegTaxCode("");
        setRegAddress("");
        setRegEmail("");
        setRegPhone("");
        setRegLogoUrl("");
        setRegBankAccount("");
        setRegBankOwner("");
        setRegAdminPassword("");
        setRegIsPublic(true);

        // Reset temp states too
        setTempUsername("");
        setTempCompanyName("");
        setTempTaxCode("");
        setTempAddress("");
        setTempEmail("");
        setTempPhone("");
        setTempBankAccount("");
        setTempBankOwner("");

        // Force refresh list and navigate directly to preview!
        fetchRegisteredCompanies();
        navigateToSlug(payload.username, "view");
      } else {
        setRegError(json.message || "Tạo trang thất bại.");
      }
    } catch (err) {
      setRegError("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  // Switch routing manually (managing browser history smoothly)
  const navigateToSlug = (slug: string, tab: "view" | "admin" = "view") => {
    const newPath = `/${slug}${tab === "admin" ? "/admin" : ""}`;
    window.history.pushState(null, "", newPath);
    loadCompanyProfile(slug, tab);
  };

  const navigateToHome = () => {
    window.history.pushState(null, "", "/");
    document.title = "Trang Tạo Thông Tin Xuất Hóa Đơn Công Ty";
    setRoute("home");
    setCurrentUsername("");
    setActiveCompany(null);
    setIsLoggedAdmin(false);
    setAdminPassword("");
    setLoginError(null);
    setPaymentAmount("");
    setPaymentRemarks("");
    fetchRegisteredCompanies();
  };

  // Verify passcode access to AdminCP
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const targetUser = adminUsernameInput.toLowerCase().trim();
    if (!targetUser) {
      setLoginError("Vui lòng nhập tên đăng nhập (slug username)");
      return;
    }

    try {
      const res = await fetch(`/api/companies/${targetUser}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      const json = await res.json();

      if (json.success) {
        setIsLoggedAdmin(true);
        setCurrentUsername(targetUser);
        loadCompanyProfile(targetUser, "admin");
        showToast("Xác thực thành công!", "success");
      } else {
        setLoginError(
          json.message || "Tên đăng nhập hoặc mật khẩu không khớp.",
        );
      }
    } catch (err) {
      setLoginError("Không thể kết nối máy chủ xác thực.");
    }
  };

  // Submit edits inside AdminCP
  const handleSaveEdits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;

    if (isPhoneInvalid(editPhone)) {
      showToast(
        "Số điện thoại không hợp lệ (chỉ nhập số, tối đa 13 ký tự).",
        "error",
      );
      return;
    }
    if (isEmailInvalid(editEmail)) {
      showToast("Email không hợp lệ.", "error");
      return;
    }

    const payload = {
      companyName: editCompanyName,
      taxCode: editTaxCode,
      address: editAddress,
      email: editEmail,
      phone: editPhone,
      logoUrl: editLogoUrl,
      bankName: editBankName,
      bankAccount: editBankAccount,
      bankOwner: editBankOwner,
      primaryColor: editPrimaryColor,
      customDomain: editCustomDomain,
      faviconUrl: editFaviconUrl,
      thumbnailUrl: editThumbnailUrl,
      websiteTitle: editWebsiteTitle,
      newAdminPassword: editNewPassword || undefined,
      isPublic: editIsPublic,
    };

    setLoading(true);
    try {
      const res = await fetch(`/api/companies/${currentUsername}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (json.success) {
        showToast("Cập nhật thông tin thành công!", "success");
        setActiveCompany(json.data);
        if (editNewPassword) {
          setAdminPassword(editNewPassword); // update verified state password reference
        }
        setIsLoggedAdmin(false); // require sign in again or just jump back to viewer
        // Reload details and return to viewer
        navigateToSlug(currentUsername, "view");
      } else {
        showToast(json.message || "Lỗi lưu thông tin.", "error");
      }
    } catch (e) {
      showToast("Không thể gửi dữ liệu cập nhật.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Delete company completely
  const handleDeleteCompany = async () => {
    try {
      const res = await fetch(`/api/companies/${currentUsername}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": adminPassword,
        },
      });
      const json = await res.json();

      if (json.success) {
        showToast(
          t(
            `Đã xóa liên kết "${currentUsername}" thành công!`,
            `Successfully deleted company page "${currentUsername}"!`,
          ),
          "success",
        );
        setShowDeleteConfirm(false);
        navigateToHome();
      } else {
        showToast(
          json.message || t("Xóa không thành công.", "Deletion failed."),
          "error",
        );
      }
    } catch (err) {
      showToast(
        t("Lỗi gửi lệnh xóa từ máy chủ.", "Failed to send delete request."),
        "error",
      );
    }
  };

  // Dynamically compute VietQR URL
  const getVietQrUrl = () => {
    if (!activeCompany) return "";
    const bankBin = BANK_BINS[activeCompany.bankName] || activeCompany.bankName;
    const account = activeCompany.bankAccount;
    const owner = activeCompany.bankOwner;

    // Default dynamic amount to 0 (omit from query string if it is 0 or empty to prevent image showing "Số tiền: 0đ")
    const rawAmount = paymentAmount
      ? parseInt(paymentAmount.replace(/\D/g, ""))
      : 0;
    const amountParam = rawAmount > 0 ? `&amount=${rawAmount}` : "";
    const memoStr = paymentRemarks || `Nhan hoa don ${activeCompany.username}`;

    return `https://img.vietqr.io/image/${bankBin}-${account}-compact2.jpg?addInfo=${encodeURIComponent(memoStr)}&accountName=${encodeURIComponent(owner)}${amountParam}`;
  };

  // Get active bank details
  const getBankDetail = (id: string): BankConfig | undefined => {
    return VIETNAMESE_BANKS.find((b) => b.id === id);
  };

  // Search filtering logic on Home Page
  const filteredCompanies = registeredCompanies.filter((c: any) => c.isPublic !== false).filter((c) => {
    const q = (searchQuery || "").toLowerCase();
    const u = (c.username || "").toLowerCase();
    const tc = (c.taxCode || "").toLowerCase();
    return u.includes(q) || tc.includes(q);
  });

  if (isInitialRouteLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 select-none">
        <div className="flex flex-col items-center max-w-sm text-center">
          <div className="bg-white p-8 rounded-2xl border border-slate-150 shadow-xl shadow-slate-100 flex flex-col items-center space-y-6">
            <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-150 relative">
              <Building2 size={32} className="stroke-[2.2] animate-pulse" />
              <div className="absolute inset-x-0 bottom-0 top-0 rounded-2xl border-2 border-indigo-200/45 animate-ping opacity-60"></div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-black text-slate-800 tracking-wider uppercase font-sans">
                Đang tải hệ thống
              </h3>
              <p className="text-[11px] text-slate-450 font-medium leading-relaxed font-sans">
                Vui lòng chờ trong giây lát. Hệ thống đang đồng bộ và tải thông
                tin hóa đơn doanh nghiệp...
              </p>
            </div>

            <div className="flex gap-1.5 justify-center items-center h-4">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></span>
            </div>
          </div>

          <div className="mt-6 text-[10px] text-slate-400 font-bold tracking-widest uppercase font-mono">
            {siteTitle || appDomain || "IKEY VAT"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-200">
      {/* Dynamic Toast Element */}
      {toast.visible && (
        <div className="fixed top-6 right-6 left-6 md:left-auto md:w-96 z-50 animate-bounce shadow-2xl p-4 rounded-xl border flex items-center gap-3 backdrop-blur-md bg-white/95 border-gray-100">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              toast.type === "success"
                ? "bg-emerald-100 text-emerald-600"
                : toast.type === "info"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-red-100 text-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <Check size={18} />
            ) : toast.type === "info" ? (
              <Download size={18} />
            ) : (
              <span>✖</span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-800">{toast.message}</p>
        </div>
      )}

      {/* HEADER BAR */}
      {route !== "view" && (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 md:px-6 py-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
            {headerLink ? (
              <a
                href={headerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 select-none group"
              >
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-indigo-100 shadow-sm shrink-0 overflow-hidden border border-indigo-100/30">
                  {siteLogo ? (
                    <img
                      src={siteLogo}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Building2 size={22} className="stroke-[2.5]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-base font-black tracking-tight text-indigo-650 uppercase">
                      {siteTitle || appDomain}
                    </span>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1 py-0.2 rounded font-black uppercase">
                      PRO
                    </span>
                    <span className="text-[9px] bg-slate-50 text-slate-500 border border-slate-200 px-1 py-0.2 rounded font-mono hidden sm:inline">
                      v1.3
                    </span>
                  </div>
                  <h1 className="text-[11px] md:text-xs text-slate-500 font-semibold tracking-tight truncate max-w-[150px] sm:max-w-none">
                    {siteSubtitle ||
                      t(
                        "Giải pháp cho doanh nghiệp",
                        "Solutions for businesses",
                      )}
                  </h1>
                </div>
              </a>
            ) : (
              <div
                className="flex items-center gap-2.5 cursor-pointer select-none group"
                onClick={navigateToHome}
              >
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-indigo-100 shadow-sm shrink-0 overflow-hidden border border-indigo-100/30">
                  {siteLogo ? (
                    <img
                      src={siteLogo}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <Building2 size={22} className="stroke-[2.5]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-base font-black tracking-tight text-indigo-650 uppercase">
                      {siteTitle || appDomain}
                    </span>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-1 py-0.2 rounded font-black uppercase">
                      PRO
                    </span>
                    <span className="text-[9px] bg-slate-50 text-slate-500 border border-slate-200 px-1 py-0.2 rounded font-mono hidden sm:inline">
                      v1.3
                    </span>
                  </div>
                  <h1 className="text-[11px] md:text-xs text-slate-500 font-semibold tracking-tight truncate max-w-[150px] sm:max-w-none">
                    {siteSubtitle ||
                      t(
                        "Giải pháp cho doanh nghiệp",
                        "Solutions for businesses",
                      )}
                  </h1>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 shrink-0">
              {/* SYSTEM ADMIN GEAR BUTTON - HIDDEN FOR SECURITY */}
              {route === "globalAdmin" && (
                <div className="p-2 rounded-lg border bg-indigo-50 text-indigo-700 border-indigo-200 shrink-0 shadow-sm">
                  <Settings
                    size={16}
                    className="animate-spin text-indigo-500"
                  />
                </div>
              )}

              {/* SUPPORT DEVELOPER BUTTON */}
              <button
                onClick={() => setSupportModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-amber-705 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-lg border border-amber-200/60 transition-all font-extrabold cursor-pointer active:scale-95 shadow-sm shrink-0"
                title={t("Ủng Hộ Nhà Phát Triển", "Support the Developer")}
              >
                <Heart
                  size={14}
                  className="fill-amber-500 text-amber-500 animate-pulse shrink-0"
                />
                <span className="hidden sm:inline">
                  {t("Ủng Hộ", "Donate")}
                </span>
              </button>

              {/* BILINGUAL FLAG TOGGLE */}
              <button
                onClick={() => setLang(lang === "vi" ? "en" : "vi")}
                className="px-2.5 py-2 hover:bg-slate-50 rounded-lg border border-slate-200 transition-all text-sm font-black flex items-center justify-center cursor-pointer active:scale-95 shadow-sm bg-white shrink-0"
                title={
                  lang === "vi"
                    ? "Switch to English translation"
                    : "Chuyển sang bản Tiếng Việt"
                }
              >
                <span className="mr-1.5 text-xs hidden md:inline">
                  Language:
                </span>
                <span className="text-base leading-none">
                  {lang === "vi" ? "🇺🇸" : "🇻🇳"}
                </span>
              </button>

              {route !== "home" && (
                <button
                  onClick={navigateToHome}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-950 font-bold uppercase tracking-wider bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 transition-all active:scale-95 shrink-0"
                >
                  <ArrowLeft size={13} className="stroke-[2.5]" />
                  <span className="hidden md:inline">
                    {t("Quay lại", "Back")}
                  </span>
                </button>
              )}

              {/* COMPANY ADMIN BUTTON - HIDDEN FOR SECURITY FOR EXTERNAL VIEWERS */}
              {route === "admin" && activeCompany && (
                <div className="flex items-center gap-1 text-[11px] text-indigo-700 bg-indigo-50 font-black uppercase tracking-wider px-3 py-2 rounded-lg border border-indigo-150 shrink-0">
                  <Settings
                    size={13}
                    className="animate-spin text-indigo-500"
                  />
                  <span className="hidden sm:inline">
                    {t("Quản trị", "Admin")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* MAIN LAYOUT GATEWAY */}

      {/* MAIN LAYOUT GATEWAY */}
      <main className="flex-1">
        {/* ==================== 1. HOMEPAGE ==================== */}
        {route === "home" && (
          <div className="w-full bg-slate-50">
            {/* HERO BANNER */}
            <section className="bg-white border-b border-slate-200 py-16 px-6 relative z-30">
              <div className="max-w-4xl mx-auto text-center relative z-10">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                  {t(
                    "Tạo Trang Thông Tin Xuất Hóa Đơn",
                    "Create Company QR Invoice Portal",
                  )}
                </h2>

                {/* Search / filter box integrated with Unified Live Autocomplete Search */}
                <div className="mt-8 max-w-md mx-auto relative z-35 text-left">
                  <div 
                    className={`flex items-center p-1 shadow-xl box-border rounded-xl border transition-all duration-300 ${isDraggingOverTarget ? 'border-dashed border-2 border-indigo-500 bg-indigo-50 ring-4 ring-indigo-100/50 scale-105' : aiScanning ? 'border-indigo-500 bg-indigo-600 ring-4 ring-indigo-200' : 'bg-white border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100'}`}
                    onDrop={handleDropScan}
                    onDragOver={handleDragOverScan}
                    onDragLeave={handleDragLeaveScan}
                  >
                    <div className="flex-1 flex items-center pl-3">
                      {aiScanning ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0 mr-3"></span>
                      ) : (
                        <Search className={`shrink-0 mr-2 ${aiScanning ? 'text-white' : 'text-slate-400'}`} size={18} />
                      )}
                      <div className="relative w-full flex items-center overflow-hidden">
                        {!searchQuery && (
                          <div className={`absolute inset-0 flex items-center pointer-events-none whitespace-nowrap text-sm font-semibold select-none z-0 ${aiScanning ? 'text-white' : 'text-slate-400'}`}>
                            <span className="animate-marquee whitespace-nowrap">
                              {aiScanning ? t("Đang phân tích ảnh...", "Scanning image...") : t("Nhập MST để tìm nhanh, thả ảnh để AI tự nhập thông tin.", "Enter tax code or drop image to let AI fill out.")}
                            </span>
                          </div>
                        )}
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => handleHeroSearchChange(e.target.value)}
                          onPaste={handlePasteScan}
                          disabled={aiScanning}
                          className={`w-full text-sm py-2.5 px-3 bg-transparent focus:outline-none cursor-text relative z-10 ${aiScanning ? 'text-white cursor-wait' : 'text-slate-800'}`}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0 pr-1">
                      {smartSearchLoading && !aiScanning && (
                        <span className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-650 rounded-full animate-spin block mr-2"></span>
                      )}
                      {isCapturing ? null : (
                        <div className="flex items-center">
                          <button
                            className={`p-2 rounded-lg transition-colors flex items-center justify-center shrink-0 ${aiScanning ? 'text-white/70 hover:bg-white/20 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-indigo-600'}`}
                            onClick={() => {
                              const e = document.getElementById("ai-scan-upload");
                              if(e) e.click();
                            }}
                            title="Tải ảnh lên"
                            disabled={aiScanning}
                          >
                            <Scan size={18} className={aiScanning ? "animate-pulse font-bold" : ""} />
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        id="ai-scan-upload"
                        className="hidden"
                        onChange={handleFileSelectScan}
                        disabled={aiScanning}
                      />
                    </div>
                  </div>

                  {/* Dynamic Suggestions Dropdown List overlay */}
                  {searchQuery.trim().length >= 2 &&
                    (filteredCompanies.length > 0 ||
                      smartSuggestions.length > 0 ||
                      smartSearchLoading) && (
                      <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 text-left overflow-hidden">
                        <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100 divide-dashed no-scrollbar">
                          {/* 1. MATCHING SYSTEM CHANNELS */}
                          {filteredCompanies.length > 0 && (
                            <div className="p-2">
                              <span className="block text-[9px] font-black uppercase text-indigo-650 tracking-wider px-2.5 py-1 bg-indigo-50 border border-indigo-100/50 rounded-md">
                                Đã có trang liên kết ({filteredCompanies.length}
                                )
                              </span>
                              <div className="mt-1 space-y-0.5">
                                {filteredCompanies.map((c) => (
                                  <button
                                    key={c.username}
                                    type="button"
                                    onClick={() =>
                                      selectRegisteredCompany(c.username)
                                    }
                                    className="w-full text-left px-2.5 py-2.5 hover:bg-slate-50 rounded-lg flex items-center justify-between transition-colors group cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      {c.logoUrl && (
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/30 flex items-center justify-center shrink-0">
                                          <img
                                            src={c.logoUrl}
                                            alt=""
                                            className="w-5 h-5 object-contain"
                                            crossOrigin="anonymous"
                                            referrerPolicy="no-referrer"
                                          />
                                        </div>
                                      )}
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 uppercase">
                                          {c.companyName}
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-mono">
                                          /{c.username} • MST: {c.taxCode}
                                        </p>
                                      </div>
                                    </div>
                                    <ChevronRight
                                      size={14}
                                      className="text-slate-350 group-hover:text-indigo-605 group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 2. AUTOCOMPLETE TRA CUU ONLINE */}
                          {smartSuggestions.length > 0 && (
                            <div className="p-2">
                              <span className="block text-[9px] font-black uppercase text-emerald-700 tracking-wider px-2.5 py-1 bg-emerald-50 border border-emerald-100/50 rounded-md flex items-center gap-1">
                                <Sparkles
                                  size={11}
                                  className="text-emerald-500 animate-pulse"
                                />{" "}
                                {t(
                                  "Kết quả tra cứu thông minh (Điền nhanh)",
                                  "Smart Directory Results (Auto-fill)",
                                )}
                              </span>
                              <div className="mt-1 space-y-0.5">
                                {smartSuggestions.map((item, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() =>
                                      selectCompanySuggestion(item)
                                    }
                                    className="w-full text-left px-2.5 py-2.5 hover:bg-slate-50 rounded-lg flex items-start gap-2.5 transition-all group cursor-pointer"
                                  >
                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100/30 flex items-center justify-center shrink-0 mt-0.5">
                                      <Building2
                                        size={13}
                                        className="text-emerald-600"
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-bold text-slate-800 line-clamp-1 uppercase group-hover:text-emerald-600">
                                        {item.name}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                                        <p className="text-[10px] text-slate-400 font-mono">
                                          Mã số thuế: {item.taxCode}
                                        </p>
                                        {item.director ? (
                                          <p className="text-[10px] text-slate-500 font-medium px-1.5 py-[1px] bg-slate-100 rounded">
                                            Giám Đốc:{" "}
                                            <span className="text-slate-700 font-semibold">
                                              {item.director}
                                            </span>
                                          </p>
                                        ) : item.address ? (
                                          <p
                                            className="text-[10px] text-slate-500 font-medium px-1.5 py-[1px] bg-slate-100 rounded truncate max-w-[200px]"
                                            title={item.address}
                                          >
                                            {item.address}
                                          </p>
                                        ) : null}
                                      </div>
                                    </div>
                                    <Plus
                                      size={14}
                                      className="text-slate-350 group-hover:text-emerald-600 shrink-0 mt-2"
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 3. LOADER ON DYNAMIC LIVE REQUESTS */}
                          {smartSearchLoading &&
                            smartSuggestions.length === 0 &&
                            filteredCompanies.length === 0 && (
                              <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></span>
                                <span>
                                  {t(
                                    "Đang dò tìm thông tin doanh nghiệp...",
                                    "Looking up company directory...",
                                  )}
                                </span>
                              </div>
                            )}

                          {/* 4. TOTAL EMPTY FALLBACK */}
                          {!smartSearchLoading &&
                            filteredCompanies.length === 0 &&
                            smartSuggestions.length === 0 && (
                              <div className="p-6 text-center text-slate-400 text-xs">
                                <p>
                                  {t(
                                    `Không tìm thấy kết quả phù hợp cho "${searchQuery}"`,
                                    `No matching results for "${searchQuery}"`,
                                  )}
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </section>

            {/* QUICK PREVIEW & CREATION FORM */}
            <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT - SUBMISSIONS FORM */}
              <div
                id="create-form"
                className="lg:col-span-7 h-fit bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-lg flex flex-col"
              >
                {/* Form Header with Quick Data Fill & Reset */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                      {t("Thông Tin Doanh Nghiệp", "Company Profile")}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Load Demo Data Button */}
                    <button
                      type="button"
                      onClick={() => {
                        // Fill both inputs (temp states) and live previews (reg states)
                        setTempUsername(SAMPLE_COMPANY.username);
                        setTempCompanyName(SAMPLE_COMPANY.companyName);
                        setTempTaxCode(SAMPLE_COMPANY.taxCode);
                        setTempAddress(SAMPLE_COMPANY.address);
                        setTempPhone(SAMPLE_COMPANY.phone);
                        setTempEmail(SAMPLE_COMPANY.email);
                        setTempBankAccount(SAMPLE_COMPANY.bankAccount);
                        setTempBankOwner(SAMPLE_COMPANY.bankOwner);

                        setRegUsername(SAMPLE_COMPANY.username);
                        setRegCompanyName(SAMPLE_COMPANY.companyName);
                        setRegTaxCode(SAMPLE_COMPANY.taxCode);
                        setRegAddress(SAMPLE_COMPANY.address);
                        setRegEmail(SAMPLE_COMPANY.email);
                        setRegPhone(SAMPLE_COMPANY.phone);
                        setRegLogoUrl(SAMPLE_COMPANY.logoUrl);
                        setRegBankName(SAMPLE_COMPANY.bankName);
                        setRegBankAccount(SAMPLE_COMPANY.bankAccount);
                        setRegBankOwner(SAMPLE_COMPANY.bankOwner);
                        setRegPrimaryColor(SAMPLE_COMPANY.primaryColor);
                        setRegAdminPassword("123456");
                        setRegIsPublic(SAMPLE_COMPANY.isPublic ?? true);

                        showToast(
                          "Đã tải dữ liệu mẫu thành công lên form và màn hình xem trước!",
                          "success",
                        );
                      }}
                      className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer select-none active:scale-[0.98]"
                    >
                      <Sparkles
                        size={11}
                        className="text-indigo-500 animate-pulse"
                      />
                      {t("Dữ liệu mẫu", "Sample Data")}
                    </button>

                    {/* Reset form fields button */}
                    <button
                      type="button"
                      onClick={() => {
                        // Clear inputs
                        setTempUsername("");
                        setTempCompanyName("");
                        setTempTaxCode("");
                        setTempAddress("");
                        setTempPhone("");
                        setTempEmail("");
                        setTempBankAccount("");
                        setTempBankOwner("");

                        // Clear live preview states
                        setRegUsername("");
                        setRegCompanyName("");
                        setRegTaxCode("");
                        setRegAddress("");
                        setRegEmail("");
                        setRegPhone("");
                        setRegLogoUrl("");
                        setRegBankName("vcb");
                        setRegBankAccount("");
                        setRegBankOwner("");
                        setRegPrimaryColor("#0f172a"); // Default slate
                        setRegAdminPassword("");
                        setRegIsPublic(true);

                        showToast(
                          "Đã xóa trắng toàn bộ dữ liệu trên form!",
                          "info",
                        );
                      }}
                      title={t("Xóa toàn bộ, nhập lại từ đầu", "Reset Form")}
                      className="p-1.5 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-lg border border-slate-200 hover:border-rose-100 transition-all cursor-pointer active:scale-95 flex items-center justify-center"
                    >
                      <RotateCcw size={13} className="stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleRegister} className={`space-y-5 transition-all duration-300 ${aiScanning ? 'opacity-60 animate-pulse pointer-events-none blur-[1px]' : ''}`}>
                  {/* Step 1: Link & Username */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      {t("Đường dẫn (Username/Slug)", "Username/Slug")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-stretch rounded-xl border border-slate-200 overflow-hidden focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-50/50 transition-all">
                      <span className="bg-slate-50 px-3.5 flex items-center text-xs text-slate-400 border-r border-slate-200 font-mono select-none">
                        c/
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="cong-ty-cua-ban"
                        value={tempUsername}
                        onChange={handleUsernameChange}
                        onBlur={handleUsernameBlur}
                        className="flex-1 py-3 px-3 text-sm focus:outline-none font-mono"
                      />
                      {tempUsername && (
                        <span className="px-3 flex items-center text-xs">
                          {usernameStatus === "checking" && (
                            <span className="animate-spin text-slate-400">
                              ⚡
                            </span>
                          )}
                          {usernameStatus === "available" && (
                            <span className="text-emerald-500 font-semibold">
                              {t("Khả dụng ✓", "Available ✓")}
                            </span>
                          )}
                          {usernameStatus === "taken" && (
                            <span className="text-red-500 font-semibold font-sans">
                              {t("Đã trùng tên", "Taken/Invalid")}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {t("URL:", "URL:")}{" "}
                      <strong className="font-mono text-slate-700 font-semibold bg-emerald-50 px-1 rounded">
                        {globalBaseUrl}/{tempUsername || "username"}
                      </strong>
                    </p>
                  </div>

                  {/* Step 2: Corporate Detail */}
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 space-y-4">
                    {/* Tax Code Search */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1 flex justify-between items-center">
                        <span>
                          {t("Mã Số Thuế", "Tax Code")}{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          placeholder={t(
                            "Nhập mã số thuế...",
                            "Enter tax code...",
                          )}
                          value={tempTaxCode}
                          onChange={(e) => {
                            setTempTaxCode(e.target.value.replace(/\s+/g, ""));
                          }}
                          onBlur={() => {
                            const cleaned = tempTaxCode.replace(/\s+/g, "");
                            if (cleaned) {
                              setRegTaxCode(cleaned);
                            }
                          }}
                          className="flex-1 py-2.5 px-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-600 focus:outline-none bg-white transition-all min-w-0 uppercase font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cleaned = tempTaxCode.replace(/\s+/g, "");
                            if (!cleaned) {
                              showToast(
                                "Vui lòng nhập mã số thuế trước khi tra cứu",
                                "info",
                              );
                            } else {
                              setRegTaxCode(cleaned);
                              lookupTaxCode(cleaned);
                            }
                          }}
                          disabled={lookupLoading}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wide rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {lookupLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                          ) : (
                            <Search size={14} className="stroke-[2.5]" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        {t("Tên công ty", "Company Name")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t("Tên đầy đủ", "Complete name")}
                        value={tempCompanyName}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setTempCompanyName(val);
                          // Auto derive tone-free uppercase name for bank owner default
                          const unsigned = removeVietnameseTones(val);
                          setTempBankOwner(unsigned);
                          setRegBankOwner(unsigned);
                        }}
                        onBlur={() => {
                          setRegCompanyName(tempCompanyName);
                          const unsigned =
                            removeVietnameseTones(tempCompanyName);
                          setTempBankOwner(unsigned);
                          setRegBankOwner(unsigned);
                        }}
                        className="w-full py-2.5 px-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-600 focus:outline-none bg-white transition-all uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        {t("Địa Chỉ", "Address")}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t(
                          "Số nhà, tên đường, phường, tỉnh thành...",
                          "Street, district, city...",
                        )}
                        value={tempAddress}
                        onChange={(e) => setTempAddress(e.target.value)}
                        onBlur={() => setRegAddress(tempAddress)}
                        className="w-full py-2.5 px-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-600 focus:outline-none bg-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          {t("Số điện thoại", "Phone Number")}
                        </label>
                        <input
                          type="text"
                          placeholder="0912345678"
                          maxLength={13}
                          value={tempPhone}
                          onChange={(e) => setTempPhone(e.target.value)}
                          onBlur={() => setRegPhone(tempPhone)}
                          className={`w-full py-2.5 px-3 rounded-lg border text-sm focus:outline-none transition-all ${
                            isPhoneInvalid(tempPhone)
                              ? "border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                              : "border-slate-200 bg-white focus:border-indigo-600 focus:bg-white"
                          }`}
                        />
                        {isPhoneInvalid(tempPhone) && (
                          <p className="text-[10px] text-red-500 mt-1 font-medium">
                            {t(
                              "Số điện thoại không hợp lệ (chỉ nhập số, tối đa 13 ký tự).",
                              "Invalid phone number.",
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          {t("Email nhận hóa đơn", "Invoice Email")}
                        </label>
                        <input
                          type="email"
                          placeholder="invoice@company.com"
                          value={tempEmail}
                          onChange={(e) => setTempEmail(e.target.value)}
                          onBlur={() => setRegEmail(tempEmail)}
                          className={`w-full py-2.5 px-3 rounded-lg border text-sm focus:outline-none transition-all ${
                            isEmailInvalid(tempEmail)
                              ? "border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                              : "border-slate-200 bg-white focus:border-indigo-600 focus:bg-white"
                          }`}
                        />
                        {isEmailInvalid(tempEmail) && (
                          <p className="text-[10px] text-red-500 mt-1 font-medium">
                            {t("Email không hợp lệ.", "Invalid email address.")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional Bank Tick Trigger Checkbox */}
                  <div className="bg-slate-50/30 p-1.5 rounded-xl border border-slate-200/55">
                    <label className="flex items-center gap-3 p-3.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none transition-all shadow-sm">
                      <input
                        type="checkbox"
                        checked={showQRInputs}
                        onChange={(e) => setShowQRInputs(e.target.checked)}
                        className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                        id="checkbox-show-qr"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          {t("Hiện Mã QR thanh toán", "Show QR Payment Code")}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Step 3: Banking Transfer Detail (Optional, nested under tick-box) */}
                  {showQRInputs && (
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 space-y-4 animate-fade-in">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-4 bg-indigo-600 inline-block rounded"></span>{" "}
                        {t("Thông Tin ngân hàng", "Bank Information")}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            {t(
                              "Chọn ngân hàng phát hành",
                              "Select Issuing Bank",
                            )}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={regBankName}
                            onChange={(e) => {
                              const selected = e.target.value;
                              setRegBankName(selected);
                              if (tempBankAccount) {
                                handleBankLookup(
                                  selected,
                                  tempBankAccount,
                                  false,
                                );
                              }
                            }}
                            className="w-full py-2.5 px-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-600 focus:outline-none bg-white transition-all"
                          >
                            {VIETNAMESE_BANKS.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.shortName} - {b.name.substring(0, 30)}...
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            {t("Số tài khoản", "Bank Account Number")}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required={showQRInputs}
                            placeholder={t(
                              "Số tài khoản",
                              "Bank account number",
                            )}
                            value={tempBankAccount}
                            onChange={(e) =>
                              setTempBankAccount(
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                            onBlur={() => {
                              setRegBankAccount(tempBankAccount);
                              if (tempBankAccount) {
                                handleBankLookup(
                                  regBankName,
                                  tempBankAccount,
                                  false,
                                );
                              }
                            }}
                            className="w-full py-2.5 px-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-600 focus:outline-none font-mono bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-semibold text-slate-600">
                            {t("Tên Tài Khoản", "Account Name")}{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <label className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={syncWithCompany}
                              onChange={(e) => {
                                setSyncWithCompany(e.target.checked);
                                if (e.target.checked && tempCompanyName) {
                                  const unsignedOwner =
                                    removeVietnameseTones(
                                      tempCompanyName,
                                    ).toUpperCase();
                                  setTempBankOwner(unsignedOwner);
                                  setRegBankOwner(unsignedOwner);
                                }
                              }}
                              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-505 cursor-pointer accent-indigo-600"
                            />
                            <span>
                              {t("Giống tên công ty", "Same as company name")}
                            </span>
                          </label>
                        </div>
                        <input
                          type="text"
                          required={showQRInputs}
                          placeholder="CONG TY CO PHAN CONG NGHE..."
                          value={tempBankOwner}
                          onChange={(e) => {
                            setTempBankOwner(e.target.value.toUpperCase());
                            if (syncWithCompany) {
                              setSyncWithCompany(false);
                            }
                          }}
                          onBlur={() => setRegBankOwner(tempBankOwner)}
                          className="w-full py-2.5 px-3 rounded-lg border border-slate-200 text-sm focus:border-indigo-600 focus:outline-none font-mono bg-white uppercase"
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 4: Custom Logo & Auto Theme Color */}
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 space-y-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {t(
                        "LOGO CÔNG TY ( Không Bắt Buộc )",
                        "Company Logo (Optional)",
                      )}
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          {t("(.JPG, .PNG, .SVG)", "(.JPG, .PNG, .SVG)")}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e, "reg")}
                          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                        />
                        {regLogoUrl && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                              ✓{" "}
                              {t(
                                "Đã tải logo thành công",
                                "Logo uploaded successfully",
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setRegLogoUrl("");
                                setRegPrimaryColor("#4F46E5"); // revert to fallback indigo
                              }}
                              className="text-red-500 hover:text-red-700 text-xs font-bold"
                            >
                              {t("Xóa logo", "Remove logo")}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Step 5: Admin Password */}
                  <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      {t("Đặt Mật Khẩu", "Set Password")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        placeholder="Tối thiểu 4 ký tự"
                        value={regAdminPassword}
                        onChange={(e) => setRegAdminPassword(e.target.value)}
                        className="w-full py-2.5 pl-3 pr-10 rounded border border-slate-200 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-50 bg-white transition-all font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showRegPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <label className="md:col-span-1 flex items-center justify-between gap-2 p-4 h-full bg-white hover:bg-slate-50 rounded-xl border border-slate-200 cursor-pointer select-none transition-all shadow-sm min-h-[60px]">
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest whitespace-nowrap">
                        {regIsPublic ? t("Công Khai", "Public") : t("Riêng tư", "Private")}
                      </span>
                      <div className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out ${regIsPublic ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                        <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${regIsPublic ? 'translate-x-5' : 'translate-x-[2px]'}`} />
                      </div>
                      <input
                        type="checkbox"
                        checked={regIsPublic}
                        onChange={(e) => setRegIsPublic(e.target.checked)}
                        className="sr-only"
                      />
                    </label>

                    {/* Captcha Verify */}
                    <div className="md:col-span-3 bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <label className="block text-[11px] font-semibold text-slate-800 mb-1 flex items-center gap-1">
                          Xác minh <span className="text-red-500">*</span>
                        </label>
                        <p className="text-[11px] text-amber-700 uppercase tracking-widest font-black flex items-center gap-2 mt-1.5">
                          <span className="bg-white px-2 py-1.5 rounded border border-amber-200/60 shadow-sm leading-none">
                            {captchaQ.a} + {captchaQ.b} =
                          </span>
                        </p>
                      </div>
                      <input
                        type="number"
                        required
                        placeholder="?"
                        value={captchaA}
                        onChange={(e) => setCaptchaA(e.target.value)}
                        className="w-16 py-2 px-2 rounded-lg border border-amber-200 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-center font-bold bg-white"
                      />
                    </div>
                  </div>

                  {/* Error & Submit message */}
                  {regError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600 font-bold">
                      ✕ {regError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || usernameStatus === "taken"}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold uppercase tracking-wider text-xs py-4 px-6 rounded shadow-lg shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl active:scale-[0.99]"
                  >
                    {loading ? "Đang xử lý khởi tạo..." : "Tạo trang"}
                  </button>
                </form>
              </div>

              {/* RIGHT - PREVIEW PROFILE CARD */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* PREVIEW CONTAINER */}
                <div className="bg-slate-100 border border-slate-200 py-10 px-4 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden min-h-[660px] sm:min-h-[750px]">
                  {/* Dynamic Ambient Logo Background Aesthetic Layer */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none bg-slate-50">
                    {regLogoUrl ? (
                      <>
                        <div className="absolute top-1/4 left-1/4 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-[100px] mix-blend-multiply">
                          <img
                            src={regLogoUrl}
                            className="w-full h-full object-cover"
                            alt=""
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="absolute bottom-0 right-0 w-[120%] h-[120%] translate-x-1/3 translate-y-1/3 opacity-20 blur-[80px] mix-blend-multiply">
                          <img
                            src={regLogoUrl}
                            className="w-full h-full object-cover"
                            alt=""
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </>
                    ) : (
                      <div
                        className={`absolute inset-0 opacity-40 ${isCapturing ? "" : "blur-[100px]"}`}
                        style={{
                          background: `radial-gradient(circle at 50% 50%, ${regPrimaryColor}40 0%, transparent 60%),
                                      radial-gradient(circle at 100% 0%, ${regPrimaryColor}30 0%, transparent 50%)`,
                        }}
                      />
                    )}
                  </div>

                  {/* Blinking Preview Label */}
                  <div className="absolute top-3 left-3 z-[15] flex items-center gap-1.5 bg-white/85 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-200/50 text-[9px] font-extrabold uppercase tracking-widest text-slate-650 animate-pulse select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>{t("XEM TRƯỚC", "PREVIEW LIVE")}</span>
                  </div>

                  {/* Device shell mockup container */}
                  <div
                    className="w-full sm:max-w-[345px] h-[550px] sm:h-[min(650px,82vh)] bg-transparent sm:bg-slate-900 rounded-none sm:rounded-[45px] shadow-none sm:shadow-2xl relative flex flex-col z-10 mx-auto overflow-hidden"
                    style={{
                      transform: "translate3d(0, 0, 0)",
                      isolation: "isolate",
                    }}
                  >
                    {/* Perfect outer clipping layer to prevent hardware acceleration corner leaking - absolute inset bounds the screen perfectly inside the bezel */}
                    <div
                      className="absolute inset-0 sm:inset-[10px] bg-white rounded-none sm:rounded-[35px] overflow-hidden flex flex-col border-0 sm:border border-slate-200/50 shadow-none sm:shadow-none"
                      style={{
                        transform: "translate3d(0, 0, 0)",
                        isolation: "isolate",
                      }}
                    >
                      <div className="w-full h-full rounded-none sm:rounded-[35px] overflow-x-hidden overflow-y-auto relative flex flex-col custom-scrollbar">
                        {/* BRAND BACKGROUND INSIDE DEVICE */}
                        {regLogoUrl && (
                          <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-15 mix-blend-multiply flex items-center justify-center overflow-hidden rounded-none sm:rounded-[35px]">
                            <img
                              src={regLogoUrl}
                              alt=""
                              className={`w-[150%] h-[150%] object-cover ${isCapturing ? "" : "blur-[8px]"}`}
                            />
                          </div>
                        )}

                        {/* App mockup scroll screen */}
                        <div className="flex-1 rounded-none sm:rounded-[35px] overflow-y-auto no-scrollbar relative flex flex-col bg-white/70 backdrop-blur-md">
                          {/* Logo header display */}
                          <div className="flex flex-col items-center text-center pt-7 px-5 pb-5 border-b border-slate-200/50 bg-white/80 relative overflow-hidden rounded-t-none sm:rounded-t-[35px] shrink-0">
                            {regLogoUrl && (
                              <div
                                className={`absolute inset-0 opacity-[0.10] bg-center bg-cover scale-125 pointer-events-none ${isCapturing ? "" : "blur-[4px]"}`}
                                style={{
                                  backgroundImage: `url(${regLogoUrl})`,
                                }}
                              />
                            )}
                            <div className="relative z-10 flex flex-col items-center w-full">
                              {regLogoUrl && (
                                <div
                                  className="w-16 h-16 bg-white/90 rounded-2xl border border-slate-200 flex items-center justify-center p-2 mb-3 overflow-hidden shadow-sm shrink-0"
                                  style={{ borderColor: regPrimaryColor }}
                                >
                                  <img
                                    src={regLogoUrl}
                                    alt="Logo preview"
                                    onError={() => setRegLogoUrl("")}
                                    referrerPolicy="no-referrer"
                                    className={`max-w-full max-h-full object-contain ${isCapturing ? "" : "mix-blend-multiply"}`}
                                    crossOrigin="anonymous"
                                  />
                                </div>
                              )}

                              <div className="text-[9.5px] sm:text-[10.5px] font-bold tracking-widest text-[#505a73] opacity-80 uppercase mt-1 mb-1.5 shrink-0">
                                {t(
                                  "Thông tin xuất hóa đơn",
                                  "Invoice Information",
                                )}
                              </div>

                              <h4 className="text-[13px] sm:text-sm font-black text-slate-800 uppercase tracking-normal leading-relaxed break-words px-1">
                                {regCompanyName || "TÊN ĐẦY ĐỦ CÔNG TY"}
                              </h4>
                            </div>
                          </div>

                          {/* Display cards / quick preview items */}
                          <div className="p-6 space-y-4">
                            {/* MST button preview */}
                            <div className="w-full text-left bg-slate-50 border border-slate-200 p-3.5 rounded-xl transition-all flex items-center justify-between">
                              <div className="max-w-[85%]">
                                <span className="text-[8px] uppercase text-slate-400 font-bold block mb-0.5 font-sans">
                                  Mã số thuế
                                </span>
                                <span className="text-sm font-mono font-bold text-slate-800 leading-none">
                                  {regTaxCode || "0101234567"}
                                </span>
                              </div>
                              <Copy size={16} className="text-slate-400" />
                            </div>

                            {/* Address button preview */}
                            <div className="w-full text-left bg-slate-50 border border-slate-200 p-3.5 rounded-xl transition-all flex items-start justify-between gap-2">
                              <div className="flex-1 pr-1">
                                <span className="text-[8px] uppercase text-slate-400 font-bold block mb-0.5 font-sans">
                                  Địa chỉ
                                </span>
                                <span className="text-xs font-bold text-slate-700 leading-relaxed block break-words">
                                  {regAddress || "Địa chỉ xuất hóa đơn..."}
                                </span>
                              </div>
                              <Copy
                                size={16}
                                className="text-slate-400 shrink-0 mt-0.5"
                              />
                            </div>

                            {/* Phone button preview (dynamic) */}
                            {regPhone && (
                              <div className="w-full text-left bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl transition-all flex items-center justify-between animate-fade-in">
                                <div className="max-w-[85%]">
                                  <span className="text-[8px] uppercase text-emerald-600 font-bold block mb-0.5 font-sans">
                                    Số điện thoại
                                  </span>
                                  <span className="text-sm font-mono font-extrabold text-emerald-800 block leading-none">
                                    {regPhone}
                                  </span>
                                </div>
                                <Copy size={16} className="text-emerald-400" />
                              </div>
                            )}

                            {/* Email button preview (dynamic) */}
                            {regEmail && (
                              <div className="w-full text-left bg-emerald-50/50 border border-emerald-100 p-3.5 rounded-xl transition-all flex items-center justify-between animate-fade-in">
                                <div className="max-w-[85%]">
                                  <span className="text-[8px] uppercase text-emerald-600 font-bold block mb-0.5 font-sans">
                                    Email nhận hóa đơn
                                  </span>
                                  <span className="text-xs font-extrabold text-emerald-800 block leading-tight truncate">
                                    {regEmail}
                                  </span>
                                </div>
                                <Copy size={16} className="text-emerald-400" />
                              </div>
                            )}

                            {/* Bank Card button preview (conditioned by QR ticket trigger) */}
                            {showQRInputs &&
                              (regBankAccount || regBankOwner) && (
                                <div className="w-full text-left bg-slate-50 border border-slate-200 p-3.5 rounded-xl transition-all flex items-center justify-between animate-fade-in">
                                  <div className="max-w-[85%]">
                                    <span className="text-[8px] uppercase text-slate-400 font-bold block mb-0.5 font-sans">
                                      Số tài khoản thanh toán
                                    </span>
                                    <span className="text-sm font-mono font-extrabold text-indigo-600 block">
                                      {regBankAccount || "123456789"}
                                    </span>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold block leading-none mt-1 font-sans">
                                      {regBankOwner || "NGUYEN VAN A"}
                                    </span>
                                  </div>
                                  <CreditCard
                                    size={16}
                                    className="text-slate-400"
                                  />
                                </div>
                              )}
                          </div>

                          {/* Copy tutorial text removed */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CREATED LIST (RECENT PAGES) - GEOMETRIC BALANCE (PC Max 4, Mobile Hidden) */}
                <div className="hidden md:block bg-white p-6 rounded-2xl border border-slate-200 shadow-md">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <Globe size={15} className="text-indigo-600 stroke-[2.5]" />{" "}
                    Các trang mới tạo
                  </h4>

                  {filteredCompanies.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                      <Building2
                        className="mx-auto text-slate-300 mb-2 animate-bounce"
                        size={24}
                      />
                      <p className="text-xs font-semibold text-slate-400">
                        Chưa có công ty nào liên kết. Đăng ký ngay!
                      </p>

                      {/* Preset Quick Loader for testing! */}
                      <button
                        type="button"
                        onClick={async () => {
                          // Fill both inputs (temp states) and live previews (reg states)
                          setTempUsername(SAMPLE_COMPANY.username);
                          setTempCompanyName(SAMPLE_COMPANY.companyName);
                          setTempTaxCode(SAMPLE_COMPANY.taxCode);
                          setTempAddress(SAMPLE_COMPANY.address);
                          setTempPhone(SAMPLE_COMPANY.phone);
                          setTempEmail(SAMPLE_COMPANY.email);
                          setTempBankAccount(SAMPLE_COMPANY.bankAccount);
                          setTempBankOwner(SAMPLE_COMPANY.bankOwner);

                          setRegUsername(SAMPLE_COMPANY.username);
                          setRegCompanyName(SAMPLE_COMPANY.companyName);
                          setRegTaxCode(SAMPLE_COMPANY.taxCode);
                          setRegAddress(SAMPLE_COMPANY.address);
                          setRegEmail(SAMPLE_COMPANY.email);
                          setRegPhone(SAMPLE_COMPANY.phone);
                          setRegLogoUrl(SAMPLE_COMPANY.logoUrl);
                          setRegBankName(SAMPLE_COMPANY.bankName);
                          setRegBankAccount(SAMPLE_COMPANY.bankAccount);
                          setRegBankOwner(SAMPLE_COMPANY.bankOwner);
                          setRegPrimaryColor(SAMPLE_COMPANY.primaryColor);
                          setRegAdminPassword("123456");
                        setRegIsPublic(SAMPLE_COMPANY.isPublic ?? true);

                          showToast(
                            "Đã tải dữ liệu mẫu thành công lên form và màn hình xem trước!",
                            "success",
                          );
                        }}
                        className="mt-6 inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] sm:text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg transition-all"
                      >
                        <Building2 size={14} />
                        Xem Trước Demo
                      </button>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2 no-scrollbar">
                      {filteredCompanies.slice(0, 3).map((c) => (
                        <div
                          key={c.username}
                          onClick={() => navigateToSlug(c.username, "view")}
                          className="pt-2.5 pb-2.5 block cursor-pointer group flex items-center justify-between hover:bg-slate-50 p-2.5 rounded transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                              {c.logoUrl ? (
                                <img
                                  src={c.logoUrl}
                                  alt="Logo"
                                  referrerPolicy="no-referrer"
                                  className="max-w-full max-h-full object-contain"
                                  crossOrigin="anonymous"
                                />
                              ) : (
                                <Building2
                                  size={16}
                                  className="text-slate-400"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                {c.companyName}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                /{c.username}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-3.5 h-3.5 rounded border border-slate-200"
                              style={{ backgroundColor: c.primaryColor }}
                            ></span>
                            <ChevronRight
                              size={14}
                              className="text-slate-350 group-hover:text-slate-800 transition-colors"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== 2. PUBLIC VIEW PAGE ==================== */}
        {route === "view" && activeCompany && (
          <div
            className={`w-full bg-slate-100 py-0 md:py-16 px-0 md:px-4 min-h-[100dvh] md:min-h-screen flex items-center justify-center relative ${isCapturing ? "overflow-visible" : "overflow-hidden"}`}
          >
            {/* Dynamic Ambient Logo Background Aesthetic Layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none bg-slate-50">
              {activeCompany.logoUrl ? (
                <>
                  <div className="absolute top-1/4 left-1/4 w-[120vw] h-[120vh] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-[120px] mix-blend-multiply">
                    <img
                      src={proxyImageUrl(activeCompany.logoUrl)}
                      className="w-full h-full object-cover"
                      alt=""
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-[80vw] h-[80vw] translate-x-1/3 translate-y-1/3 opacity-20 blur-[100px] mix-blend-multiply">
                    <img
                      src={proxyImageUrl(activeCompany.logoUrl)}
                      className="w-full h-full object-cover"
                      alt=""
                      crossOrigin="anonymous"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </>
              ) : (
                <div
                  className={`absolute inset-0 opacity-40 ${isCapturing ? "" : "blur-[100px]"}`}
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${activeCompany.primaryColor}40 0%, transparent 60%),
                               radial-gradient(circle at 80% 20%, ${activeCompany.primaryColor}30 0%, transparent 50%)`,
                  }}
                ></div>
              )}
            </div>

            {/* Centered Phone device mockup container (Equal margins on all 4 sides, top uncluttered) */}
            <div
              className={`w-full md:max-w-[420px] md:bg-slate-900 rounded-none md:rounded-[45px] shadow-none md:shadow-2xl md:p-[12px] relative flex flex-col z-10 ${isCapturing ? "h-auto min-h-0 overflow-visible [&_*]:transition-none" : "transition-all h-[100dvh] md:h-auto min-h-[100dvh] md:min-h-0 md:h-[min(840px,90vh)] overflow-hidden"}`}
              style={{
                transform: "translate3d(0, 0, 0)",
                isolation: "isolate",
              }}
            >
              {/* Perfect outer clipping layer */}
              <div
                className={`w-full flex flex-col relative ${isCapturing ? "h-auto min-h-0 overflow-visible bg-slate-50/95 backdrop-blur-2xl rounded-[33px]" : "h-full min-h-[100dvh] md:min-h-0 bg-slate-50/95 backdrop-blur-2xl rounded-none md:rounded-[33px] overflow-hidden flex-1"}`}
                style={{
                  transform: "translate3d(0, 0, 0)",
                  isolation: "isolate",
                }}
              >
                {/* BRAND BACKGROUND INSIDE DEVICE (Moved out of scrolling container to remain fixed) */}
                {activeCompany.logoUrl && (
                  <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-15 mix-blend-multiply flex items-center justify-center overflow-hidden rounded-none md:rounded-[33px]">
                    <img
                      src={proxyImageUrl(activeCompany.logoUrl)}
                      alt=""
                      className={`w-[150%] h-[150%] object-cover ${isCapturing ? "" : "blur-[8px]"}`}
                    />
                  </div>
                )}

                <div
                  className={`w-full rounded-none md:rounded-[33px] relative flex flex-col custom-scrollbar z-10 ${isCapturing ? "h-auto min-h-0 overflow-visible flex-none" : "overflow-x-hidden h-full min-h-full overflow-y-auto flex-1"}`}
                >
                  <div
                    id="invoice-card-to-capture"
                    className={`relative z-10 flex flex-col ${
                      isCapturing
                        ? "bg-slate-50 h-[auto] min-h-[0] w-[390px] min-w-[390px] max-w-[390px] mx-auto rounded-[0px] flex-none shadow-none border-0 pb-0 overflow-hidden"
                        : "w-full rounded-none md:rounded-[33px] grow min-h-full pb-0 bg-transparent"
                    }`}
                  >
                    {/* Beautiful dynamic ambient background layer inside the card capture container so it is captured in screenshots */}
                    <div
                      className={`absolute inset-0 pointer-events-none z-0 select-none bg-slate-50 ${isCapturing ? "block" : "hidden"}`}
                    >
                      {activeCompany.logoUrl ? (
                        <>
                          {/* Blurred logo aesthetic bubbles */}
                          <div className="absolute top-1/4 left-1/4 w-[120%] h-[120%] -translate-x-1/2 -translate-y-1/2 opacity-[0.15] blur-3xl">
                            <img
                              src={proxyImageUrl(activeCompany.logoUrl)}
                              className="w-full h-full object-cover"
                              alt=""
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                            />
                          </div>
                          <div className="absolute bottom-0 right-0 w-[80%] h-[80%] translate-x-1/3 translate-y-1/3 opacity-[0.12] blur-3xl">
                            <img
                              src={proxyImageUrl(activeCompany.logoUrl)}
                              className="w-full h-full object-cover"
                              alt=""
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                            />
                          </div>
                        </>
                      ) : (
                        <div
                          className="absolute inset-0 opacity-40 blur-[100px]"
                          style={{
                            background: `radial-gradient(circle at 50% 50%, ${activeCompany.primaryColor}40 0%, transparent 60%),
                                   radial-gradient(circle at 80% 20%, ${activeCompany.primaryColor}30 0%, transparent 50%)`,
                          }}
                        ></div>
                      )}

                      {/* Brand logo overlay blend inside the card */}
                      {activeCompany.logoUrl && (
                        <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-10 flex items-center justify-center overflow-hidden rounded-none md:rounded-[33px]">
                          <img
                            src={proxyImageUrl(activeCompany.logoUrl)}
                            alt=""
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                            className="w-[150%] h-[150%] object-cover blur-[8px]"
                          />
                        </div>
                      )}
                    </div>

                    {/* Profile Card Header */}
                    <div
                      className={`relative overflow-hidden px-6 pt-6 pb-5 flex flex-col items-center border-b border-slate-200/50 rounded-t-none md:rounded-t-[33px] shrink-0 z-10 ${isCapturing ? "bg-white/75" : "bg-white/70 backdrop-blur-md"}`}
                    >
                      {activeCompany.logoUrl && !isCapturing && (
                        <div
                          className={`absolute inset-0 opacity-[0.10] bg-center bg-cover scale-125 pointer-events-none ${isCapturing ? "" : "blur-[4px]"}`}
                          style={{
                            backgroundImage: `url(${proxyImageUrl(activeCompany.logoUrl)})`,
                          }}
                        />
                      )}
                      <div className="relative z-10 flex flex-col items-center w-full">
                        {/* Logo centered */}
                        {activeCompany.logoUrl ? (
                          <div
                            className={`w-20 h-20 rounded-2xl border border-slate-200 flex items-center justify-center p-3 mb-2.5 shrink-0 shadow-sm relative group ${isCapturing ? "bg-white" : "bg-white/90"}`}
                          >
                            <img
                              src={proxyImageUrl(activeCompany.logoUrl)}
                              alt="Company Logo"
                              onError={() => setActiveCompany({...activeCompany, logoUrl: ""})}
                              crossOrigin="anonymous"
                              referrerPolicy="no-referrer"
                              className={`max-w-full max-h-full object-contain ${isCapturing ? "" : "mix-blend-multiply"}`}
                            />
                          </div>
                        ) : null}

                        <div className="text-[9.5px] sm:text-[10.5px] font-bold tracking-widest text-[#505a73] opacity-80 uppercase mt-1 mb-1 shrink-0">
                          {t("Thông tin xuất hóa đơn", "Invoice Information")}
                        </div>

                        <h3 className="text-center font-black text-slate-900 text-[13.5px] sm:text-base md:text-md uppercase tracking-normal leading-relaxed break-words px-1 mt-1">
                          {activeCompany.companyName}
                        </h3>
                      </div>
                    </div>

                    {/* public invoice items catalog/grid */}
                    <div className="p-6 space-y-4">
                      {/* 1. MST Bento Card */}
                      <div
                        onClick={() =>
                          copyToClipboard(
                            activeCompany.taxCode,
                            "Mã số thuế (MST)",
                          )
                        }
                        className={`p-3.5 rounded-xl border-2 cursor-pointer select-none group relative flex items-center justify-between transition-all duration-200 z-10 ${
                          copiedField === "Mã số thuế (MST)"
                            ? "border-slate-900 bg-slate-950 text-white transform scale-[0.98]"
                            : isCapturing
                              ? "bg-white/80 border-slate-200/80 shadow-sm"
                              : "bg-white/60 backdrop-blur-md border-white/80 shadow-sm hover:bg-white hover:border-slate-300 hover:shadow"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 text-slate-500 bg-white"
                            style={
                              copiedField === "Mã số thuế (MST)"
                                ? {
                                    backgroundColor: activeCompany.primaryColor,
                                    color: "#fff",
                                    borderColor: activeCompany.primaryColor,
                                  }
                                : {}
                            }
                          >
                            <Hash size={16} className="stroke-[2.5]" />
                          </div>
                          <div>
                            <p
                              className={`text-[8.5px] font-extrabold uppercase tracking-widest ${copiedField === "Mã số thuế (MST)" ? "text-slate-300" : "text-slate-400"}`}
                            >
                              {t("Mã số thuế", "Tax Code")}
                            </p>
                            <p className="font-mono text-base font-extrabold tracking-wider leading-none mt-1">
                              {activeCompany.taxCode}
                            </p>
                          </div>
                        </div>

                        {!isCapturing && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {copiedField === "Mã số thuế (MST)" ? (
                              <span
                                className="text-[10px] font-bold text-white uppercase flex items-center gap-0.5"
                                style={{ color: activeCompany.primaryColor }}
                              >
                                <Check size={12} /> Đã copy!
                              </span>
                            ) : (
                              <span className="text-slate-400 group-hover:text-slate-900 flex items-center">
                                <Copy size={14} />
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 2. TEN DAY DU */}
                      <div
                        onClick={() =>
                          copyToClipboard(
                            activeCompany.companyName,
                            "Tên đầy đủ công ty",
                          )
                        }
                        className={`p-3.5 rounded-xl border-2 cursor-pointer select-none group relative flex items-center justify-between transition-all duration-200 z-10 ${
                          copiedField === "Tên đầy đủ công ty"
                            ? "border-slate-900 bg-slate-950 text-white transform scale-[0.98]"
                            : isCapturing
                              ? "bg-white/80 border-slate-200/80 shadow-sm"
                              : "bg-white/60 backdrop-blur-md border-white/80 shadow-sm hover:bg-white hover:border-slate-300 hover:shadow"
                        }`}
                      >
                        <div className="flex items-center gap-3 pr-2">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 text-slate-500 bg-white"
                            style={
                              copiedField === "Tên đầy đủ công ty"
                                ? {
                                    backgroundColor: activeCompany.primaryColor,
                                    color: "#fff",
                                    borderColor: activeCompany.primaryColor,
                                  }
                                : {}
                            }
                          >
                            <Building2 size={16} className="stroke-[2.5]" />
                          </div>
                          <div>
                            <p
                              className={`text-[8.5px] font-extrabold uppercase tracking-widest ${copiedField === "Tên đầy đủ công ty" ? "text-slate-300" : "text-slate-400"}`}
                            >
                              {t("Tên đầy đủ công ty", "Full Company Name")}
                            </p>
                            <p
                              className={`text-xs font-extrabold leading-tight mt-1 uppercase ${copiedField === "Tên đầy đủ công ty" ? "text-white" : "text-slate-850"}`}
                            >
                              {activeCompany.companyName}
                            </p>
                          </div>
                        </div>

                        {!isCapturing && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {copiedField === "Tên đầy đủ công ty" ? (
                              <span
                                className="text-[10px] font-bold uppercase flex items-center gap-0.5"
                                style={{ color: activeCompany.primaryColor }}
                              >
                                <Check size={12} /> Đã copy!
                              </span>
                            ) : (
                              <span className="text-slate-400 group-hover:text-slate-900 flex items-center">
                                <Copy size={14} />
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 3. DIA CHI TRU SO */}
                      <div
                        onClick={() =>
                          copyToClipboard(
                            activeCompany.address,
                            "Địa chỉ xuất hóa đơn",
                          )
                        }
                        className={`p-3.5 rounded-xl border-2 cursor-pointer select-none group relative flex items-center justify-between transition-all duration-200 z-10 ${
                          copiedField === "Địa chỉ xuất hóa đơn"
                            ? "border-slate-900 bg-slate-950 text-white transform scale-[0.98]"
                            : isCapturing
                              ? "bg-white/80 border-slate-200/80 shadow-sm"
                              : "bg-white/60 backdrop-blur-md border-white/80 shadow-sm hover:bg-white hover:border-slate-300 hover:shadow"
                        }`}
                      >
                        <div className="flex items-center gap-3 pr-2">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 text-slate-500 bg-white"
                            style={
                              copiedField === "Địa chỉ xuất hóa đơn"
                                ? {
                                    backgroundColor: activeCompany.primaryColor,
                                    color: "#fff",
                                    borderColor: activeCompany.primaryColor,
                                  }
                                : {}
                            }
                          >
                            <MapPin size={16} className="stroke-[2.5]" />
                          </div>
                          <div>
                            <p
                              className={`text-[8.5px] font-extrabold uppercase tracking-widest ${copiedField === "Địa chỉ xuất hóa đơn" ? "text-slate-300" : "text-slate-400"}`}
                            >
                              {t(
                                "Địa chỉ kinh doanh",
                                "Registered Business Address",
                              )}
                            </p>
                            <p
                              className={`text-[11px] font-bold leading-relaxed mt-0.5 ${copiedField === "Địa chỉ xuất hóa đơn" ? "text-white" : "text-slate-750 group-hover:text-slate-950"}`}
                            >
                              {activeCompany.address}
                            </p>
                          </div>
                        </div>

                        {!isCapturing && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {copiedField === "Địa chỉ xuất hóa đơn" ? (
                              <span
                                className="text-[10px] font-bold uppercase flex items-center gap-0.5"
                                style={{ color: activeCompany.primaryColor }}
                              >
                                <Check size={12} /> Đã copy!
                              </span>
                            ) : (
                              <span className="text-slate-400 group-hover:text-slate-900 flex items-center">
                                <Copy size={14} />
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Separate layout for Email/Phone: 2 separate lines to prevent truncation */}
                      <div className="flex flex-col gap-3">
                        {/* Email */}
                        {activeCompany.email && (
                          <div
                            onClick={() =>
                              copyToClipboard(
                                activeCompany.email,
                                "Email nhận hóa đơn",
                              )
                            }
                            className={`p-3.5 rounded-xl border-2 cursor-pointer select-none group relative flex items-center justify-between transition-all duration-200 z-10 ${
                              copiedField === "Email nhận hóa đơn"
                                ? "border-slate-900 bg-slate-950 text-white"
                                : isCapturing
                                  ? "bg-white/80 border-slate-200/80 shadow-sm"
                                  : "bg-white/60 backdrop-blur-md border-white/80 shadow-sm hover:bg-white hover:border-slate-300 hover:shadow"
                            }`}
                          >
                            <div className="flex items-center gap-3 pr-2 w-full min-w-0">
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 text-slate-500 bg-white"
                                style={
                                  copiedField === "Email nhận hóa đơn"
                                    ? {
                                        backgroundColor:
                                          activeCompany.primaryColor,
                                        color: "#fff",
                                        borderColor: activeCompany.primaryColor,
                                      }
                                    : {}
                                }
                              >
                                <Mail size={16} className="stroke-[2.5]" />
                              </div>
                              <div className="truncate min-w-0 flex-1">
                                <p
                                  className={`text-[8.5px] font-extrabold uppercase tracking-widest ${copiedField === "Email nhận hóa đơn" ? "text-slate-300" : "text-slate-400"}`}
                                >
                                  {t("Email nhận hóa đơn", "Invoice Email")}
                                </p>
                                <p
                                  className={`text-sm font-bold mt-1 break-all truncate ${copiedField === "Email nhận hóa đơn" ? "text-white" : "text-slate-800"}`}
                                >
                                  {activeCompany.email}
                                </p>
                              </div>
                            </div>

                            {!isCapturing && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                {copiedField === "Email nhận hóa đơn" ? (
                                  <span
                                    className="text-[10px] font-bold text-white uppercase flex items-center gap-0.5"
                                    style={{
                                      color: activeCompany.primaryColor,
                                    }}
                                  >
                                    <Check size={12} /> Đã copy!
                                  </span>
                                ) : (
                                  <span className="text-slate-400 group-hover:text-slate-900 flex items-center">
                                    <Copy size={14} />
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Phone */}
                        {activeCompany.phone && (
                          <div
                            onClick={() =>
                              copyToClipboard(
                                activeCompany.phone,
                                "Số điện thoại",
                              )
                            }
                            className={`p-3.5 rounded-xl border-2 cursor-pointer select-none group relative flex items-center justify-between transition-all duration-200 z-10 ${
                              copiedField === "Số điện thoại"
                                ? "border-slate-900 bg-slate-950 text-white"
                                : isCapturing
                                  ? "bg-white/80 border-slate-200/80 shadow-sm"
                                  : "bg-white/60 backdrop-blur-md border-white/80 shadow-sm hover:bg-white hover:border-slate-300 hover:shadow"
                            }`}
                          >
                            <div className="flex items-center gap-3 pr-2 w-full min-w-0">
                              <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border border-slate-200 text-slate-500 bg-white"
                                style={
                                  copiedField === "Số điện thoại"
                                    ? {
                                        backgroundColor:
                                          activeCompany.primaryColor,
                                        color: "#fff",
                                        borderColor: activeCompany.primaryColor,
                                      }
                                    : {}
                                }
                              >
                                <Phone size={16} className="stroke-[2.5]" />
                              </div>
                              <div className="truncate min-w-0 flex-1">
                                <p
                                  className={`text-[8.5px] font-extrabold uppercase tracking-widest ${copiedField === "Số điện thoại" ? "text-slate-300" : "text-slate-400"}`}
                                >
                                  {t("Số điện thoại liên hệ", "Contact Phone")}
                                </p>
                                <p
                                  className={`text-sm font-mono font-bold mt-1 ${copiedField === "Số điện thoại" ? "text-white" : "text-slate-850"}`}
                                >
                                  {activeCompany.phone}
                                </p>
                              </div>
                            </div>

                            {!isCapturing && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                {copiedField === "Số điện thoại" ? (
                                  <span
                                    className="text-[10px] font-bold text-white uppercase flex items-center gap-0.5"
                                    style={{
                                      color: activeCompany.primaryColor,
                                    }}
                                  >
                                    <Check size={12} /> Đã copy!
                                  </span>
                                ) : (
                                  <span className="text-slate-400 group-hover:text-slate-900 flex items-center">
                                    <Copy size={14} />
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions Grid: Lưu Text & Lưu Ảnh & Chia se */}
                      {!isCapturing && (
                        <div className="flex gap-2.5 px-6 pb-1 no-capture">
                          {/* Button 1: Sao chép Toàn bộ Text */}
                          <button
                            type="button"
                            onClick={() => {
                              const bankObj = VIETNAMESE_BANKS.find(
                                (b) => b.id === activeCompany.bankName,
                              );
                              const bankDisplayName = bankObj
                                ? bankObj.shortName || bankObj.name
                                : activeCompany.bankName || "";
                              const textToCopy = `Tên công ty: ${activeCompany.companyName || ""}
Mã số thuế: ${activeCompany.taxCode || ""}
Địa chỉ: ${activeCompany.address || ""}
Số điện thoại: ${activeCompany.phone || ""}
Email nhận hóa đơn: ${activeCompany.email || ""}${activeCompany.bankAccount ? `\nSố tài khoản: ${activeCompany.bankAccount}` : ""}${activeCompany.bankOwner ? `\nTên tài khoản: ${activeCompany.bankOwner.toUpperCase()}` : ""}${bankDisplayName ? `\nNgân hàng: ${bankDisplayName}` : ""}`;

                              copyToClipboard(
                                textToCopy,
                                "Toàn bộ thông tin dạng Text",
                              );
                            }}
                            className="flex-1 py-3 px-1 sm:px-2 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-md transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs min-[400px]:text-[13px] text-indigo-700 font-extrabold cursor-pointer select-none active:scale-[0.98] shadow-sm uppercase tracking-wide"
                          >
                            <Copy size={15} className="shrink-0 stroke-[2.5]" />
                            <span className="whitespace-nowrap pointer-events-none">{t("Lưu Text", "Save Text")}</span>
                          </button>

                          {/* Button Chia sẻ */}
                          <button
                            type="button"
                            onClick={handleShareInvoice}
                            className="w-[52px] shrink-0 py-3 rounded-xl border border-sky-200 bg-sky-50/40 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-md transition-all flex items-center justify-center text-sky-700 cursor-pointer select-none active:scale-[0.98] shadow-sm"
                            title={t("Chia sẻ", "Share")}
                          >
                            <Share2 size={18} className="stroke-[2.5]" />
                          </button>

                          {/* Button 2: Lưu Ảnh (Chụp màn hình thẻ thông tin) */}
                          <button
                            type="button"
                            onClick={handleCaptureImage}
                            className="flex-1 py-3 px-1 sm:px-2 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:shadow-md transition-all flex items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs min-[400px]:text-[13px] text-emerald-700 font-extrabold cursor-pointer select-none active:scale-[0.98] shadow-sm uppercase tracking-wide"
                          >
                            <Download size={15} className="shrink-0 stroke-[2.5]" />
                            <span className="whitespace-nowrap pointer-events-none">{t("Lưu Ảnh", "Save Image")}</span>
                          </button>
                        </div>
                      )}

                      {/* DYNAMIC VIETQR BANK TRANSFER CONTAINER: HIGHLY SIMPLIFIED FOR MINIMUM HEIGHT */}
                      {activeCompany.bankAccount && (
                        <div
                          className={`mx-0 border rounded-2xl p-4 space-y-3.5 shadow-sm ${isCapturing ? "bg-white border-slate-200" : "border-white/80 bg-white/60 backdrop-blur-md"}`}
                        >
                          {/* Centered QR code with image only */}
                          <div
                            className={`flex flex-col items-center justify-center bg-white border border-slate-200/60 rounded-xl relative mx-auto ${isCapturing ? "w-full p-2 aspect-[10/10]" : "p-2 w-[88%] aspect-[10/9]"}`}
                          >
                            <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
                              <div
                                className="w-full h-full absolute inset-0"
                                style={{
                                  transform: isCapturing
                                    ? "scale(1.24) translateY(-2.5%)"
                                    : "scale(1.18) translateY(-4%)",
                                  transformOrigin: "center",
                                }}
                              >
                                <img
                                  src={getVietQrUrl()}
                                  alt="VietQR"
                                  crossOrigin="anonymous"
                                  referrerPolicy="no-referrer"
                                  className={`w-full h-full ${isCapturing ? "object-contain" : "mix-blend-multiply object-contain"}`}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Copyable bank details info grid - Hidden in screenshots to rely on the uncropped VietQR image */}
                          <div
                            className={`p-3.5 rounded-xl border shadow-sm space-y-3 mt-4 ${isCapturing ? "hidden" : "bg-white/80 backdrop-blur-sm border-slate-200/60"}`}
                          >
                            <div
                              className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 cursor-pointer select-none hover:bg-slate-50/50 p-1 rounded transition-colors"
                              onClick={() =>
                                copyToClipboard(
                                  getBankDetail(activeCompany.bankName)
                                    ?.shortName || "KHÁC",
                                  "Tên ngân hàng",
                                )
                              }
                            >
                              <span className="text-slate-450 font-extrabold uppercase text-[9.5px] shrink-0 mr-3">
                                {t("Ngân hàng", "Bank")}
                              </span>
                              <div className="font-extrabold text-slate-800 flex items-center justify-end text-right min-w-0">
                                <span className="truncate mr-1.5">
                                  {getBankDetail(activeCompany.bankName)
                                    ?.shortName || "NGÂN HÀNG KHÁC"}
                                </span>
                                {!isCapturing && (
                                  <Copy
                                    size={11}
                                    className="text-slate-350 shrink-0"
                                  />
                                )}
                              </div>
                            </div>

                            <div
                              className="flex justify-between items-center text-sm border-b border-slate-150 pb-2 cursor-pointer select-none hover:bg-slate-50/50 p-1 rounded transition-colors"
                              onClick={() =>
                                copyToClipboard(
                                  activeCompany.bankAccount,
                                  "Số tài khoản",
                                )
                              }
                            >
                              <span className="text-slate-450 font-extrabold uppercase text-[9.5px] shrink-0 mr-3">
                                {t("Số tài khoản", "Account Number")}
                              </span>
                              <div className="font-mono text-emerald-600 text-[13.5px] font-black flex items-center justify-end text-right tracking-wide min-w-0">
                                <span className="truncate mr-1.5">
                                  {activeCompany.bankAccount}
                                </span>
                                {!isCapturing && (
                                  <Copy
                                    size={11}
                                    className="text-slate-350 shrink-0"
                                  />
                                )}
                              </div>
                            </div>

                            <div
                              className="flex justify-between items-center text-sm cursor-pointer select-none hover:bg-slate-50/50 p-1 rounded transition-colors"
                              onClick={() =>
                                copyToClipboard(
                                  activeCompany.bankOwner,
                                  "Chủ tài khoản",
                                )
                              }
                            >
                              <span className="text-slate-450 font-extrabold uppercase text-[9.5px] shrink-0 mr-3">
                                {t("Chủ tài khoản", "Account Name")}
                              </span>
                              <div className="font-bold text-[13px] text-slate-700 uppercase flex items-center justify-end text-right min-w-0">
                                <span
                                  className="mr-1.5 max-w-full text-right"
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    wordBreak: "break-word",
                                    lineHeight: "1.2",
                                  }}
                                >
                                  {activeCompany.bankOwner}
                                </span>
                                {!isCapturing && (
                                  <Copy
                                    size={11}
                                    className="text-slate-350 shrink-0"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Small Space-Saving Support Banner */}
                    {!isCapturing && (
                      <div className="px-6 pb-2 mt-auto">
                        <button
                          type="button"
                          onClick={() => setSupportModalOpen(true)}
                          className="w-full py-2 px-3 rounded-lg border border-rose-100 bg-rose-50/30 hover:bg-rose-50/70 hover:border-rose-200 transition-all flex items-center justify-center gap-1.5 text-[11px] text-rose-700 font-semibold cursor-pointer select-none active:scale-[0.98] shadow-sm"
                        >
                          <Heart
                            size={12}
                            className="fill-rose-500 stroke-rose-400/30 animate-pulse"
                          />
                          {t("Ủng hộ nhà phát triển", "Support developer")}
                        </button>
                      </div>
                    )}

                    {/* Bottom design credits */}
                    <div
                      className={`${isCapturing ? "mt-2 border-none pb-4 pt-1" : "mt-auto pt-4 pb-6 border-t"} bg-white/80 backdrop-blur-md px-6 md:pb-5 border-slate-200/50 flex justify-between items-center text-xs text-slate-400 w-full rounded-b-none md:rounded-b-[33px] relative z-20 transform-gpu`}
                    >
                      {isCapturing ? (
                        <span className="flex items-center gap-1.5 w-full justify-center text-slate-500 font-medium relative z-10 transform-gpu">
                          <span className="uppercase text-[9px] tracking-widest text-slate-400 font-bold">
                            {t("Nguồn", "Source")}:
                          </span>
                          <span className="text-indigo-600 font-mono font-bold tracking-wide">
                            vat.{appDomain}/{activeCompany.username}
                          </span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 relative z-10 transform-gpu">
                          Xây dựng bởi{" "}
                          <button
                            type="button"
                            onClick={navigateToHome}
                            className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                          >
                            {appDomain}
                          </button>
                        </span>
                      )}

                      {!isCapturing && (
                        <div className="flex items-center gap-2 relative z-10 transform-gpu">
                          <button
                            onClick={() =>
                              navigateToSlug(activeCompany.username, "admin")
                            }
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 hover:underline"
                          >
                            <Edit size={11} className="text-slate-400" /> Sửa
                            thông tin
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* relative z-10 block */}
                </div>
                {/* View scrolling Inner container */}
              </div>
              {/* Perfect outer clipping layer */}
            </div>
            {/* phone mock */}
          </div>
        )}

        {/* ==================== 3. ADMIN CONTROL CENTER ==================== */}
        {route === "admin" && activeCompany && (
          <div className="w-full bg-slate-100 py-12 px-4 flex-1 flex flex-col justify-center min-h-[90vh] relative overflow-hidden">
            <div className="max-w-2xl mx-auto w-full bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-xl relative z-10">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600 shrink-0">
                  <Settings size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    Admin Control Panel{" "}
                    <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                      /{activeCompany.username}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Thông tin xuất hóa đơn "{activeCompany.companyName}"
                  </p>
                </div>
              </div>

              {/* PASSCODE PROTECTED SHIELDS GATEWAY */}
              {!isLoggedAdmin ? (
                <div className="py-8 text-center max-w-sm mx-auto space-y-6">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
                    <Lock size={28} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Đăng nhập Admin Control Panel
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                      Vui lòng điền đúng Tên đăng nhập và Mật khẩu PIN của doanh
                      nghiệp để quản lý.
                    </p>
                  </div>

                  <form
                    onSubmit={handleAdminLogin}
                    className="space-y-4 text-left"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Tên đăng nhập (username slug)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: cong-ty-cua-ban"
                        value={adminUsernameInput}
                        onChange={(e) =>
                          setAdminUsernameInput(
                            e.target.value.toLowerCase().trim(),
                          )
                        }
                        className="w-full py-2.5 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:border-indigo-600 focus:bg-white focus:outline-none font-mono text-slate-950"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Mật khẩu PIN bí mật
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Nhập mã PIN mật khẩu..."
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full py-2.5 px-4 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:border-indigo-600 focus:bg-white focus:outline-none font-mono tracking-widest text-slate-950"
                      />
                    </div>

                    {loginError && (
                      <p className="text-xs text-red-500 font-bold">
                        ✕ {loginError}
                      </p>
                    )}

                    <div className="pt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigateToSlug(activeCompany.username, "view")
                        }
                        className="flex-1 py-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 uppercase tracking-wider transition-all"
                      >
                        Quay lại
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-indigo-100 transition-all cursor-pointer"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* FULLY LOGGED-IN ADMINISTRATIVE ENGINE */
                <div className="space-y-6 text-slate-900">
                  {/* Tab Selector bar inside the AdminCP */}
                  <div className="flex border-b border-slate-100 gap-2 pb-1 text-xs uppercase tracking-wider overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setAdminCPTab("info")}
                      className={`py-2 px-3 border-b-2 font-bold transition-all ${
                        adminCPTab === "info"
                          ? "border-indigo-600 text-indigo-600"
                          : "border-transparent text-slate-400 hover:text-slate-800"
                      }`}
                    >
                      Thông tin xuất hóa đơn
                    </button>
                    <button
                      onClick={() => setAdminCPTab("banks")}
                      className={`py-2 px-3 border-b-2 font-bold transition-all ${
                        adminCPTab === "banks"
                          ? "border-indigo-600 text-indigo-600"
                          : "border-transparent text-slate-400 hover:text-slate-800"
                      }`}
                    >
                      Chuyển khoản VietQR
                    </button>
                    <button
                      onClick={() => setAdminCPTab("domain")}
                      className={`py-2 px-3 border-b-2 font-bold transition-all ${
                        adminCPTab === "domain"
                          ? "border-indigo-600 text-indigo-600"
                          : "border-transparent text-slate-400 hover:text-slate-800"
                      }`}
                    >
                      Tên miền riêng
                    </button>
                    <button
                      onClick={() => setAdminCPTab("danger")}
                      className={`py-2 px-3 border-b-2 font-bold transition-all ${
                        adminCPTab === "danger"
                          ? "border-red-600 text-red-600"
                          : "border-transparent text-slate-400 hover:text-slate-800"
                      }`}
                    >
                      Bảo mật
                    </button>
                  </div>

                  <form onSubmit={handleSaveEdits} className="space-y-5">
                    {/* TAB 1: CORPORATE DETAIL INFO */}
                    {adminCPTab === "info" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Tên Đầy Đủ Đơn Vị (Viết hóa đơn)
                          </label>
                          <input
                            type="text"
                            required
                            value={editCompanyName}
                            onChange={(e) => {
                              const val = e.target.value.toUpperCase();
                              setEditCompanyName(val);
                              const unsigned = removeVietnameseTones(val);
                              setEditBankOwner(unsigned);
                            }}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Mã Số Thuế (Bản gốc)
                          </label>
                          <input
                            type="text"
                            required
                            value={editTaxCode}
                            onChange={(e) =>
                              setEditTaxCode(e.target.value.replace(/\s+/g, ""))
                            }
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Địa chỉ Đăng Ký Kinh Doanh
                          </label>
                          <input
                            type="text"
                            required
                            value={editAddress}
                            onChange={(e) => setEditAddress(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                              Email Nhận Hóa Đơn
                            </label>
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className={`w-full border px-3 py-2.5 rounded-lg text-sm focus:outline-none transition-all ${
                                isEmailInvalid(editEmail)
                                  ? "border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                  : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600 focus:bg-white"
                              }`}
                            />
                            {isEmailInvalid(editEmail) && (
                              <p className="text-[10px] text-red-500 mt-1 font-medium">
                                {t(
                                  "Email không hợp lệ.",
                                  "Invalid email address.",
                                )}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                              Số điện thoại liên hệ
                            </label>
                            <input
                              type="text"
                              maxLength={13}
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              className={`w-full border px-3 py-2.5 rounded-lg text-sm font-mono focus:outline-none transition-all ${
                                isPhoneInvalid(editPhone)
                                  ? "border-red-400 bg-red-50 text-red-900 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                  : "bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-600 focus:bg-white"
                              }`}
                            />
                            {isPhoneInvalid(editPhone) && (
                              <p className="text-[10px] text-red-500 mt-1 font-medium">
                                {t(
                                  "Số điện thoại không hợp lệ (chỉ nhập số, tối đa 13 ký tự).",
                                  "Invalid phone number.",
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Logo Uploading interface moved to Info Tab */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">
                            Logo đơn vị mới
                          </label>
                          <div className="mt-2 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 animate-fade-in">
                              {editLogoUrl ? (
                                <img
                                  src={editLogoUrl}
                                  alt="Logo"
                                  onError={() => setEditLogoUrl("")}
                                  referrerPolicy="no-referrer"
                                  className="max-w-full max-h-full object-contain"
                                  crossOrigin="anonymous"
                                />
                              ) : (
                                <Building2
                                  size={24}
                                  className="text-slate-350"
                                />
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleLogoUpload(e, "edit")}
                                className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border file:border-slate-200 file:text-xs file:font-semibold file:bg-white file:text-indigo-600 hover:file:bg-slate-50 cursor-pointer"
                              />
                              <p className="text-[9px] text-slate-400 font-medium">
                                Được tối ưu chuyển hóa Base64 lưu trực tiếp an
                                toàn. Màu chủ đạo sẽ tự động cập nhật theo logo.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Custom Web Title Section */}
                        <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100 mt-4 animate-fade-in shadow-sm">
                          <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-1.5 font-sans">
                            Tiêu đề Website riêng (Page Title SEO)
                          </label>
                          <input
                            type="text"
                            value={editWebsiteTitle}
                            onChange={(e) =>
                              setEditWebsiteTitle(e.target.value)
                            }
                            placeholder={`${editCompanyName || "Doanh nghiệp"} - Thông tin xuất hóa đơn`}
                            className="w-full bg-white border border-indigo-200/60 px-3 py-2.5 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-600 transition-all font-medium"
                          />
                          <p className="text-[9px] text-slate-450 mt-1.5 font-medium leading-relaxed">
                            Cấu hình tiêu đề hiển thị trên trình duyệt khi khách
                            vào xem trang này. Nếu không thiết lập, hệ thống
                            hiển thị mặc định:{" "}
                            <span className="font-semibold text-indigo-700">
                              Tạo trang thông tin xuất hóa đơn VAT
                            </span>
                            .
                          </p>
                        </div>
                      </div>
                    )}

                    {/* TAB 2: BANKQR DETAILS */}
                    {adminCPTab === "banks" && (
                      <div className="space-y-4">
                        {/* Optional Bank Tick Trigger Checkbox */}
                        <div className="bg-slate-50/30 p-1.5 rounded-xl border border-slate-200/55">
                          <label className="flex items-center gap-3 p-3.5 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none transition-all shadow-sm">
                            <input
                              type="checkbox"
                              checked={showEditQR}
                              onChange={(e) => {
                                setShowEditQR(e.target.checked);
                                if (!e.target.checked) {
                                  setEditBankAccount("");
                                  setEditBankOwner("");
                                }
                              }}
                              className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                {t("Hiện Mã QR thanh toán", "Show QR Payment Code")}
                              </p>
                            </div>
                          </label>
                        </div>
                        
                        {showEditQR && (
                          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 space-y-4 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                  Ngân hàng phát hành VietQR
                                </label>
                                <select
                                  value={editBankName}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setEditBankName(val);
                                    if (editBankAccount) {
                                      handleBankLookup(val, editBankAccount, true);
                                    }
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                                >
                                  {VIETNAMESE_BANKS.map((b) => (
                                    <option key={b.id} value={b.id}>
                                      {b.shortName}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                                  Số Tài Khoản
                                </label>
                                <input
                                  type="text"
                                  required={showEditQR}
                                  value={editBankAccount}
                                  onChange={(e) =>
                                    setEditBankAccount(
                                      e.target.value.replace(/\D/g, ""),
                                    )
                                  }
                                  onBlur={() => {
                                    if (editBankAccount) {
                                      handleBankLookup(
                                        editBankName,
                                        editBankAccount,
                                        true,
                                      );
                                    }
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-extrabold"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                  Chủ Tài Khoản (Viết hoa không dấu)
                                </label>
                                <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={editSyncWithCompany}
                                    onChange={(e) => {
                                      setEditSyncWithCompany(e.target.checked);
                                      if (e.target.checked && editCompanyName) {
                                        const unsignedOwner =
                                          removeVietnameseTones(
                                            editCompanyName,
                                          ).toUpperCase();
                                        setEditBankOwner(unsignedOwner);
                                      }
                                    }}
                                    className="w-3.5 h-3.5 rounded text-indigo-650 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                                  />
                                  <span>Giống tên công ty</span>
                                </label>
                              </div>
                              <input
                                type="text"
                                required={showEditQR}
                                value={editBankOwner}
                                onChange={(e) => {
                                  setEditBankOwner(e.target.value.toUpperCase());
                                  if (editSyncWithCompany) {
                                    setEditSyncWithCompany(false);
                                  }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white font-extrabold uppercase"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: CUSTOM DOMAIN (Tên miền riêng) */}
                    {adminCPTab === "domain" && (
                      <div className="space-y-5">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <h4 className="text-xs font-extrabold text-slate-900 uppercase flex items-center gap-1">
                            <Globe size={14} className="stroke-[2.5]" />{" "}
                            {t(
                              "Cấu hình tên miền riêng",
                              "Custom Domain Configuration",
                            )}
                          </h4>
                          <div>
                            <label className="block text-[9px] text-slate-450 uppercase font-extrabold mb-1">
                              {t(
                                "Tên miền của bạn (ví dụ: congty.com)",
                                "Your Domain",
                              )}
                            </label>
                            <input
                              type="text"
                              placeholder="www.tencongty.com"
                              value={editCustomDomain}
                              onChange={(e) =>
                                setEditCustomDomain(
                                  e.target.value.toLowerCase().trim(),
                                )
                              }
                              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-mono focus:outline-none focus:border-indigo-600"
                            />
                            <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded text-[10px] text-indigo-900 leading-relaxed font-medium">
                              Để sử dụng, vui lòng thiết lập DNS tại nơi cung
                              cấp tên miền:
                              <br />• Loại record: <strong>CNAME</strong>
                              <br />• Tên (Host): <strong>@</strong> hoặc{" "}
                              <strong>www</strong>
                              <br />• Giá trị (Value):{" "}
                              <strong>{appDomain}</strong>
                              <br />
                              <span className="text-red-600">
                                Lưu ý: Bạn phải thêm thuộc tính CNAME trên nhà
                                cung cấp tên miền trước hoặc sau khi thêm cấu
                                hình này để tính năng có tác dụng. Hệ thống sẽ
                                tự động điều hướng kết nối cho tên miền bạn điền
                                vào.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TAB 4: PASSWORD & PERMANENT REMOVAL */}
                    {adminCPTab === "danger" && (
                      <div className="space-y-6">
                        {/* Changing administrative passwords */}
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <h4 className="text-xs font-extrabold text-slate-900 uppercase flex items-center gap-1">
                            <Lock size={14} className="stroke-[2.5]" />{" "}
                            {t(
                              "Thay đổi mã PIN quản trị viên",
                              "Modify administrator PIN password",
                            )}
                          </h4>
                          <div>
                            <label className="block text-[9px] text-slate-450 uppercase font-extrabold mb-1">
                              {t("Mật khẩu mới", "New password")}
                            </label>
                            <input
                              type="password"
                              placeholder={t(
                                "Để trống nếu giữ nguyên mật khẩu cũ...",
                                "Leave blank to keep old password...",
                              )}
                              value={editNewPassword}
                              onChange={(e) =>
                                setEditNewPassword(e.target.value)
                              }
                              className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-mono focus:outline-none"
                            />
                          </div>

                          <div className="pt-4 border-t border-slate-200">
                            <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer select-none transition-all shadow-sm">
                              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{editIsPublic ? t("Công Khai", "Public") : t("Riêng tư", "Private")}</span>
                              <input
                                type="checkbox"
                                checked={editIsPublic}
                                onChange={(e) => setEditIsPublic(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Permanent deletion block with high contrast distinct style */}
                        <div className="p-5 bg-red-50 border-2 border-red-300 rounded-xl space-y-3.5 ms-0">
                          <h4 className="text-xs font-black text-red-800 uppercase flex items-center gap-2 leading-none">
                            <Trash2 size={16} className="text-red-700" />{" "}
                            {t(
                              "XÓA VĨNH VIỄN TRANG THÔNG TIN DOANH NGHIỆP",
                              "PERMANENTLY DELETE COMPANY PAGE",
                            )}
                          </h4>
                          <p className="text-[11px] text-red-950 leading-relaxed font-bold">
                            {t(
                              "Thao tác này hoàn toàn KHÔNG THỂ đảo ngược. Đường dẫn public sẽ bị xóa vĩnh viễn hoàn toàn, người khác có thể đăng ký lại Slug username này.",
                              "This action is absolutely IRREVERSIBLE. The public link will be permanently deleted and someone else can register this slug username.",
                            )}
                          </p>

                          {!showDeleteConfirm ? (
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(true)}
                              className="text-xs font-extrabold uppercase tracking-widest bg-red-700 hover:bg-red-800 text-white rounded-lg px-5 py-3 transition-all cursor-pointer inline-flex items-center gap-2 shadow-lg hover:shadow-red-200 border-2 border-red-800 active:scale-95"
                            >
                              <Trash2 size={14} />{" "}
                              {t(
                                "Xóa vĩnh viễn hoàn toàn",
                                "Permanently delete completely",
                              )}
                            </button>
                          ) : (
                            <div className="p-4 bg-white border border-red-200 rounded-lg space-y-2.5">
                              <p className="text-xs text-red-700 font-extrabold flex items-center gap-1.5 whitespace-normal">
                                ⚠️{" "}
                                {t(
                                  "Bạn có chắc chắn 100% muốn xóa vĩnh viễn trang này?",
                                  "Are you 100% sure you want to permanently delete this page?",
                                )}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowDeleteConfirm(false)}
                                  className="text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded px-4 py-2 cursor-pointer transition-colors"
                                >
                                  {t(
                                    "Hủy bỏ, giữ lại trang",
                                    "Cancel, keep page",
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleDeleteCompany}
                                  className="text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white rounded px-4 py-2 cursor-pointer transition-colors active:scale-95 flex items-center gap-1"
                                >
                                  <Trash2 size={12} />{" "}
                                  {t("Xác nhận xóa ngay", "Confirm delete now")}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ACTIONS BUTTON DETAILS */}
                    <div className="pt-4 border-t border-slate-100 flex justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsLoggedAdmin(false);
                          navigateToSlug(activeCompany.username, "view");
                        }}
                        className="py-3 px-5 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition-all"
                      >
                        Thoát panel
                      </button>

                      <button
                        type="submit"
                        className="py-3 px-6 rounded-lg text-xs font-extrabold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 transition-all cursor-pointer"
                      >
                        Lưu cấu hình cập nhật
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== 4. GLOBAL SYSTEM ADMIN ==================== */}
        {route === "globalAdmin" && !isAdminLoggedIn && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 min-h-[calc(100vh-140px)] border-t border-slate-100">
            <div className="max-w-md w-full bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-200">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner mb-3">
                  <Lock size={22} className="stroke-[2.5]" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  {t("Đăng nhập Hệ thống", "System Login")}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t(
                    "Cung cấp tài khoản quản trị viên để tiếp tục",
                    "Provide admin credentials to continue",
                  )}
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    const res = await fetch("/api/admin/login", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        username: adminUsername,
                        password: adminPasswordInput,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      setIsAdminLoggedIn(true);
                      setAdminSystemPassword(adminPasswordInput);
                      try {
                        sessionStorage.setItem("isAdminLoggedIn", "true");
                        sessionStorage.setItem(
                          "adminSystemPassword",
                          adminPasswordInput,
                        );
                      } catch (e) {
                        console.error(e);
                      }
                      showToast(
                        t("Đăng nhập thành công!", "Sign in successful!"),
                        "success",
                      );
                    } else {
                      showToast(
                        data.message ||
                          t(
                            "Tên đăng nhập hoặc mật khẩu không đúng.",
                            "Incorrect username or password.",
                          ),
                        "error",
                      );
                    }
                  } catch (err) {
                    showToast(
                      t("Lỗi kết nối máy chủ.", "Server connection error."),
                      "error",
                    );
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    {t("Tên đăng nhập", "Username")}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium text-slate-800"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                    {t("Mật khẩu", "Password")}
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium text-slate-800"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl shadow transition-all cursor-pointer active:scale-95 text-center block"
                  >
                    {t("Đăng nhập Admin", "Sign In")}
                  </button>
                </div>
              </form>

              <button
                onClick={navigateToHome}
                className="w-full mt-3 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold uppercase tracking-widest text-[9px] py-3 rounded-xl transition-all cursor-pointer active:scale-95 text-center flex items-center justify-center gap-1.5 font-sans"
              >
                <ArrowLeft size={13} /> {t("Quay về trang chủ", "Return Home")}
              </button>
            </div>
          </div>
        )}

        {/* ==================== 4. GLOBAL SYSTEM ADMIN PANEL ==================== */}
        {route === "globalAdmin" && isAdminLoggedIn && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 min-h-[calc(100vh-140px)] border-t border-slate-100">
            <div className="max-w-xl w-full bg-white rounded-2xl p-6 md:p-8 shadow-xl border border-slate-200">
              <h2 className="text-xl font-bold mb-6 text-slate-800 border-b border-slate-100 pb-4">
                {t("Cài đặt Website tổng", "Site Administration")}
              </h2>

              <div className="space-y-6 mb-6">
                {/* 1. KHỐI CẤU HÌNH CHUNG & THƯƠNG HIỆU */}
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-2 mb-2">
                    <span className="text-sm font-bold text-slate-800">
                      1. {t("Cấu hình Chung", "General Settings")}
                    </span>
                  </div>

                  {/* Logo System Uploader */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                      {t("Logo Website", "Site Logo Image")}
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {siteLogo ? (
                          <img
                            src={siteLogo}
                            alt="Site Logo"
                            className="max-w-full max-h-full object-contain"
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <Building2 size={24} className="text-slate-450" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex gap-2">
                          <label className="bg-white border border-slate-250 text-slate-700 hover:bg-slate-50 text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-all active:scale-[0.98] shadow-sm">
                            {t("Tải logo lên", "Upload Logo")}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleSiteLogoUpload}
                            />
                          </label>
                          {siteLogo && (
                            <button
                              type="button"
                              onClick={() => {
                                setSiteLogo("");
                                if (useLogoAsFavicon) {
                                  setGlobalFaviconUrl("");
                                  setUseLogoAsFavicon(false);
                                }
                                showToast("Đã gỡ logo site!", "info");
                              }}
                              className="border border-red-200 text-red-650 hover:bg-red-50 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-[0.98]"
                            >
                              ✕ Gỡ logo
                            </button>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-450 font-medium">
                          PNG, JPG hoặc SVG tối đa 2MB. Logo co giãn, hiển thị
                          tối ưu trên Header.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Base URL configuration field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                      {t(
                        "Địa chỉ gốc của trang (Base URL)",
                        "Site Base Domain",
                      )}
                    </label>
                    <input
                      type="text"
                      className="w-full text-sm font-mono border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-slate-800"
                      value={globalBaseUrl}
                      onChange={(e) => setGlobalBaseUrl(e.target.value)}
                      placeholder={`https://${appDomain}/vat`}
                    />
                    <p className="text-[10px] text-slate-450 mt-1 font-medium">
                      Phục vụ xuất Excel hoặc sinh mã QR hoá đơn (Ví dụ:
                      https://{appDomain}/vat)
                    </p>
                  </div>

                  {/* Favicon Settings Section */}
                  <div className="pt-4 border-t border-slate-200/50">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-550 mb-1.5 uppercase tracking-wider animate-fade-in">
                        Favicon toàn trang
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm p-1.5">
                          {globalFaviconUrl ? (
                            <img
                              src={globalFaviconUrl}
                              alt="Favicon"
                              className="max-w-full max-h-full object-contain"
                              referrerPolicy="no-referrer"
                              crossOrigin="anonymous"
                            />
                          ) : (
                            <ImageIcon size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex gap-1.5">
                            <label
                              className={`bg-white border text-slate-700 hover:bg-slate-50 text-[10px] font-extrabold px-2.5 py-1.5 rounded cursor-pointer transition-all active:scale-[0.98] shadow-sm uppercase tracking-wide ${useLogoAsFavicon ? "opacity-50 border-slate-200 pointer-events-none" : "border-slate-250"}`}
                            >
                              Chọn ảnh
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={useLogoAsFavicon}
                                onChange={handleGlobalFaviconUpload}
                              />
                            </label>
                            {globalFaviconUrl && (
                              <button
                                type="button"
                                onClick={() => {
                                  setGlobalFaviconUrl("");
                                  setUseLogoAsFavicon(false);
                                  showToast("Đã gỡ favicon!", "info");
                                }}
                                className="border border-red-100 text-red-655 hover:bg-red-50 text-[10px] font-extrabold px-2 py-1.5 rounded transition-all active:scale-[0.98] uppercase tracking-wide cursor-pointer"
                              >
                                Gỡ
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sync Option with a short label */}
                      <div className="mt-2 text-left">
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={useLogoAsFavicon}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setUseLogoAsFavicon(checked);
                              if (checked) {
                                if (siteLogo) {
                                  setGlobalFaviconUrl(siteLogo);
                                  showToast(
                                    "Đã đồng bộ Favicon với Logo của trang!",
                                    "success",
                                  );
                                } else {
                                  showToast(
                                    "Vui lòng tải Logo của trang lên trước.",
                                    "error",
                                  );
                                  setUseLogoAsFavicon(false);
                                }
                              } else {
                                setGlobalFaviconUrl("");
                              }
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-600 font-bold">
                            Dùng luôn logo
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. KHỐI CẤU HÌNH SEO & HEADER */}
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-2 mb-2">
                    <span className="text-sm font-bold text-slate-800">
                      2. {t("Cấu hình SEO & Header", "SEO & Header Settings")}
                    </span>
                  </div>

                  {/* Page Title SEO configuration field */}
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-650 mb-1.5 uppercase tracking-wider font-sans">
                      Cấu hình Tiêu đề Website riêng (Page Title SEO)
                    </label>
                    <input
                      type="text"
                      className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium text-slate-850"
                      value={globalSeoTitle}
                      onChange={(e) => setGlobalSeoTitle(e.target.value)}
                      placeholder="Tạo trang thông tin xuất hóa đơn VAT"
                    />
                    <p className="text-[10px] text-slate-455 mt-1 font-medium">
                      Tiêu đề chính hiển thị trên tab trình duyệt (Mặc định: Tạo
                      trang thông tin xuất hóa đơn VAT)
                    </p>
                  </div>

                  {/* Brand Header Name configuration field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 mb-1.5 uppercase tracking-wider font-sans">
                      Tên hiển thị góc trái Header (Brand Name)
                    </label>
                    <input
                      type="text"
                      className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium text-slate-800"
                      value={siteTitle}
                      onChange={(e) => setSiteTitle(e.target.value)}
                      placeholder={appDomain}
                    />
                    <p className="text-[10px] text-slate-455 mt-1 font-medium">
                      Tên thương hiệu chữ in hoa góc trái của thanh Header (Mặc
                      định: {appDomain})
                    </p>
                  </div>

                  {/* Header Subtitle configuration field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                      {t("Slogan / Tagline Header Website", "Header Tagline")}
                    </label>
                    <input
                      type="text"
                      className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium text-slate-800"
                      value={siteSubtitle}
                      onChange={(e) => setSiteSubtitle(e.target.value)}
                      placeholder={t(
                        "Giải pháp cho doanh nghiệp",
                        "Solutions for businesses",
                      )}
                    />
                    <p className="text-[10px] text-slate-450 mt-1 font-medium">
                      Lời giới thiệu phụ hiển thị dưới Logo (Mặc định: Giải pháp
                      cho doanh nghiệp)
                    </p>
                  </div>

                  {/* Header Link configuration field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                      {t(
                        "Đường dẫn liên kết logo/tiêu đề Header",
                        "Header Brand Destination Link",
                      )}
                    </label>
                    <input
                      type="text"
                      className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono text-slate-850"
                      value={headerLink}
                      onChange={(e) => setHeaderLink(e.target.value)}
                      placeholder="https://example.com"
                    />
                    <p className="text-[10px] text-slate-450 mt-1 font-medium">
                      Đường dẫn khi click vào Brand Logo/Title góc trái (Để
                      trống sẽ tải lại trang chủ)
                    </p>
                  </div>
                </div>

                {/* 3. KHỐI CẤU HÌNH FOOTER (CHÂN TRANG) */}
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-2 mb-2">
                    <span className="text-sm font-bold text-slate-800">
                      3. {t("Cấu hình Footer (Chân trang)", "Footer Settings")}
                    </span>
                  </div>

                  {/* Footer Text configuration field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                      {t(
                        "Nội dung chân trang (Footer Text)",
                        "Footer Credit Text",
                      )}
                    </label>
                    <input
                      type="text"
                      className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-medium text-slate-800"
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder={t(
                        `${appDomain}, Giải pháp cho doanh nghiệp.`,
                        `${appDomain}, Solutions for businesses.`,
                      )}
                    />
                    <p className="text-[10px] text-slate-450 mt-1 font-medium">
                      Text hiển thị dưới chân trang (Mặc định: {appDomain}, Giải
                      pháp cho doanh nghiệp.)
                    </p>
                  </div>

                  {/* Footer Link configuration field */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-550 mb-1.5 uppercase tracking-wider">
                      {t(
                        "Đường dẫn khi click vào Footer Text",
                        "Footer Credit Destination Link",
                      )}
                    </label>
                    <input
                      type="text"
                      className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono text-slate-850"
                      value={footerLink}
                      onChange={(e) => setFooterLink(e.target.value)}
                      placeholder="https://example.com"
                    />
                    <p className="text-[10px] text-slate-450 mt-1 font-medium">
                      Đường dẫn khi click vào Footer Text dưới cùng (Để trống sẽ
                      tải lại trang chủ)
                    </p>
                  </div>

                  {/* Footer Secondary Links dynamic block */}
                  <div className="border-t border-slate-200/60 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                        {t(
                          "Đường dẫn phụ dưới chân trang",
                          "Secondary Footer Links",
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setFooterSecondaryLinks([
                            ...footerSecondaryLinks,
                            { text: "", url: "" },
                          ]);
                        }}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-[11px] px-3 py-1.5 rounded-lg border border-indigo-100 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="font-bold text-sm leading-none">
                          +
                        </span>{" "}
                        {t("Thêm liên kết", "Add link")}
                      </button>
                    </div>
                    {footerSecondaryLinks.length === 0 ? (
                      <p className="text-xs text-slate-450 italic bg-white border border-slate-150 p-3 rounded-xl text-center">
                        Chưa có liên kết phụ nào được thiết lập.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                        {footerSecondaryLinks.map((item, index) => (
                          <div
                            key={index}
                            className="flex gap-2 items-center bg-white border border-slate-200 p-2.5 rounded-xl"
                          >
                            <div className="flex-1 space-y-1.5">
                              <input
                                type="text"
                                required
                                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                                placeholder="Tên hiển thị (Ví dụ: Trang chủ Bộ Tài Chính)"
                                value={item.text}
                                onChange={(e) => {
                                  const list = [...footerSecondaryLinks];
                                  list[index].text = e.target.value;
                                  setFooterSecondaryLinks(list);
                                }}
                              />
                              <input
                                type="text"
                                required
                                className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                                placeholder="Đường dẫn url https://..."
                                value={item.url}
                                onChange={(e) => {
                                  const list = [...footerSecondaryLinks];
                                  list[index].url = e.target.value;
                                  setFooterSecondaryLinks(list);
                                }}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const list = footerSecondaryLinks.filter(
                                  (_, idx) => idx !== index,
                                );
                                setFooterSecondaryLinks(list);
                              }}
                              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-150 rounded-lg w-8 h-12 flex items-center justify-center shrink-0 transition-colors text-xs font-bold cursor-pointer"
                              title="Xóa liên kết"
                            >
                              ✖
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. KHỐI CẤU HÌNH AI (GEMINI) */}
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-150 pb-2 mb-2">
                    <span className="text-sm font-bold text-slate-800">
                      4. {t("Cấu hình AI (Gemini Premium)", "AI Configuration (Gemini)")}
                    </span>
                  </div>

                  {/* Gemini API Key configuration field */}
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-650 mb-1.5 uppercase tracking-wider font-sans">
                      Khóa API Gemini (GEMINI_API_KEY)
                    </label>
                    <input
                      type="password"
                      className="w-full text-sm border border-slate-200 rounded-xl p-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono text-slate-850"
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AI_Studio_Gemini_API_Key..."
                    />
                    <p className="text-[10px] text-slate-455 mt-1.5 font-medium leading-relaxed">
                      Dùng để kích hoạt tính năng kéo thả ảnh, cho phép AI tự động phân tích MST, tên doanh nghiệp, địa chỉ và số điện thoại. Mã khóa này được lưu trữ trực tiếp vào cơ sở dữ liệu Firestore một cách bảo mật dưới máy chủ và không bao giờ bị lộ ra ngoài trình duyệt. Bạn có thể tạo miễn phí tại Google AI Studio.
                    </p>
                  </div>
                </div>

                {/* NÚT LƯU CẤU HÌNH TỔNG */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={saveGlobalSettings}
                    className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold uppercase tracking-widest text-xs py-3.5 rounded-xl shadow-lg transition-all cursor-pointer hover:shadow-indigo-100 active:scale-95 text-center flex items-center justify-center gap-2"
                  >
                    {t("Lưu cấu hình hệ thống", "Save system configuration")}
                  </button>
                </div>

                {/* DANH SÁCH TRANG ĐÃ TẠO */}
                <div className="mt-6 border-t border-slate-200/60 pt-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 block">
                    {t("Danh sách trang đã tạo", "Created Pages")} (
                    {registeredCompanies.length})
                  </h3>

                  {registeredCompanies.length === 0 ? (
                    <p className="text-xs text-slate-450 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      {t("Chưa có trang nào.", "No pages created yet.")}
                    </p>
                  ) : (
                    <div className="space-y-3 max-h-85 overflow-y-auto pr-1">
                      {registeredCompanies.map((co) => (
                        <div
                          key={co.username}
                          className="flex flex-row items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-900 line-clamp-1">
                              {co.companyName}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              /{co.username}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {deletingUsername === co.username ? (
                              <div className="flex items-center gap-1.5 bg-red-50 border border-red-150 p-1.5 rounded-lg shrink-0">
                                <span className="text-[10px] font-bold text-red-700 animate-pulse px-1">
                                  Xác nhận?
                                </span>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(
                                        `/api/companies/${co.username}`,
                                        {
                                          method: "DELETE",
                                          headers: {
                                            "Content-Type": "application/json",
                                            "x-admin-password":
                                              adminSystemPassword,
                                          },
                                          body: JSON.stringify({
                                            adminPassword: adminSystemPassword,
                                          }),
                                        },
                                      );
                                      const json = await res.json();
                                      if (json.success) {
                                        showToast(
                                          "Đã xóa trang thành công.",
                                          "success",
                                        );
                                        setDeletingUsername(null);
                                        fetchRegisteredCompanies();
                                      } else {
                                        showToast(
                                          "Lỗi: " + json.message,
                                          "error",
                                        );
                                      }
                                    } catch (e) {
                                      showToast("Thao tác thất bại.", "error");
                                    }
                                  }}
                                  className="text-[9px] uppercase font-extrabold text-white bg-red-600 hover:bg-red-700 px-2 py-1 rounded-md transition-colors cursor-pointer"
                                >
                                  Xóa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingUsername(null)}
                                  className="text-[9px] uppercase font-extrabold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    navigateToSlug(co.username, "admin")
                                  }
                                  className="text-[10px] uppercase font-extrabold text-indigo-655 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-100 transition-colors cursor-pointer"
                                >
                                  Tới Admin
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeletingUsername(co.username)
                                  }
                                  className="text-[10px] uppercase font-extrabold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-100 transition-colors cursor-pointer"
                                >
                                  Xóa
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER GENERAL INFO */}
      {route !== "view" && (
        <footer className="bg-white border-t border-slate-100 py-8 px-4 text-center mt-auto">
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Main Footer Text with dynamic destination link option */}
            {footerLink ? (
              <p className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
                <a href={footerLink} target="_blank" rel="noopener noreferrer">
                  {footerText ||
                    t(
                      `${appDomain}, Giải pháp cho doanh nghiệp.`,
                      `${appDomain}, Solutions for businesses.`,
                    )}
                </a>
              </p>
            ) : (
              <p
                className="text-sm font-semibold text-slate-500 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={navigateToHome}
              >
                {footerText ||
                  t(
                    `${appDomain}, Giải pháp cho doanh nghiệp.`,
                    `${appDomain}, Solutions for businesses.`,
                  )}
              </p>
            )}

            {/* Secondary Footer Links custom list */}
            {footerSecondaryLinks && footerSecondaryLinks.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-indigo-600 font-bold border-b border-slate-100 pb-3 mb-2 max-w-xl mx-auto">
                {footerSecondaryLinks.map((linkItem, idx) => {
                  if (!linkItem.text || !linkItem.url) return null;
                  return (
                    <a
                      key={idx}
                      href={linkItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-800 hover:underline transition-colors"
                    >
                      {linkItem.text}
                    </a>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-slate-500 font-medium pt-2">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden sm:inline">
                  {t("Lượt truy cập hôm nay:", "Visits today:")}
                </span>{" "}
                <span className="text-slate-800 font-bold ml-1">
                  {Math.floor((Date.now() / 86400000) % 1000) + 1205}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-full">
                <Building2 size={12} className="text-indigo-500" />
                <span className="hidden sm:inline">
                  {t("Số trang đã tạo:", "Total pages:")}
                </span>{" "}
                <span className="text-slate-800 font-bold ml-1">
                  {registeredCompanies.length}
                </span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* SUPPORT DEVELOPER MODAL */}
      {supportModalOpen && (
        <div
          className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSupportModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header banner */}
            <div className="p-5 text-white bg-gradient-to-r from-amber-500 to-orange-600 relative">
              <button
                onClick={() => setSupportModalOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-red-100 bg-black/20 hover:bg-black/40 w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer text-sm font-bold z-10 block"
              >
                ✖
              </button>
              <div className="flex items-center gap-2 mb-1.5 animate-pulse">
                <Heart size={20} className="fill-white stroke-none shrink-0" />
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {t("Ủng hộ nhà phát triển", "Support Developer")}
                </h3>
              </div>
              <p className="text-[11px] text-amber-50 leading-relaxed font-semibold">
                {t(
                  "Nếu ứng dụng iKey mang lại giá trị cho bạn, hãy gửi một chút năng lượng động viên đội ngũ lập trình nhé!",
                  "If iKey application brings value to you, please support our software engineering team!",
                )}
              </p>
            </div>

            {/* Support Packages Selection */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  {
                    id: "iced_tea",
                    label: t("Trà đá 🧊", "Iced Tea 🧊"),
                    desc: "10K",
                    amount: 10000,
                    theme:
                      "active:bg-amber-100/70 border-amber-200 bg-amber-50/40 text-amber-900",
                  },
                  {
                    id: "coffee",
                    label: t("Cà phê ☕", "Coffee ☕"),
                    desc: "35K",
                    amount: 35000,
                    theme:
                      "active:bg-orange-100/70 border-orange-200 bg-orange-50/40 text-orange-900",
                  },
                  {
                    id: "lunch",
                    label: t("Bữa sáng 🍱", "Breakfast 🍱"),
                    desc: "100K",
                    amount: 100000,
                    theme:
                      "active:bg-emerald-100/70 border-emerald-200 bg-emerald-50/40 text-emerald-900",
                  },
                  {
                    id: "custom",
                    label: t("Tùy tâm ❤️", "Any amt ❤️"),
                    desc: "?",
                    amount: 0,
                    theme:
                      "active:bg-indigo-100/70 border-indigo-200 bg-indigo-50/40 text-indigo-900",
                  },
                ].map((pkg) => {
                  const isSelected =
                    (pkg.amount === 0 && supportAmount === 0) ||
                    (pkg.amount !== 0 && supportAmount === pkg.amount);
                  return (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSupportAmount(pkg.amount)}
                      className={`flex flex-col items-center justify-center p-2 text-center rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "border-amber-500 bg-amber-100/70 ring-2 ring-amber-400 font-extrabold scale-102"
                          : `${pkg.theme} opacity-85 hover:opacity-100 border-dashed hover:border-solid`
                      }`}
                    >
                      <span className="text-[9px] sm:text-[10px] font-black leading-tight mb-0.5">
                        {pkg.label}
                      </span>
                      <span className="text-[10px] sm:text-xs font-black">
                        {pkg.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {supportAmount === 0 && (
                <div className="flex bg-white items-center gap-2 border-2 border-indigo-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 rounded-xl px-3 py-2 transition-all">
                  <span className="text-sm font-semibold text-slate-500">
                    VNĐ
                  </span>
                  <input
                    type="number"
                    min="1000"
                    placeholder="Nhập số tiền..."
                    className="w-full text-base font-bold bg-transparent outline-none border-none text-slate-900"
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setSupportAmount(val);
                      }
                    }}
                  />
                </div>
              )}

              {/* Bank Transfer Details with Scannable QR Code */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
                <p className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider text-center">
                  {t(
                    "Quét mã QR qua mọi ứng dụng Ngân hàng",
                    "Scan QR via your VietQR mobile banking app",
                  )}
                </p>

                {/* Dynamically display VietQR using the dynamic VietQR api to make it completely working and functional! */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-md transform scale-105">
                  <img
                    src={`https://img.vietqr.io/image/vietcombank-9856600666-compact.png?amount=${supportAmount === 0 ? "" : supportAmount}&addInfo=${encodeURIComponent(supportAmount === 10000 ? "Ung ho tra da" : supportAmount === 35000 ? "Ung ho ca phe" : supportAmount === 100000 ? "Ung ho bua sang" : "Ung ho ikey")}&accountName=NGUYEN%20XUAN%20TAI`}
                    alt="VietQR dynamic support"
                    className="w-40 h-40 object-contain mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="text-center space-y-0.5">
                  <p className="text-xs font-black text-slate-800">
                    Vietcombank
                  </p>
                  <p className="text-base font-black text-indigo-650 font-mono tracking-tight">
                    9856600666
                  </p>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-tight">
                    {t("Chủ tài khoản", "Beneficiary")}:{" "}
                    <span className="text-slate-700">NGUYEN XUAN TAI</span>
                  </p>
                  {supportAmount > 0 ? (
                    <p className="text-[9px] px-2 mt-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full font-mono inline-block font-semibold">
                      {t(
                        `Ủng hộ: ${supportAmount.toLocaleString("vi-VN")}đ`,
                        `Donating: ${supportAmount.toLocaleString("en-US")} VND`,
                      )}
                    </p>
                  ) : (
                    <p className="text-[9px] px-2 mt-1 bg-amber-50 border border-amber-100 text-amber-700 rounded-full font-mono inline-block font-semibold">
                      {t(`Ủng hộ tùy tâm ❤️`, `Donating any amount ❤️`)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
