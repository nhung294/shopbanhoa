# Bloom Bright Artistry

## CHƯƠNG 1: GIỚI THIỆU TỔNG QUAN

### 1.1. Tổng quan dự án

#### 1.1.1. Giới thiệu cửa hàng

Bloom Bright Artistry là website cửa hàng hoa trực tuyến chuyên cung cấp các bó hoa nghệ thuật, bộ sưu tập theo cảm xúc, đơn đặt hàng theo dịp và dịch vụ subscription hoa định kỳ. Hệ thống được xây dựng theo hướng thương mại điện tử hiện đại, giúp khách hàng dễ dàng khám phá sản phẩm, xem chi tiết, thêm vào giỏ hàng, thanh toán và theo dõi đơn hàng. Bên cạnh đó, hệ thống còn có khu vực quản trị dành cho admin để quản lý sản phẩm, category, đơn hàng, tồn kho và thống kê kinh doanh.

#### 1.1.2. Bối cảnh và sự cần thiết của dự án

Trong bối cảnh người dùng ngày càng ưu tiên mua sắm trực tuyến, các cửa hàng hoa cần một nền tảng số hóa để giới thiệu sản phẩm đẹp hơn, quản lý đơn hàng tập trung hơn và vận hành linh hoạt hơn. Với đặc thù sản phẩm hoa có tính mùa vụ, tính thẩm mỹ cao và thay đổi tồn kho thường xuyên, một website quản lý toàn diện là cần thiết để:

- Tăng khả năng tiếp cận khách hàng.
- Chuẩn hóa quy trình bán hàng và quản trị.
- Giảm sai sót trong theo dõi đơn hàng, tồn kho và subscription.
- Hỗ trợ phát triển thương hiệu và mở rộng kinh doanh.

### 1.2. Quy trình nghiệp vụ

#### 1.2.1. Luồng nghiệp vụ dành cho khách hàng

Khách hàng truy cập website, xem trang chủ, bộ sưu tập, chi tiết sản phẩm và các gói subscription. Sau khi lựa chọn sản phẩm phù hợp, khách hàng có thể thêm vào giỏ hàng, đăng ký tài khoản, đăng nhập, thực hiện checkout và gửi đơn hàng. Sau khi đặt hàng, khách hàng có thể theo dõi trạng thái đơn hàng và quản lý các subscription cá nhân của mình.

#### 1.2.2. Luồng nghiệp vụ dành cho Quản trị viên (Admin)

Admin đăng nhập vào hệ thống và truy cập dashboard quản trị. Tại đây, admin có thể xem tổng quan doanh số, đơn hàng, khách hàng, subscription và tồn kho. Ngoài ra, admin được phép:

- Quản lý sản phẩm.
- Gắn sản phẩm vào category/collection.
- Theo dõi và cập nhật trạng thái đơn hàng.
- Quản lý subscription.
- Cập nhật tồn kho sản phẩm.
- Xem thống kê kinh doanh và chỉ số vận hành.

### 1.3. Phạm vi dự án

#### 1.3.1. Mục tiêu dự án

Mục tiêu của dự án là xây dựng một website cửa hàng hoa hoàn chỉnh, vừa phục vụ bán hàng cho khách hàng, vừa cung cấp công cụ quản trị cho admin. Hệ thống cần đảm bảo giao diện đẹp, dễ sử dụng, dữ liệu được tổ chức rõ ràng và luồng nghiệp vụ đủ để mô phỏng một cửa hàng thực tế.

#### 1.3.2. Phạm vi trong dự án

Dự án bao gồm các nhóm chức năng chính:

- Trang giới thiệu và trưng bày sản phẩm.
- Danh mục bộ sưu tập/categoriy.
- Chi tiết sản phẩm.
- Giỏ hàng và thanh toán.
- Đăng ký, đăng nhập và xác thực người dùng.
- Quản lý đơn hàng cho khách.
- Quản lý subscription cho khách.
- Dashboard admin với thống kê, quản lý sản phẩm, đơn hàng, subscription và tồn kho.

#### 1.3.3. Ngoài phạm vi dự án

Dự án chưa tập trung vào các tính năng nâng cao như:

- Tích hợp thanh toán online thực tế qua cổng thanh toán.
- Đa ngôn ngữ đầy đủ.
- Phân quyền chi tiết nhiều cấp độ hơn admin/user.
- Hệ thống khuyến mãi, mã giảm giá và tích điểm.
- Đồng bộ vận chuyển với đơn vị giao hàng bên thứ ba.

### 1.4. Các yêu cầu của hệ thống

#### 1.4.1. Thành phần của hệ thống

Hệ thống được chia thành 2 phần chính:

- Frontend: giao diện web cho khách hàng và admin.
- Backend: API phục vụ xác thực, quản lý sản phẩm, đơn hàng, subscription, collection và tồn kho.

#### 1.4.2. Yêu cầu chức năng

Hệ thống cần đáp ứng các chức năng chính sau:

- Cho phép khách hàng xem danh sách sản phẩm và bộ sưu tập.
- Cho phép xem chi tiết sản phẩm.
- Cho phép đăng ký, đăng nhập và đăng xuất.
- Cho phép thêm/xóa/cập nhật sản phẩm trong giỏ hàng.
- Cho phép đặt hàng và theo dõi trạng thái đơn hàng.
- Cho phép đăng ký subscription định kỳ.
- Cho phép admin xem dashboard tổng quan.
- Cho phép admin quản lý sản phẩm và gắn sản phẩm vào category/collection.
- Cho phép admin quản lý đơn hàng, subscription và tồn kho.

#### 1.4.3. Yêu cầu phi chức năng

Hệ thống cần đảm bảo:

- Giao diện phản hồi tốt trên cả desktop và thiết bị di động.
- Tốc độ tải trang ổn định.
- Kiến trúc tách biệt rõ giữa frontend và backend.
- Dữ liệu và quy trình nghiệp vụ dễ bảo trì, dễ mở rộng.
- Trải nghiệm người dùng trực quan, nhất quán và dễ thao tác.

#### 1.4.4. Yêu cầu về chất lượng hệ thống

Chất lượng hệ thống được đánh giá theo các tiêu chí:

- Tính đúng đắn: dữ liệu sản phẩm, đơn hàng, subscription được xử lý đúng quy trình.
- Tính ổn định: hệ thống vận hành ổn định trong các luồng chính.
- Tính mở rộng: dễ bổ sung thêm sản phẩm, category và chức năng quản lý.
- Tính bảo mật: có xác thực người dùng và phân quyền admin.
- Tính dễ sử dụng: giao diện rõ ràng, cấu trúc điều hướng trực quan.

### 1.5. Công nghệ sử dụng

#### Frontend

- React 18
- TypeScript
- Vite
- React Router DOM
- TanStack Query
- Tailwind CSS
- shadcn/ui và Radix UI
- Lucide React
- Recharts

#### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- CORS
- express-rate-limit

#### Công cụ phát triển và kiểm thử

- ESLint
- Vitest
- Playwright
- Nodemon

### 1.6. Quy trình nghiệp vụ tổng quan

#### 1.6.1. Luồng nghiệp vụ dành cho khách hàng

1. Khách hàng truy cập trang web.
2. Khám phá trang chủ, bộ sưu tập, sản phẩm và subscription.
3. Xem chi tiết sản phẩm.
4. Thêm sản phẩm vào giỏ hàng.
5. Đăng nhập hoặc đăng ký nếu cần.
6. Thực hiện checkout.
7. Theo dõi trạng thái đơn hàng.
8. Quản lý subscription cá nhân.

#### 1.6.2. Luồng nghiệp vụ dành cho Quản trị viên (Admin)

1. Admin đăng nhập vào hệ thống.
2. Truy cập dashboard quản trị.
3. Xem thống kê tổng quan.
4. Quản lý sản phẩm, category và tồn kho.
5. Theo dõi và xử lý đơn hàng.
6. Quản lý subscription.
7. Kiểm tra số liệu kinh doanh và xu hướng vận hành.

### 1.7. Kết luận chương 1

Chương 1 đã trình bày tổng quan về website cửa hàng hoa Bloom Bright Artistry, bối cảnh triển khai, mục tiêu, phạm vi, các yêu cầu và công nghệ sử dụng. Từ đó có thể thấy hệ thống không chỉ đóng vai trò là một website giới thiệu sản phẩm, mà còn là một nền tảng quản trị bán hàng toàn diện cho cửa hàng hoa.

## CHƯƠNG 2: PHÂN TÍCH THIẾT KẾ HỆ THỐNG WEBSITE CỬA HÀNG

### 2.1. Phân tích hệ thống

#### 2.1.1. Mục đích và phạm vi áp dụng tài liệu

Tài liệu này nhằm mô tả kiến trúc, chức năng, quyền người dùng và các thành phần chính của hệ thống website cửa hàng hoa. Nội dung được dùng làm cơ sở cho việc phát triển, kiểm thử, bảo trì và mở rộng hệ thống.

#### 2.1.2. Phân loại người dùng và đặc điểm quyền hạn

Hệ thống hiện có 2 nhóm người dùng chính:

- Khách hàng: xem sản phẩm, giỏ hàng, đặt hàng, theo dõi đơn hàng, quản lý subscription.
- Quản trị viên (Admin): truy cập dashboard, quản lý sản phẩm, collection/category, đơn hàng, subscription và tồn kho.

#### 2.1.3. Mô tả các yêu cầu chức năng (Use Case)

Các use case chính bao gồm:

- Đăng ký tài khoản.
- Đăng nhập và đăng xuất.
- Xem danh sách sản phẩm.
- Xem chi tiết sản phẩm.
- Lọc sản phẩm theo bộ sưu tập/categoriy.
- Thêm sản phẩm vào giỏ hàng.
- Thanh toán đơn hàng.
- Theo dõi trạng thái đơn hàng.
- Đăng ký subscription.
- Quản lý đơn hàng và subscription của người dùng.
- Quản trị sản phẩm, collection/category, đơn hàng và tồn kho.

#### 2.1.4. Ma trận truy xuất yêu cầu

| Mã yêu cầu | Mô tả | Thành phần thực hiện |
|---|---|---|
| FR-01 | Xem danh sách sản phẩm | Trang Collection, API /api/products |
| FR-02 | Xem chi tiết sản phẩm | Trang ProductDetail, API /api/products/:id |
| FR-03 | Đăng ký/đăng nhập | AuthContext, trang Login/Register, API auth |
| FR-04 | Quản lý giỏ hàng | CartContext, CartPanel |
| FR-05 | Checkout đơn hàng | Trang Checkout, API orders |
| FR-06 | Quản lý subscription | Trang Subscription, trang user/subscriptions |
| FR-07 | Theo dõi đơn hàng | Trang dashboard người dùng |
| FR-08 | Xem dashboard admin | Trang admin/dashboard |
| FR-09 | Quản lý sản phẩm | Trang admin sản phẩm, API /api/products |
| FR-10 | Gắn sản phẩm vào category | ProductForm, model Product.collection |
| FR-11 | Quản lý đơn hàng | Admin orders table, API /api/admin/orders |
| FR-12 | Quản lý tồn kho | Admin inventory table, API /api/admin/inventory |

### 2.2. Phân tích thiết kế hệ thống

#### 2.2.1. Kiến trúc hệ thống (System Architecture)

Hệ thống được thiết kế theo kiến trúc 3 lớp logic:

- Lớp trình bày: giao diện React/Vite.
- Lớp xử lý nghiệp vụ: các hook, context và logic giao tiếp API ở frontend; các route Express ở backend.
- Lớp dữ liệu: MongoDB thông qua Mongoose.

Kiến trúc tổng quát:

1. Trình duyệt người dùng gửi yêu cầu đến giao diện React.
2. Frontend gọi API backend qua HTTP.
3. Backend xác thực, xử lý nghiệp vụ và truy vấn MongoDB.
4. Kết quả trả về frontend để hiển thị theo trạng thái tương ứng.

#### 2.2.2. Tổng quan các Use Case

##### Nhóm use case cho khách hàng

- Đăng ký tài khoản.
- Đăng nhập hệ thống.
- Xem bộ sưu tập sản phẩm.
- Lọc sản phẩm theo mood, mùa, collection.
- Xem chi tiết và thêm sản phẩm vào giỏ hàng.
- Thanh toán và theo dõi đơn hàng.
- Quản lý subscription cá nhân.

##### Nhóm use case cho admin

- Đăng nhập với quyền admin.
- Xem thống kê doanh thu, khách hàng, subscription và tồn kho.
- Quản lý sản phẩm.
- Gắn sản phẩm vào collection/category.
- Quản lý đơn hàng.
- Quản lý subscription.
- Quản lý tồn kho.

#### 2.2.3. Ma trận truy xuất yêu cầu (Requirements Traceability Matrix)

| Use Case | Frontend | Backend | Dữ liệu liên quan |
|---|---|---|---|
| Đăng nhập | Login, AuthContext | /api/auth | User |
| Đăng ký | Register | /api/auth | User |
| Xem sản phẩm | Collection, ProductDetail | /api/products | Product, Collection |
| Quản lý giỏ hàng | CartContext, CartPanel | - | State frontend |
| Tạo đơn hàng | Checkout | /api/orders | Order |
| Theo dõi đơn hàng | OrderTracking | /api/orders, /api/users | Order, User |
| Subscription | Subscription, user/subscriptions | /api/subscriptions | Subscription |
| Dashboard admin | admin/Dashboard | /api/admin/stats | Product, Order, Subscription, User |
| Quản lý sản phẩm | admin/ProductManagement | /api/products | Product |
| Quản lý collection/category | admin/ProductForm, /api/collections | /api/collections | Collection |
| Quản lý tồn kho | admin/InventoryTable | /api/admin/inventory | Product |

### Kết luận chung

Bloom Bright Artistry là một hệ thống website cửa hàng hoa hoàn chỉnh, đáp ứng đầy đủ các nhu cầu cơ bản của mô hình bán hàng trực tuyến và quản trị nội bộ. Dự án thể hiện rõ cách tổ chức dữ liệu, phân tách frontend/backend, quản lý danh mục sản phẩm theo collection và xây dựng quy trình nghiệp vụ cho cả khách hàng lẫn admin.
