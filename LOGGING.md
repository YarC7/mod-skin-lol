# Logging System

Ứng dụng sử dụng `electron-log` để ghi lại tất cả các hoạt động quan trọng.

## Vị trí file log

File log được lưu tại:
- **Windows**: `%USERPROFILE%\AppData\Roaming\mod-skin-lol\logs\main.log`
- **Đường dẫn đầy đủ**: `C:\Users\<YourUsername>\AppData\Roaming\mod-skin-lol\logs\main.log`

## Cách mở file log

### Cách 1: Từ trong ứng dụng (Tính năng sắp có)
1. Mở Settings panel
2. Click nút "Open Log File"

### Cách 2: Thủ công
1. Nhấn `Win + R`
2. Gõ: `%APPDATA%\mod-skin-lol\logs`
3. Mở file `main.log`

## Log levels

- **INFO**: Thông tin hoạt động bình thường
- **WARN**: Cảnh báo (không ảnh hưởng hoạt động)
- **ERROR**: Lỗi nghiêm trọng

## Ví dụ log

```
[2026-02-01 10:00:00.000] [info] App starting...
[2026-02-01 10:00:01.123] [info] App ready, registering IPC handlers...
[2026-02-01 10:00:01.456] [info] Creating main window...
[2026-02-01 10:00:02.789] [info] Main window created successfully
[2026-02-01 10:05:30.123] [info] Successfully applied skin and started manager: K/DA ALL OUT
```

## Kích thước file

- File log tối đa: **5MB**
- Khi đạt giới hạn, file cũ sẽ được lưu thành `main.old.log`
- File mới sẽ được tạo tự động

## Debug

Nếu gặp lỗi khi sử dụng app:
1. Mở file log
2. Tìm các dòng có `[error]`
3. Share log khi báo lỗi cho developer
