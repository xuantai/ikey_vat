# 📋 Cổng Thông Tin Xuất Hóa Đơn & Thanh Toán Doanh Nghiệp (VIETQR & INVOICE PORTAL)

[Click here for English version](#english-version)

Cổng thông tin giúp doanh nghiệp dễ dàng lưu trữ, hiển thị thông tin xuất hóa đơn (Mã số thuế, tên công ty, địa chỉ) cùng với danh sách ngân hàng nhận thanh toán bằng **VietQR**. Khách hàng chỉ cần quét một mã QR duy nhất để xem toàn bộ thông tin thanh toán, sao chép thông tin xuất hóa đơn nhanh chóng, chính xác.

---

## ✨ Tính Năng Nổi Bật

- **🔍 Tra cứu MST Tự Động**: Tự động nhập và điền thông tin doanh nghiệp (Tên công ty, Địa chỉ chính thức) ngay khi nhập Mã số thuế (MST).
- **💳 VietQR Thanh Toán Nhanh**: Tự động tạo mã QR thanh toán chuẩn Napas 247 cho tất cả ngân hàng thương mại Việt Nam. Khách hàng chỉ cần mở app bank quét là điền sẵn số tài khoản, số tiền và nội dung chuyển khoản.
- **🔐 Admin Control Panel Bảo Mật**: Đăng nhập bằng Passcode cấu dịch riêng cho từng công ty để thay đổi logo, màu sắc thương hiệu, đổi thông tin liên hệ và quản lý danh sách tài khoản ngân hàng.
- **🎨 Giao Diện Mobile-First Tối Ưu**: Thiết kế đặc biệt tinh gọn, thẩm mỹ cao trên điện thoại, cỡ chữ được căn chỉnh sang trọng giúp việc sao chép (copy) thông tin MST và địa chỉ chỉ bằng một chạm.
- **☁️ Cloud-Ready & Server-Side Protected**: Sử dụng kiến trúc Full-stack (React client bảo mật qua Express server) bảo vệ an toàn các API Key nhạy cảm ở phía Back-end.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend**: [React 19](https://react.dev/), [Vite 6](https://vite.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Backend / API proxy**: [Express.js](https://expressjs.com/), [Esbuild](https://esbuild.github.io/) (đóng gói server siêu tốc thành single-file CJS)
- **Cơ sở dữ liệu**: Hỗ trợ đồng bộ hóa Firebase Firestore hoặc Local State linh hoạt.
- **Quản lý hoạt ảnh**: [Motion](https://motion.dev/) (motion/react v12) cho trải nghiệm lướt mượt mà như app native.
- **Icon**: [Lucide-React](https://lucide.dev/)

---

## 💻 Cài Đặt và Khởi Tạo Dưới Local

### Yêu cầu hệ thống
- **Node.js** v18 trở lên (khuyên dùng Node 20+)
- **NPM** hoặc **Yarn**

### Các bước khởi chạy:

1. **Clone mã nguồn về máy**:
   ```bash
   git clone <your-github-repo-url>
   cd <your-repo-folder>
   ```

2. **Cài đặt các thư viện phụ thuộc (Dependencies)**:
   ```bash
   npm install
   ```

3. **Cấu hình file môi trường**:
   Sao chép `.env.example` thành `.env` và điền các API Key của bạn (như Gemini APi Key, VietQR API nếu có):
   ```bash
   cp .env.example .env
   ```

4. **Chạy ứng dụng chế độ Development**:
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000`

5. **Build cho bản Production**:
   ```bash
   npm run build
   ```
   Lệnh này thực hiện hai việc:
   - Compile code Frontend React thành các file tĩnh nằm trong thư mục `dist/`.
   - Bundle code Backend `server.ts` thành file duy nhất hoạt động độc lập tại `dist/server.cjs`.

6. **Chạy Thử Bản Build**:
   ```bash
   npm run start
   ```

---

## 🖥️ HƯỚNG DẪN CÀI ĐẶT CHI TIẾT TRÊN VPS CLOUDPANEL

CloudPanel là một Control Panel gọn nhẹ, hiệu năng cực cao và quản lý các ứng dụng Node.js rất trực quan. Dưới đây là các bước chi tiết để bạn triển khai cổng thông tin này lên VPS CloudPanel của mình:

### Bước 1: Tạo Website Node.js mới trên CloudPanel
1. Đăng nhập vào trang quản trị CloudPanel của bạn (mặc định tại cổng `8443`).
2. Vào tab **Sites** -> Click **Add Site**.
3. Chọn loại website: **Create a Node.js Site**.
4. Điền các trường thông tin:
   - **Domain (Tên miền)**: `invoice.yourdomain.com` (Hoặc domain riêng của bạn).
   - **Node.js Version**: Chọn phiên bản Node.js tối thiểu là `v18` hoặc `v20`.
   - **Application Port**: Điền **`3000`** (Đây là cổng mặc định ứng dụng sẽ khởi động).
5. Nhấn **Create** để CloudPanel tự động cấu hình Virtual Host Nginx cho bạn.

### Bước 2: Tải Mã Nguồn Lên VPS & Tạo File Môi Trường .env
Bạn có thể upload mã nguồn thông qua Git (Khuyên dùng) hoặc qua File Manager của CloudPanel.

#### Cách 1: Sử dụng Git để kéo code trực tiếp trên VPS
1. Trở về màn hình quản trị Site của riêng domain vừa tạo.
2. Truy cập tab **SSH/FTP** để lấy thông tin tài khoản SSH hoặc dùng SSH Root của VPS.
3. SSH vào thư mục chứa code của trang web (Thường nằm tại `/home/cloudpanel/htdocs/invoice.yourdomain.com`):
   ```bash
   cd /home/cloudpanel/htdocs/invoice.yourdomain.com
   ```
4. Xóa các file mặc định do CloudPanel khởi tạo:
   ```bash
   rm -rf *
   ```
5. Clone code từ repo GitHub của bạn vào thư mục hiện tại:
   ```bash
   git clone <your-github-repo-url> .
   # Đảm bảo dấu chấm "." ở cuối để clone thẳng vào thư mục hiện tại
   ```

#### Cách 2: Upload trực tiếp qua Trình quản lý File (File Manager)
- Bạn nén toàn bộ thư mục (ngoại trừ thư mục `node_modules` và `.git`) dưới dạng file `.zip`.
- Trong CloudPanel, mở **File Manager** của Website đó, nhấn **Upload** file `.zip` đó lên thư mục gốc.
- Chọn file và bấm giải nén (**Extract**).

#### Thực hiện Cập Nhật Biến Môi Trường:
1. Tạo một file `.env` mới trong thư mục gốc của trang web:
   ```bash
   nano .env
   ```
2. Dán nội dung thông số của bạn vào:
   ```env
   GEMINI_API_KEY="AI_STUDIO_KEY_CUA_BAN"
   APP_URL="https://invoice.yourdomain.com"
   VIETQR_CLIENT_ID=""
   VIETQR_API_KEY=""
   NODE_ENV="production"
   ```
3. Lưu file (Với nano: `Ctrl + O` rồi nhấn `Enter`, sau đó `Ctrl + X` để thoát).

### Bước 3: Cài đặt và Build ứng dụng trên VPS
Hãy chắc chắn rằng bạn đang đứng tại thư mục dự án trên SSH của VPS:

1. **Cập nhật danh sách thư viện**:
   ```bash
   npm install --production=false
   # Chúng ta cần devDependencies (như esbuild, typescript) để build web
   ```

2. **Chạy Build ứng dụng**:
   ```bash
   npm run build
   ```
   Quá trình build hoàn tất sẽ tạo ra thư mục `dist/` chứa mã chạy tối ưu nhất.

### Bước 4: Cấu hình PM2 để quản lý ứng dụng chạy ngầm liên tục
Bởi vì khi tắt SSH thì Node.js Server sẽ dừng hoạt động, bạn cần sử dụng **PM2** (Process Manager) để giữ ứng dụng luôn chạy ngầm và tự động khởi động lại khi VPS restart.

1. **Cài đặt PM2 toàn cục** (nếu VPS chưa có, chạy bằng quyền root/sudo):
   ```bash
   sudo npm install -g pm2
   ```

2. **Chạy ứng dụng bằng PM2** (thực hiện tại thư mục dự án):
   ```bash
   pm2 start dist/server.cjs --name "invoice-portal"
   ```

3. **Cài đặt tự khởi động sau khi VPS reboot**:
   ```bash
   pm2 startup
   # Làm theo hướng dẫn trên màn hình hiển thị (Copy dòng lệnh nó yêu cầu chạy dưới quyền root)
   pm2 save
   ```

4. **Kiểm tra trạng thái**:
   ```bash
   pm2 list
   ```
   Bạn sẽ thấy app `invoice-portal` hiển thị trạng thái `online`.

### Bước 5: Cấu hình SSL (HTTPS) Miễn Phí của Let's Encrypt
1. Truy cập trang quản trị dự án trên giao diện **CloudPanel**.
2. Click vào tab **SSL**.
3. Chọn **Actions** -> Click **New Let's Encrypt Certificate**.
4. Click **Create and Install**. CloudPanel sẽ tự động đăng ký SSL từ Let's Encrypt và gia hạn tự động, chuyển trang web của bạn sang giao thức `https://` bảo mật tuyệt đối.

*Bây giờ bạn truy cập thử `https://invoice.yourdomain.com` để trải nghiệm cổng thông tin hóa đơn mượt mà của riêng mình!*

---

## 🔒 Bản quyền & Giấy phép (License)

Dự án phát hành dưới giấy phép **MIT License**. Bạn hoàn toàn có quyền sử dụng, chỉnh sửa và phân phối cho mục đích cá nhân lẫn thương mại.

---

<a name="english-version"></a>

# 📋 Corporate QR Invoice & Payment Portal (VIETQR & INVOICE PORTAL)

An elegant full-stack platform designed to help Vietnamese businesses store and present official corporate invoicing information (Tax code, official name, billing address) alongside dynamic **VietQR** payment gateways. Customers simply scan one unified QR code to query information, copy billing details in 1-touch, and instant bank-pay.

## ✨ Highlights

- **🔍 Automatic Tax ID Parsing**: Queries official governmental databases dynamically to auto-fill official names and registered addresses.
- **💳 VietQR Quick Pay**: Generates compliant Napas 247 banking QR codes. Clients scan with their favorite banking app without manual account-number entries.
- **🔐 Protected Admin CP**: Modify company branding (logos, brand accents, secondary colors) and manage active recipient Bank Accounts.
- **🎨 Polished Mobile UI**: Rigorously optimized for smartphones, emphasizing font sizing hierarchies so copying billing lines is effortless.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS v4, Motion
- **Backend / Router**: Express.js, TypeScript, Esbuild Bundler (compiling into single-file CJS)
- **Database Integration**: Firebase Firestore & client local compatibility

## 💻 Local Quickstart

```bash
# 1. Clone repository
git clone <your-github-repo-url>
cd <your-repo-folder>

# 2. Install dependencies
npm install

# 3. Environment setups
cp .env.example .env

# 4. Spin developer server
npm run dev

# 5. Production compiles
npm run build
```

## 🖥️ CLOUDPANEL VPS DEPLOYMENT GUIDE

### Step 1: Create a Node.js Site
1. Log in to your CloudPanel admin dashboard.
2. Head to **Sites** -> Click **Add Site** -> Select **Create a Node.js Site**.
3. Assign values:
   - **Domain (Tên miền)**: `invoice.yourdomain.com`
   - **Node.js Version**: `v18` or `v20`
   - **Application Port**: **`3000`**

### Step 2: Upload source directory
- SSH into `/home/cloudpanel/htdocs/invoice.yourdomain.com` and pull/unzip files.
- Duplicate `.env.example` as `.env` and fill in secrets like `GEMINI_API_KEY`.

### Step 3: Server Build
```bash
npm install --production=false
npm run build
```

### Step 4: PM2 Background Engine
```bash
sudo npm install -g pm2
pm2 start dist/server.cjs --name "invoice-portal"
pm2 startup
pm2 save
```

### Step 5: Install SSL (HTTPS)
- Under the CloudPanel Site Dashboard, navigate to the **SSL** tab.
- Click **Actions** -> **New Let's Encrypt Certificate** and execute **Create and Install**.
