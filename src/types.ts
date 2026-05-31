export interface CompanyInfo {
  username: string; // URL Slug
  companyName: string; // Tên đầy đủ công ty
  taxCode: string; // Mã số thuế
  address: string; // Địa chỉ đăng ký kinh doanh
  email: string; // Email nhận hóa đơn
  phone: string; // Số điện thoại liên hệ
  logoUrl: string; // Logo công ty
  bankName: string; // Tên ngân hàng
  bankAccount: string; // Số tài khoản ngân hàng
  bankOwner: string; // Tên chủ tài khoản
  primaryColor: string; // Hệ màu chủ đạo (mã Hex)
  adminPassword?: string; // Mật khẩu quản trị
  newAdminPassword?: string; // Mật khẩu quản trị mới (khi cập nhật)
  customDomain?: string; // Custom domain trỏ về
  faviconUrl?: string; // Favicon URL mới
  thumbnailUrl?: string; // Thumbnail URL mới
  websiteTitle?: string; // Website Title mới
  createdAt: string;
  updatedAt: string;
}

export interface BankConfig {
  id: string;
  name: string;
  shortName: string;
  logo: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
