# 🎮 CS-LOL Launcher

Một ứng dụng desktop hiện đại giúp quản lý và tự động hóa việc cài đặt Mod Skin cho Liên Minh Huyền Thoại, tích hợp mượt mà với CS-LOL Manager.

![CS-LOL Launcher Preview](https://raw.githubusercontent.com/YarC7/mod-skin-lol/main/preview.png) *(Gợi ý: Thêm ảnh chụp màn hình ứng dụng tại đây)*

## ✨ Tính năng nổi bật

- **Tự động hóa hoàn toàn:** Tự động hóa các bước Import, Patch (MkOverlay) và Chạy Mod chỉ với một cú nhấp chuột.
- **Dữ liệu Song ngữ:** Hiển thị tên tướng và trang phục bằng tiếng Việt, đồng thời quản lý dữ liệu gốc bằng tiếng Anh để đảm bảo độ chính xác.
- **Tìm kiếm thông minh:** Ô tìm kiếm hỗ trợ cả tiếng Anh và tiếng Việt.
- **Tự động nhận diện Mod:** Tự động tìm kiếm file mod tương ứng trong thư mục repository dựa trên tên và chỉ số trang phục.
- **Quản lý linh hoạt:** Dễ dàng thay đổi đường dẫn CS-LOL Manager và kho lưu trữ mod trong phần Cài đặt.
- **Giao diện hiện đại:** Được xây dựng bằng Electron, mang lại trải nghiệm mượt mà và trực quan.

## 🚀 Cài đặt nhanh

1. Tải bản phân phối mới nhất từ [Releases](https://github.com/YarC7/mod-skin-lol/releases).
2. Cài đặt và mở ứng dụng.
3. Vào mục **⚙️ Settings**:
   - Chọn đường dẫn đến thư mục chứa **CS-LOL Manager**.
   - Chọn đường dẫn đến thư mục **lol-skins** (Kho lưu trữ file mod).
4. Chọn tướng, chọn trang phục và nhấn **Apply**!

## 🛠️ Công nghệ sử dụng

- **Framework:** Electron & React (hoặc Vanilla JS tùy phiên bản)
- **Công cụ:** Webpack, TypeScript
- **Tích hợp:** CS-LOL Manager CLI (mod-tools.exe)
- **Dữ liệu:** Riot Games Data Dragon (DDragon)

## 📂 Cấu trúc Mod yêu cầu

Để tính năng tự động tìm kiếm hoạt động tốt nhất, thư mục mod nên được tổ chức như sau:
`[Skins Repository]/skins/[ChampionID]/[SkinName].zip`
Hoặc ứng dụng sẽ tự động gợi ý danh sách các file có sẵn nếu không tìm thấy kết quả khớp hoàn toàn.

## 🤝 Đóng góp

Dự án này được phát triển nhằm mục đích học tập và chia sẻ đam mê. Mọi đóng góp (Pull Request) hoặc báo lỗi (Issue) đều được chào đón!

## ⚖️ Tuyên bố miễn trừ trách nhiệm

Ứng dụng này không được liên kết hoặc ủy quyền bởi Riot Games. Việc sử dụng mod skin có thể tiềm ẩn rủi ro về tài khoản tùy theo chính sách của nhà phát hành. Chúng tôi không chịu trách nhiệm cho bất kỳ vấn đề nào phát sinh từ việc sử dụng công cụ này.

---
*Phát triển bởi [YarC7](https://github.com/YarC7)*
