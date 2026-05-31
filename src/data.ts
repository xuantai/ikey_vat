import { BankConfig } from "./types";

export const VIETNAMESE_BANKS: BankConfig[] = [
  {
    id: "vcb",
    name: "Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)",
    shortName: "Vietcombank",
    logo: "https://img.vietqr.io/image/vcb-logo.png"
  },
  {
    id: "mbbank",
    name: "Ngân hàng TMCP Quân Đội (MB)",
    shortName: "MB",
    logo: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgODAwIDE3MCI+CjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6I0VGMDAzMjt9Cjwvc3R5bGU+CjxnIGlkPSJnODg0Ij4KCTxnIGlkPSJnOTEwIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg1Ny4xMTMzLDcwNi45MDQpIj4KCQk8cGF0aCBpZD0icGF0aDkxMiIgY2xhc3M9InN0MCIgZD0iTTEyOC41LTY2NS40aC0xMy4zYy01LjMsMC05LjYsNC4zLTkuNiw5LjZ2OTguM2MwLDUuMyw0LjMsOS42LDkuNiw5LjZoMTMuMwoJCQljNS4zLDAsOS42LTQuMyw5LjYtOS42di05OC4zQzEzOC02NjEuMiwxMzMuOC02NjUuNCwxMjguNS02NjUuNCIvPgoJPC9nPgoJPGcgaWQ9Imc5MTQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUxLjAzMjIsNzA2LjkwNCkiPgoJCTxwYXRoIGlkPSJwYXRoOTE2IiBjbGFzcz0ic3QwIiBkPSJNODYuOS02NjUuNGMtOC40LDAtMTUuNCw1LTE4LjgsMTIuMmwtMzUuMiw3NC45Yy0wLjgsMS44LTIuNSw0LjYtMy45LDQuNgoJCQljLTEuNCwwLTMuMS0yLjktMy45LTQuNmwtMzUuNS03NC45Yy0zLjQtNy4yLTEwLjQtMTIuMi0xOC44LTEyLjJoLTIwLjVMNi4yLTU1Ny4yYzUuNSwxMC43LDE2LjksMTAuNCwyMi43LDEwLjQKCQkJYzgsMCwxNy40LTAuNCwyMi40LTEwLjRsNTUuOS0xMDguM0g4Ni45eiIvPgoJPC9nPgoJPGcgaWQ9Imc5MTgiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEyOS44MTMsNzA5LjIpIj4KCQk8cGF0aCBpZD0icGF0aDkyMCIgY2xhc3M9InN0MCIgZD0iTTYyNi4xLTY4NS43YzAtNS4zLTQuMy05LjYtOS42LTkuNmgtMTMuM2MtNS4zLDAtOS42LDQuMy05LjYsOS42djk3LjEKCQkJYzAsMTQuOCw1LjMsMjMuNSwxNC43LDI5LjdjOS4xLDYsMTkuNyw4LjYsMzkuMyw4LjZoMTAuN2M1LjMsMCw5LjUtNC4zLDkuNS05LjZ2LTEwLjRoLThjLTUuOCwwLTE4LTAuMi0yNS4yLTUuMQoJCQljLTkuNC02LjItOC42LTE3LjMtOC42LTI1LjNWLTY4NS43eiIvPgoJPC9nPgoJPGcgaWQ9Imc5MjIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMy4zNyw2OTQuNDgxKSI+CgkJPHBhdGggaWQ9InBhdGg5MjQiIGNsYXNzPSJzdDAiIGQ9Ik00NDUuMS01NTUuNmMtNS44LDAtMTgtMC4yLTI1LjItNS4xYy05LjQtNi4yLTguNi0xNy4zLTguNi0yNS4zdi00Ny4yaDMxLjQKCQkJYzUuMywwLDkuNi00LjMsOS42LTkuNlYtNjUzaC00MXYtMThjMC01LjMtNC4zLTkuNi05LjYtOS42aC0xMy4zYy01LjMsMC05LjYsNC4zLTkuNiw5LjZ2MThoLTY3LjZ2LTE4YzAtNS4zLTQuMy05LjYtOS42LTkuNgoJCQloLTEzLjNjLTUuMywwLTkuNiw0LjMtOS42LDkuNnYxOGgtMjAuMnYxMC40YzAsNS4zLDQuMyw5LjYsOS42LDkuNmgxMC42djU5LjFjMCwxNC44LDUuMywyMy41LDE0LjcsMjkuN2M5LjEsNiwxOS43LDguNiwzOS4zLDguNgoJCQloMTAuN2M1LjMsMCw5LjUtNC4zLDkuNS05LjZ2LTEwLjRoLThjLTUuOCwwLTE4LTAuMi0yNS4yLTUuMWMtOS40LTYuMi04LjYtMTcuMy04LjYtMjUuM3YtNDcuMmg2Ny42djU5LjEKCQkJYzAsMTQuOCw1LjMsMjMuNSwxNC43LDI5LjdjOS4xLDYsMTkuNiw4LjYsMzkuMyw4LjZoMTAuNmM1LjMsMCw5LjYtNC4zLDkuNi05LjZ2LTEwLjRINDQ1LjF6Ii8+Cgk8L2c+Cgk8ZyBpZD0iZzkyNiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzQuNDMwNyw3MDEuNzM5KSI+CgkJPHBhdGggaWQ9InBhdGg5MjgiIGNsYXNzPSJzdDAiIGQ9Ik0yNDctNjE5LjhjMCwzLjEtMC44LDYuOS03LjIsNi45aC00Ni4xYy0xMS43LDAtMjEuMiw1LjMtMjEuMiwxMnYtMTJjMC4zLTcuOCwwLTE0LjIsNi43LTIwLjIKCQkJYzguOC04LDIyLjEtNy44LDMwLjctNy44YzkuMSwwLDE5LjYsMC40LDI3LjcsNS4zQzI0Mi4zLTYzMi42LDI0Ny02MjcuMSwyNDctNjE5LjggTTI3NS44LTU1Mi40di0xMC40aC03MS43CgkJCWMtMTEuOSwwLTI1LjUtMS4zLTI5LjYtMTMuOWMtMS4xLTMuNi0xLjktMTEuMS0xLjktMTYuMmg4NS4zYzUuOCwwLDExLjQtMC45LDE1LjgtNC40YzYuMS00LjgsNi45LTExLjcsNi45LTE3LjcKCQkJYzAtMTQuOC0zLjYtMjkuNC0yMC44LTM4LjFjLTEzLjUtNi45LTMxLjMtNy41LTQ4LjQtNy41Yy0xMy44LDAtMzguOCwwLTU0LjgsMTEuMWMtMTYuMSwxMS4xLTE3LjUsMjcuMy0xNy41LDQ5LjIKCQkJYzAsMTUuNSwwLjgsMzEuNywxMC41LDQyLjdjMTIuMiwxMy43LDI5LjksMTQuOSw0NC44LDE0LjloNzEuOUMyNzEuNS01NDIuOSwyNzUuOC01NDcuMiwyNzUuOC01NTIuNCIvPgoJPC9nPgoJPGcgaWQ9Imc5MzAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDExOS4wNzcsNzAxLjczOSkiPgoJCTxwYXRoIGlkPSJwYXRoOTMyIiBjbGFzcz0ic3QwIiBkPSJNNTUyLjYtNjE5LjhjMCwzLjEtMC44LDYuOS03LjIsNi45aC00Ni4xYy0xMS43LDAtMjEuMiw1LjMtMjEuMiwxMnYtMTIKCQkJYzAuMy03LjgsMC0xNC4yLDYuNi0yMC4yYzguOC04LDIyLjItNy44LDMwLjctNy44YzkuMiwwLDE5LjcsMC40LDI3LjcsNS4zQzU0Ny45LTYzMi42LDU1Mi42LTYyNy4xLDU1Mi42LTYxOS44IE01ODEuNC01NTIuNAoJCQl2LTEwLjRoLTcxLjdjLTExLjksMC0yNS41LTEuMy0yOS42LTEzLjljLTEuMS0zLjYtMS45LTExLjEtMS45LTE2LjJoODUuM2M1LjgsMCwxMS40LTAuOSwxNS44LTQuNGM2LjEtNC44LDYuOS0xMS43LDYuOS0xNy43CgkJCWMwLTE0LjgtMy42LTI5LjQtMjAuOC0zOC4xYy0xMy42LTYuOS0zMS4zLTcuNS00OC41LTcuNWMtMTMuOCwwLTM4LjgsMC01NC44LDExLjFjLTE2LDExLjEtMTcuNCwyNy4zLTE3LjQsNDkuMgoJCQljMCwxNS41LDAuOCwzMS43LDEwLjUsNDIuN2MxMi4yLDEzLjcsMjkuOSwxNC45LDQ0LjksMTQuOWg3MS45QzU3Ny4xLTU0Mi45LDU4MS40LTU0Ny4yLDU4MS40LTU1Mi40Ii8+Cgk8L2c+Cgk8ZyBpZD0iZzkzNCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTcuMTEzMyw3MTEuMDkyKSI+CgkJPHBhdGggaWQ9InBhdGg5MzYiIGNsYXNzPSJzdDAiIGQ9Ik0xMjguNS03MDIuNWgtMTMuM2MtNS4zLDAtOS42LDQuMy05LjYsOS41djIuNnYyMC43aDAuMWMwLjktNS40LDcuMS0xMS4xLDE2LjEtMTEuMWg2LjYKCQkJYzUuMywwLDkuNi00LjMsOS42LTkuNnYtMi42QzEzOC02OTguMiwxMzMuOC03MDIuNSwxMjguNS03MDIuNSIvPgoJPC9nPgo8L2c+Cjwvc3ZnPgo="
  },
  {
    id: "tcb",
    name: "Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)",
    shortName: "Techcombank",
    logo: "https://img.vietqr.io/image/tcb-logo.png"
  },
  {
    id: "icb",
    name: "Ngân hàng TMCP Công Thương Việt Nam (VietinBank)",
    shortName: "VietinBank",
    logo: "https://img.vietqr.io/image/icb-logo.png"
  },
  {
    id: "bidv",
    name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)",
    shortName: "BIDV",
    logo: "https://img.vietqr.io/image/bidv-logo.png"
  },
  {
    id: "acb",
    name: "Ngân hàng TMCP Á Châu (ACB)",
    shortName: "ACB",
    logo: "https://img.vietqr.io/image/acb-logo.png"
  },
  {
    id: "vpb",
    name: "Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)",
    shortName: "VPBank",
    logo: "https://img.vietqr.io/image/vpb-logo.png"
  },
  {
    id: "tpb",
    name: "Ngân hàng TMCP Tiên Phong (TPBank)",
    shortName: "TPBank",
    logo: "https://img.vietqr.io/image/tpb-logo.png"
  },
  {
    id: "vtb",
    name: "Ngân hàng Nông nghiệp & Phát triển Nông thôn (Agribank)",
    shortName: "Agribank",
    logo: "https://img.vietqr.io/image/agribank-logo.png"
  },
  {
    id: "stb",
    name: "Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)",
    shortName: "Sacombank",
    logo: "https://img.vietqr.io/image/stb-logo.png"
  },
  {
    id: "vib",
    name: "Ngân hàng TMCP Quốc tế Việt Nam (VIB)",
    shortName: "VIB",
    logo: "https://img.vietqr.io/image/vib-logo.png"
  },
  {
    id: "hdb",
    name: "Ngân hàng TMCP Phát triển TP.HCM (HDBank)",
    shortName: "HDBank",
    logo: "https://img.vietqr.io/image/hdb-logo.png"
  },
  {
    id: "msb",
    name: "Ngân hàng TMCP Hàng Hải Việt Nam (MSB)",
    shortName: "MSB",
    logo: "https://img.vietqr.io/image/msb-logo.png"
  },
  {
    id: "shb",
    name: "Ngân hàng TMCP Sài Gòn - Hà Nội (SHB)",
    shortName: "SHB",
    logo: "https://img.vietqr.io/image/shb-logo.png"
  },
  {
    id: "shn",
    name: "Ngân hàng Shinhan Việt Nam (Shinhan Bank)",
    shortName: "Shinhan Bank",
    logo: "https://img.vietqr.io/image/shinhan-logo.png"
  }
];

export const PRESET_COLORS = [
  { name: "Emerald Green", value: "#10B981" },
  { name: "Royal Blue", value: "#3B82F6" },
  { name: "Indigo Purple", value: "#6366F1" },
  { name: "Cherry Red", value: "#EF4444" },
  { name: "Orange Sunset", value: "#F97316" },
  { name: "Luxury Slate", value: "#475569" },
  { name: "Sophisticated Black", value: "#1E293B" }
];

export const SAMPLE_COMPANY = {
  username: "cong-ty-ban",
  companyName: "TẬP ĐOÀN CÔNG NGHIỆP - VIỄN THÔNG QUÂN ĐỘI",
  taxCode: "0100109106",
  address: "Số 1 Trần Hữu Dực, Phường Mỹ Đình 2, Nam Từ Liêm, Thành phố Hà Nội",
  email: "hoadon@viettel.com.vn",
  phone: "02462556789",
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Viettel_logo_2021.svg",
  bankName: "mbbank",
  bankAccount: "1900109106",
  bankOwner: "TẬP ĐOÀN CÔNG NGHIỆP VIỄN THÔNG QUÂN ĐỘI",
  primaryColor: "#EF4444",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
