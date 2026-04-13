+++
title = 'Semantic_checking'
date = 2026-04-13T17:29:34+07:00
description = ""
image = ""
categories = ["general"]
authors = ["tung09hcm"]
avatar = ["/images/hecker.jpg"]
+++

# TyC Programming Language - Ràng Buộc Ngữ Nghĩa và Các Loại Lỗi

**Tài liệu Tham Chiếu Phân Tích Ngữ Nghĩa Tĩnh**
**Phiên bản 1.0 - Tháng 1 năm 2026**

---

## Tổng Quan

Tài liệu này cung cấp tài liệu tham chiếu đầy đủ cho tất cả các ràng buộc ngữ nghĩa và loại lỗi mà bộ phân tích ngữ nghĩa tĩnh của TyC phải kiểm tra. TyC là ngôn ngữ lập trình thủ tục với khả năng suy luận kiểu hoàn chỉnh, kiểu struct, và kiểm tra kiểu nghiêm ngặt — mỗi toán tử có yêu cầu kiểu được định nghĩa rõ ràng.

---

## Tóm Tắt Các Loại Lỗi

Bộ kiểm tra ngữ nghĩa tĩnh của TyC phải phát hiện và báo cáo các loại lỗi sau:

1. **Redeclared** — Biến, hàm, struct, tham số, hoặc thành viên struct được khai báo nhiều lần (hoặc một biến cục bộ dùng lại tên tham số trong cùng hàm)
2. **UndeclaredIdentifier** — Sử dụng biến hoặc tham số chưa được khai báo
3. **UndeclaredFunction** — Gọi hàm chưa được khai báo
4. **UndeclaredStruct** — Sử dụng kiểu struct chưa được khai báo
5. **TypeCannotBeInferred** — `auto` không có kiểu xác định được; thông báo lỗi là `TypeCannotBeInferred(<ctx>)` trong đó `<ctx>` là một AST node (`str` theo `src/utils/nodes.py`)
6. **TypeMismatchInStatement** — Không tương thích kiểu trong câu lệnh (if, while, for, return, phép gán)
7. **TypeMismatchInExpression** — Không tương thích kiểu trong biểu thức (toán tử, lời gọi hàm, truy cập thành viên, struct literal so với kiểu struct kỳ vọng)
8. **MustInLoop** — Câu lệnh break/continue nằm ngoài vòng lặp

---

## Đặc Tả Chi Tiết Từng Lỗi

### 1. Redeclared (Khai Báo Lại)

**Quy tắc:** Tất cả các khai báo phải là duy nhất trong phạm vi tương ứng theo đặc tả TyC.

**Ngoại lệ:** `Redeclared(<kind>, <identifier>)`

- `<kind>`: Loại thực thể bị khai báo lại (`Variable`, `Function`, `Struct`, `Parameter`, `Member`)
- `<identifier>`: Tên của định danh bị khai báo lại

**Quy tắc theo phạm vi:**

- **Global scope:** Tên struct phải duy nhất trong tất cả các khai báo struct, tên hàm phải duy nhất trong tất cả các khai báo hàm (không có overloading). **Tên kiểu struct và tên hàm dùng namespace riêng biệt:** cùng một định danh có thể đặt tên cho cả struct lẫn hàm (ví dụ: `struct foo { ... };` và `int foo(int x, int y) { ... }` đều hợp lệ). Ngữ cảnh phân biệt — vị trí kiểu trong khai báo so với `(` trong lời gọi.
- **Function scope:** Các tham số thuộc phạm vi của hàm và hiển thị trong toàn bộ thân hàm. Tên tham số phải duy nhất trong cùng danh sách tham số. **Không được khai báo biến cục bộ trùng tên với tham số ở bất kỳ đâu trong thân hàm**, kể cả trong các khối `{ }` lồng nhau; điều này được báo là `Redeclared(Variable, <name>)` (không phải shadowing). TyC không cho phép các khối bên trong che khuất tham số của hàm bao ngoài.
- **Local scope (block):** Biến phải có tên duy nhất trong cùng một khối.
- **Shadowing:** Biến trong các khối lồng nhau có thể che khuất **biến cục bộ khác** từ các khối bên ngoài trong cùng hàm, với điều kiện tuân theo quy tắc trên (tham số không thể bị che khuất).

**Ví dụ:**

```tyc
// Lỗi: Redeclared Struct trong global scope
struct Point {
    int x;
    int y;
};
struct Point {  // Redeclared(Struct, Point)
    int z;
};

// Lỗi: Redeclared Function trong global scope
int add(int x, int y) {
    return x + y;
}
int add(int a, int b) {  // Redeclared(Function, add) - không có function overloading
    return a + b;
}

// Hợp lệ: cùng định danh cho struct và hàm (namespace global riêng biệt)
struct foo {
    int x;
    int y;
};
int foo(int x, int y) {  // Không phải Redeclared: struct foo và function foo là khác nhau
    return x + y;
}

// Lỗi: Redeclared Variable trong cùng khối
void main() {
    int count = 10;
    int count = 20;  // Redeclared(Variable, count)
}

// Lỗi: Redeclared Parameter
int calculate(int x, float y, int x) {  // Redeclared(Parameter, x)
    return x + y;
}

// Lỗi: Biến cục bộ dùng lại tên tham số (cùng hàm; không cho phép kể cả trong khối lồng nhau)
void func(int x) {
    int x = 10;  // Redeclared(Variable, x)
}

// Lỗi: Tên thành viên struct trùng nhau trong cùng một struct
struct Point {
    int x;
    int x;  // Redeclared(Member, x)
};

// Hợp lệ: Shadowing ở các phạm vi khác nhau
void example() {
    int value = 100;  // Biến hàm

    {
        int value = 200;  // Hợp lệ: che khuất biến hàm
        {
            int value = 300;  // Hợp lệ: che khuất biến khối
        }
    }
}

// Hợp lệ: Các phạm vi khác nhau (không có xung đột shadowing)
void test() {
    int x = 10;
    {
        int y = 20;  // Hợp lệ: tên biến khác nhau
    }
    int y = 30;  // Hợp lệ: y ở phạm vi ngoài không xung đột với y ở khối trong
}
```

---

### 2. UndeclaredIdentifier (Định Danh Chưa Khai Báo)

**Quy tắc:** Tất cả biến và tham số phải được khai báo trước khi sử dụng.

**Ngoại lệ:** `UndeclaredIdentifier(<identifier>)`

**Quy tắc giải quyết định danh:**

- Định danh được tra cứu từ phạm vi trong cùng ra ngoài
- Biến phải được khai báo trước khi sử dụng trong cùng phạm vi hoặc phạm vi bao ngoài
- Phần khởi tạo của biến được kiểm tra mà không có biến đó trong phạm vi (xem **`tyc_specification.md` § Scope Rules**)
- Tham số hiển thị trong toàn bộ thân hàm
- TyC không hỗ trợ biến global (chỉ có khai báo hàm và struct ở cấp global)

**Ví dụ:**

```tyc
// Lỗi: Biến chưa khai báo
void example() {
    int result = undeclaredVar + 10;  // UndeclaredIdentifier(undeclaredVar)
}

// Lỗi: Dùng biến trước khi khai báo trong cùng phạm vi
void test() {
    int x = y + 5;  // UndeclaredIdentifier(y) - y dùng trước khi khai báo
    int y = 10;
}

// Lỗi: Truy cập ngoài phạm vi
void method1() {
    int localVar = 42;
}

void method2() {
    int value = localVar + 1;  // UndeclaredIdentifier(localVar) - phạm vi hàm khác
}

// Hợp lệ: Thứ tự khai báo đúng
void valid() {
    int x = 10;
    int y = x + 5;  // Hợp lệ: x đã được khai báo trước
}

// Hợp lệ: Tham số hiển thị trong toàn hàm
int calculate(int x, int y) {
    int result = x + y;  // Hợp lệ: tham số x và y hiển thị
    return result;
}

// Hợp lệ: Biến trong phạm vi bao ngoài
void nested() {
    int outer = 10;
    {
        int inner = outer + 5;  // Hợp lệ: outer ở phạm vi bao ngoài
    }
}
```

---

### 3. UndeclaredFunction (Hàm Chưa Khai Báo)

**Quy tắc:** Tất cả các hàm phải được khai báo trước khi sử dụng.

**Ngoại lệ:** `UndeclaredFunction(<function-name>)`

**Quy tắc khai báo hàm:**

- Hàm có global scope
- Hàm có thể được gọi từ bất kỳ đâu sau khi khai báo
- Tên hàm phải duy nhất trong các hàm (không có function overloading); tên hàm có thể trùng với tên kiểu struct
- Các hàm built-in (`readInt`, `readFloat`, `readString`, `printInt`, `printFloat`, `printString`) được khai báo ngầm định

**Ví dụ:**

```tyc
// Lỗi: Hàm chưa khai báo
void main() {
    int result = calculate(5, 3);  // UndeclaredFunction(calculate)
}

// Lỗi: Hàm được gọi trước khi khai báo
void test() {
    int value = add(10, 20);  // UndeclaredFunction(add) - nếu add được khai báo sau
}

int add(int x, int y) {
    return x + y;
}

// Hợp lệ: Hàm khai báo trước khi dùng
int multiply(int x, int y) {
    return x * y;
}

void main() {
    int result = multiply(5, 3);  // Hợp lệ: multiply đã được khai báo trước
}

// Hợp lệ: Hàm built-in
void example() {
    int x = readInt();        // Hợp lệ: hàm built-in
    printInt(x);              // Hợp lệ: hàm built-in
    float y = readFloat();    // Hợp lệ: hàm built-in
    string s = readString();  // Hợp lệ: hàm built-in
}
```

---

### 4. UndeclaredStruct (Struct Chưa Khai Báo)

**Quy tắc:** Tất cả các kiểu struct phải được khai báo trước khi sử dụng.

**Ngoại lệ:** `UndeclaredStruct(<struct-name>)`

**Quy tắc khai báo struct:**

- Struct có global scope
- Kiểu struct có thể được dùng trong toàn chương trình sau khi khai báo
- Tên struct phải duy nhất trong các kiểu struct (có thể trùng tên hàm — namespace riêng biệt)
- Thành viên struct không dùng được `auto` — chỉ cho phép kiểu tường minh
- Kiểu của thành viên không được là struct đang được khai báo (xem **`tyc_specification.md` § Struct Type**)

**Ví dụ:**

```tyc
// Lỗi: Struct chưa khai báo
void main() {
    Point p;  // UndeclaredStruct(Point)
}

struct Point {
    int x;
    int y;
};

// Lỗi: Dùng kiểu struct trước khi khai báo
void test() {
    Person person;  // UndeclaredStruct(Person) - nếu Person khai báo sau
}

struct Person {
    string name;
    int age;
};

// Lỗi: Thành viên struct dùng kiểu struct chưa khai báo
struct Address {
    string street;
    City city;  // UndeclaredStruct(City) - nếu City khai báo sau
};

struct City {
    string name;
};

// Hợp lệ: Struct khai báo trước khi dùng
struct Point {
    int x;
    int y;
};

void main() {
    Point p1;           // Hợp lệ: Point đã khai báo trước
    Point p2 = {10, 20}; // Hợp lệ: Point đã khai báo trước
}

// Hợp lệ: Thành viên struct dùng kiểu struct đã khai báo trước
struct Point {
    int x;
    int y;
};

struct Address {
    string street;
    Point location;  // Hợp lệ: Point đã khai báo trước
};
```

---

### 5. TypeCannotBeInferred (Không Thể Suy Luận Kiểu)

**Quy tắc:** Mọi binding `auto` phải lấy được kiểu xác định từ phần khởi tạo hoặc từ lần sử dụng sau đó.

**Ngoại lệ:** `TypeCannotBeInferred(<ctx>)` — `<ctx>` là AST node mà bộ kiểm tra gắn vào trường hợp chưa giải quyết đầu tiên (định dạng `__str__` trong `src/utils/nodes.py`). Trong thực tế, đây là biểu thức hoặc câu lệnh đang kiểm tra (ví dụ: một binary op, một phép gán, một block sau các biến cục bộ, một `return`), không phải tên biến thuần túy.

**Suy luận:** Có khởi tạo → từ biểu thức khởi tạo; không có khởi tạo → từ lần sử dụng đầu tiên có thể xác định kiểu. Nếu không được → lỗi này.

**Báo cáo:** Một lỗi ngữ nghĩa mỗi lần chạy. Trong số các lỗi `TypeCannotBeInferred`, lỗi đầu tiên gặp trong quá trình duyệt ngữ nghĩa được báo cáo. Thứ tự toàn chương trình (lỗi đầu tiên theo duyệt, không sắp xếp toàn cục theo tier lỗi) được định nghĩa trong **Error Detection Priority** ở phần Implementation Guidelines. Các đoạn code dưới đây là các ví dụ minh họa riêng biệt, không phải một chương trình duy nhất.

```tyc
// Lỗi: cả hai auto chưa có kiểu — không thể dùng x + y
void example() {
    auto x;
    auto y;
    auto result = x + y;  // TypeCannotBeInferred(BinaryOp(Identifier(x), +, Identifier(y)))
}

// Lỗi: cả hai vế chưa biết kiểu — phép gán không thể xác định kiểu
void test() {
    auto x;
    auto y;
    x = y;  // TypeCannotBeInferred(AssignExpr(Identifier(x) = Identifier(y)))
}

// Lỗi: phụ thuộc vòng tròn — không có literal, tham số, hay toán hạng có kiểu đã biết nào để neo kiểu
void circular() {
    auto a;
    auto b;
    a = b;  // TypeCannotBeInferred(AssignExpr(Identifier(a) = Identifier(b)))
}

// Lỗi: cả hai auto chưa biết kiểu — biến nhận kiểu int không giải quyết được kiểu toán hạng:
// toán tử quan hệ trả về int cho bất kỳ cặp toán hạng số nào hợp lệ, nên kiểu ngoài ít giúp ích (Rule 2.2.1).
void compare_autos() {
    auto x;
    auto y;
    int result = x < y;  // TypeCannotBeInferred(BinaryOp(Identifier(x), <, Identifier(y)))
}

// Lỗi: kiểu khai báo của c chỉ kiểm tra toàn bộ biểu thức khởi tạo; nó không suy luận kiểu a / b bên trong a * b (Rule 2.2.1).
void mixed_decl() {
    auto a;
    auto b;
    int c = a * b;  // TypeCannotBeInferred(BinaryOp(Identifier(a), *, Identifier(b)))
}

// Lỗi: auto x vẫn chưa biết kiểu khi kiểm tra x + "hello"
void string_mix() {
    auto x;
    auto y;
    auto result = x + "hello";  // TypeCannotBeInferred(BinaryOp(Identifier(x), +, StringLiteral('hello')))
}

// Lỗi: auto không bao giờ được sử dụng — báo khi kết thúc khối (không phải tại dòng VarDecl)
void unused_auto() {
    auto x;
}  // TypeCannotBeInferred(BlockStmt([VarDecl(auto, x)]))

// Lỗi: return dùng auto vẫn chưa có kiểu (hàm có return type suy luận; cần void main() trong chương trình đầy đủ)
func() {
    auto x;
    return x;  // TypeCannotBeInferred(ReturnStmt(return Identifier(x)))
}
void main() {}

// Hợp lệ: auto có khởi tạo
void valid1() {
    auto x = 10;         // Hợp lệ: kiểu suy luận là int từ literal
    auto y = 3.14;       // Hợp lệ: kiểu suy luận là float từ literal
    auto msg = "hello";  // Hợp lệ: kiểu suy luận là string từ literal
}

// Hợp lệ: auto không có khởi tạo — kiểu suy luận từ lần gán đầu tiên
void valid2() {
    auto a;
    a = 10;        // Hợp lệ: kiểu suy luận là int từ lần gán (dùng đầu tiên)

    auto b;
    b = 3.14;      // Hợp lệ: kiểu suy luận là float từ lần gán (dùng đầu tiên)
}

// Hợp lệ: auto không có khởi tạo — kiểu suy luận từ lần dùng đầu tiên trong biểu thức
void valid3() {
    auto x;
    x = readInt();  // Hợp lệ: kiểu suy luận là int từ kiểu trả về của hàm

    auto y;
    int temp = 10;
    y = temp + 5;   // Hợp lệ: kiểu suy luận là int từ biểu thức
}

// Hợp lệ: một auto chưa biết + integer literal — tie-break xác định (xem spec Rule 2.2.1)
void valid4() {
    auto value;
    auto result = value + 5;  // Hợp lệ: value được gán kiểu int
}

// Hợp lệ: auto có khởi tạo từ biểu thức (các toán hạng đã có kiểu)
void valid5() {
    int a = 10;
    float b = 3.14;
    auto sum = a + b;  // Hợp lệ: kiểu suy luận là float từ biểu thức
}

// Hợp lệ: toàn bộ đối số là một định danh auto — kiểu tham số xác định kiểu x
void valid6() {
    auto x;
    printInt(x);  // Hợp lệ: kiểu suy luận là int từ kiểu tham số của printInt(int)
}
```

---

### 6. TypeMismatchInStatement (Không Khớp Kiểu Trong Câu Lệnh)

**Quy tắc:** Tất cả các câu lệnh phải tuân theo quy tắc kiểu của TyC.

**Ngoại lệ:** `TypeMismatchInStatement(<statement>)`

**Quy tắc kiểu cho câu lệnh:**

**Câu lệnh điều kiện (if, while, for):**

- Biểu thức điều kiện của if/while/for phải có kiểu `int` (0 là false, khác 0 là true)

**Câu lệnh for:**

- `<init>`, `<condition>`, `<update>` tuân theo quy tắc kiểu tương ứng
- Điều kiện phải có kiểu `int`

**Câu lệnh gán (`ExprStmt` với `AssignExpr`):**

- Vế trái và vế phải phải có cùng kiểu
- Gán struct: cả hai vế phải cùng kiểu struct
- Một struct literal ở vế phải mà không khớp số lượng trường hoặc kiểu từng thành viên so với kiểu struct kỳ vọng là **`TypeMismatchInExpression`** trên literal đó, không phải **`TypeMismatchInStatement`**
- Không có type coercion trong phép gán (khác với một số ngôn ngữ)

**Hành vi biểu thức gán:**

- Phép gán có thể dùng như một biểu thức (không chỉ là câu lệnh)
- Biểu thức gán là right-associative: `x = y = z = 10;` được phân tích là `x = (y = (z = 10));`
- Biểu thức gán trả về giá trị của vế trái sau khi gán
- Kiểu của biểu thức gán là kiểu của vế trái
- Vế trái phải là một định danh hoặc biểu thức truy cập thành viên (không được là literal hoặc biểu thức khác)
- Biểu thức gán có thể dùng trong ngữ cảnh biểu thức: `int y = (x = 5) + 7;` là hợp lệ

**Câu lệnh return:**

- Biểu thức return phải khớp kiểu trả về của hàm (nếu hàm không trả về `void`)
- Nếu kiểu trả về là `void`, phải dùng `return;` (không có biểu thức)
- Nếu kiểu trả về khác `void`, `return <expression>;` phải trả về giá trị đúng kiểu
- Với hàm có kiểu trả về suy luận, kiểu trả về được suy từ câu lệnh return đầu tiên có giá trị. Tất cả các câu lệnh return tiếp theo phải trả về cùng kiểu — nếu không khớp thì là lỗi TypeMismatchInStatement

**Câu lệnh switch:**

- Biểu thức switch phải có kiểu `int`
- Nhãn case phải là integer literal hoặc biểu thức hằng số kiểu `int`

**Ví dụ:**

```tyc
// Lỗi: Điều kiện không phải int trong câu lệnh if
void conditionalError() {
    float x = 5.0;
    if (x) {  // Lỗi: TypeMismatchInStatement tại câu lệnh if
        printInt(1);
    }

    string message = "hello";
    if (message) {  // Lỗi: TypeMismatchInStatement tại câu lệnh if
        printString(message);
    }
}

// Lỗi: Điều kiện không phải int trong câu lệnh while
void whileError() {
    float f = 1.5;
    while (f) {  // Lỗi: TypeMismatchInStatement tại câu lệnh while
        printFloat(f);
    }
}

// Lỗi: Không khớp kiểu trong phép gán
void assignmentError() {
    int x = 10;
    string text = "hello";
    float f = 3.14;

    x = text;    // Lỗi: TypeMismatchInStatement tại phép gán
    text = x;    // Lỗi: TypeMismatchInStatement tại phép gán
    f = x;       // Lỗi: TypeMismatchInStatement tại phép gán (không coercion int sang float)
}

// Lỗi: Không khớp kiểu struct trong phép gán
struct Point {
    int x;
    int y;
};

struct Person {
    string name;
    int age;
};

void structError() {
    Point p;
    Person person;
    p = person;  // Lỗi: TypeMismatchInStatement tại phép gán
}

// Lỗi: Không khớp kiểu return
int getValue() {
    return "invalid";  // Lỗi: TypeMismatchInStatement tại câu lệnh return
}

string getText() {
    return 42;  // Lỗi: TypeMismatchInStatement tại câu lệnh return
}

void returnError() {
    return 10;  // Lỗi: TypeMismatchInStatement tại câu lệnh return (hàm void không trả về giá trị)
}

int returnVoidError() {
    return;  // Lỗi: TypeMismatchInStatement tại câu lệnh return (hàm non-void phải trả về giá trị)
}

// Lỗi: Không khớp kiểu trong switch
void switchError() {
    float f = 3.14;
    switch (f) {  // Lỗi: TypeMismatchInStatement tại câu lệnh switch
        case 1: break;
    }
}

// Hợp lệ: Khớp kiểu đúng
void valid() {
    int x = 10;
    int y = 20;
    if (x < y) {  // Hợp lệ: điều kiện kiểu int
        x = y;    // Hợp lệ: cả hai vế đều int
    }

    Point p1 = {10, 20};
    Point p2 = {30, 40};
    p1 = p2;      // Hợp lệ: cả hai vế đều là Point
}

// Hợp lệ: Biểu thức gán trong ngữ cảnh biểu thức
void assignmentExpressionValid() {
    int x;
    int y = (x = 5) + 7;  // Hợp lệ: biểu thức gán trả về giá trị của x (sau khi gán)

    int a, b, c;
    a = b = c = 10;  // Hợp lệ: gán chained right-associative

    struct Point {
        int x;
        int y;
    };
    Point p;
    int result = (p.x = 5) + 3;  // Hợp lệ: biểu thức gán qua member access
}
```

---

### 7. TypeMismatchInExpression (Không Khớp Kiểu Trong Biểu Thức)

**Quy tắc:** Tất cả các biểu thức phải tuân theo quy tắc kiểu của TyC cho toán tử và phép tính.

**Ngoại lệ:** `TypeMismatchInExpression(<expression>)`

**Quy tắc kiểu cho biểu thức:**

**Toán tử số học hai ngôi (`+`, `-`, `*`, `/`):**

- Cả hai toán hạng phải là `int` hoặc `float`
- Kiểu kết quả: `int` nếu cả hai là `int`, ngược lại là `float`

**Toán tử modulus (`%`):**

- Cả hai toán hạng phải là `int`
- Kiểu kết quả: `int`

**Toán tử quan hệ (`==`, `!=`, `<`, `<=`, `>`, `>=`):**

- Cả hai toán hạng phải là `int` hoặc `float`
- Kiểu kết quả: `int` (0 cho false, khác 0 cho true)

**Toán tử logic (`&&`, `||`):**

- Cả hai toán hạng phải là `int`
- Kiểu kết quả: `int`

**Toán tử NOT logic (`!`):**

- Toán hạng phải là `int`
- Kiểu kết quả: `int`

**Toán tử tăng/giảm (`++`, `--`):**

- Toán hạng phải là `int` (prefix hoặc postfix)
- Toán hạng phải là một định danh biến hoặc biểu thức truy cập thành viên (không được là literal hoặc biểu thức khác)
- Kiểu kết quả: `int`

**Toán tử truy cập thành viên (`.`):**

- Toán hạng trái phải là kiểu struct
- Toán hạng phải phải là tên thành viên của kiểu struct đó
- Kiểu kết quả: kiểu của thành viên struct

**Lời gọi hàm:**

- Số lượng đối số phải khớp số lượng tham số
- Kiểu đối số phải khớp kiểu tham số (không có type coercion)
- Kiểu kết quả: kiểu trả về của hàm

**Struct literal:**

- Khi ngữ cảnh cung cấp kiểu struct kỳ vọng, literal phải có cùng số trường với struct, và kiểu của mỗi biểu thức trường phải bằng kiểu của thành viên tương ứng (không coercion giữa các kiểu nguyên thủy khác nhau)
- **Ngoại lệ:** `TypeMismatchInExpression(<StructLiteral>)` — `<StructLiteral>` là node struct literal đầy đủ

**Biểu thức gán:**

- Vế trái phải là định danh hoặc biểu thức truy cập thành viên (không được là literal hoặc biểu thức khác)
- Vế trái và vế phải phải có cùng kiểu
- Kiểu kết quả: kiểu của vế trái (sau khi gán)
- Biểu thức gán trả về giá trị của vế trái sau khi gán
- Có thể dùng trong ngữ cảnh biểu thức (ví dụ: `int y = (x = 5) + 7;`)
- Right-associative: `x = y = z = 10;` được phân tích là `x = (y = (z = 10));`

**Ví dụ:**

```tyc
// Lỗi: Không khớp kiểu trong phép toán số học
void arithmeticError() {
    int x = 5;
    string text = "hello";

    int sum = x + text;      // Lỗi: TypeMismatchInExpression tại binary operation
    float result = x * text; // Lỗi: TypeMismatchInExpression tại binary operation
}

// Lỗi: Modulus với toán hạng không phải int
void modulusError() {
    float f = 3.14;
    int x = 10;

    int result = f % x;      // Lỗi: TypeMismatchInExpression (float % int)
    int result2 = x % f;     // Lỗi: TypeMismatchInExpression (int % float)
}

// Lỗi: Không khớp kiểu trong phép so sánh
void relationalError() {
    int x = 10;
    string text = "hello";

    int result = x < text;   // Lỗi: TypeMismatchInExpression tại binary operation
    int equal = text == x;   // Lỗi: TypeMismatchInExpression tại binary operation
}

// Lỗi: Không khớp kiểu trong phép toán logic
void logicalError() {
    float f = 3.14;
    int x = 10;

    int result = f && x;     // Lỗi: TypeMismatchInExpression tại binary operation
    int not = !f;            // Lỗi: TypeMismatchInExpression tại unary operation
}

// Lỗi: Tăng/giảm trên kiểu không phải int
void incrementError() {
    float f = 3.14;
    ++f;                     // Lỗi: TypeMismatchInExpression tại unary operation
    f++;                     // Lỗi: TypeMismatchInExpression tại postfix operation
}

// Lỗi: Tăng/giảm trên literal hoặc biểu thức
void incrementOperandError() {
    int x = 5;
    ++5;                     // Lỗi: TypeMismatchInExpression (không thể tăng literal)
    --(x + 1);               // Lỗi: TypeMismatchInExpression (không thể tăng biểu thức)
    (x + 2)++;               // Lỗi: TypeMismatchInExpression (không thể tăng biểu thức)
}

// Lỗi: Truy cập thành viên trên kiểu không phải struct
void memberAccessError() {
    int x = 10;
    int value = x.member;    // Lỗi: TypeMismatchInExpression tại member access

    struct Point {
        int x;
        int y;
    };

    Point p = {10, 20};
    int invalid = p.z;       // Lỗi: TypeMismatchInExpression tại member access (z không tồn tại)
}

// Lỗi: Không khớp kiểu đối số trong lời gọi hàm
void process(int x) { }

void callError() {
    string text = "123";
    process(text);           // Lỗi: TypeMismatchInExpression tại function call
}

int add(int x, int y) {
    return x + y;
}

void callArgumentError() {
    int result = add(10);           // Lỗi: TypeMismatchInExpression (sai số lượng đối số)
    int result2 = add(10, 20, 30);  // Lỗi: TypeMismatchInExpression (sai số lượng đối số)
}

// Lỗi: Không khớp kiểu trong biểu thức gán
void assignmentExpressionError() {
    int x = 10;
    string text = "hello";
    float f = 3.14;

    int result = (x = text) + 5;  // Lỗi: TypeMismatchInExpression (int = string)
    int value = (x = f) + 3;      // Lỗi: TypeMismatchInExpression (int = float)
}

// Lỗi: Biểu thức gán với vế trái không hợp lệ
void assignmentLeftHandSideError() {
    int x = 5;
    int y = (5 = x) + 3;           // Lỗi: TypeMismatchInExpression (không gán được vào literal)
    int z = ((x + 1) = 10) + 2;    // Lỗi: TypeMismatchInExpression (không gán được vào biểu thức)
}

// Hợp lệ: Kiểu biểu thức đúng
void valid() {
    int x = 10, y = 20;
    int sum = x + y;         // Hợp lệ: cả hai int
    int compare = x < y;     // Hợp lệ: phép quan hệ trả về int
    int logic = x && y;      // Hợp lệ: phép logic trả về int
    ++x;                     // Hợp lệ: tăng trên int

    struct Point {
        int x;
        int y;
    };

    Point p = {10, 20};
    int x_coord = p.x;       // Hợp lệ: truy cập thành viên

    int a;
    int b = (a = 5) + 7;     // Hợp lệ: biểu thức gán trả về giá trị của a (5), b = 12

    int c, d, e;
    c = d = e = 10;          // Hợp lệ: right-associative, tất cả bằng 10

    int result = (p.x = 15) + 5;  // Hợp lệ: gán member access, result = 20
}
```

---

### 8. MustInLoop (Break/Continue Phải Trong Vòng Lặp)

**Quy tắc:** Câu lệnh break và continue phải nằm trong vòng lặp (for hoặc while).

**Ngoại lệ:** `MustInLoop(<statement>)`

**Quy tắc về ngữ cảnh vòng lặp:**

- Break và continue chỉ hợp lệ trong vòng lặp `for` hoặc `while`
- Break cũng có thể dùng trong câu lệnh `switch` (nhưng continue thì không)
- Có thể lồng trong các câu lệnh điều kiện bên trong vòng lặp
- Không thể vượt qua ranh giới hàm
- Phải nằm trong phạm vi từ vựng của vòng lặp

**Ví dụ:**

```tyc
// Lỗi: Break/continue ngoài vòng lặp
void loopError() {
    break;     // Lỗi: MustInLoop(break)
    continue;  // Lỗi: MustInLoop(continue)
}

// Lỗi: Break/continue trong if không có vòng lặp
void conditionalError() {
    if (1) {
        break;     // Lỗi: MustInLoop(break)
        continue;  // Lỗi: MustInLoop(continue)
    }
}

// Lỗi: Continue trong switch (không cho phép continue trong switch)
void switchError() {
    int x = 1;
    switch (x) {
        case 1:
            continue;  // Lỗi: MustInLoop(continue) - continue không hợp lệ trong switch
            break;
    }
}

// Lỗi: Break/continue trong hàm được gọi từ vòng lặp
void helperMethod() {
    break;     // Lỗi: MustInLoop(break) - phạm vi hàm khác
    continue;  // Lỗi: MustInLoop(continue)
}

void loopWithCall() {
    for (auto i = 0; i < 10; ++i) {
        helperMethod();  // Lời gọi hàm không chuyển ngữ cảnh vòng lặp
    }
}

// Hợp lệ: Break/continue trong vòng lặp
void validLoops() {
    for (auto i = 0; i < 10; ++i) {
        if (i == 5) {
            break;     // Hợp lệ: trong for
        }
        if (i % 2 == 0) {
            continue;  // Hợp lệ: trong for
        }
        printInt(i);
    }

    auto j = 0;
    while (j < 10) {
        if (j == 3) {
            continue;  // Hợp lệ: trong while
        }
        if (j == 8) {
            break;     // Hợp lệ: trong while
        }
        printInt(j);
        ++j;
    }
}

// Hợp lệ: Break trong switch
void validSwitch() {
    int day = 2;
    switch (day) {
        case 1:
            printInt(1);
            break;     // Hợp lệ: break trong switch
        case 2:
        case 3:
            printInt(2);
            break;     // Hợp lệ: break trong switch
        default:
            printInt(0);
    }
}

// Hợp lệ: Vòng lặp lồng nhau
void nestedLoops() {
    for (auto i = 0; i < 5; ++i) {
        for (auto j = 0; j < 5; ++j) {
            if (i == j) {
                continue;  // Hợp lệ: ảnh hưởng vòng lặp trong
            }
            if (j > 3) {
                break;     // Hợp lệ: thoát vòng lặp trong
            }
        }
    }
}
```

---

## Hướng Dẫn Triển Khai

### Ưu Tiên Phát Hiện Lỗi

**Single-pass, lỗi đầu tiên thắng (toàn chương trình).** Bộ kiểm tra thực hiện một lần **duyệt** ngữ nghĩa qua chương trình (thường là depth-first). **Lỗi duy nhất được báo cáo** là lỗi ngữ nghĩa **đầu tiên** gặp trong lần duyệt đó. Việc triển khai có thể dùng thêm các pass nội bộ hoặc kiểm tra trì hoãn (ví dụ cho kiểu trả về suy luận) miễn là **việc báo cáo** vẫn là "lỗi đầu tiên theo thứ tự duyệt." **Số tier không đưa lỗi sau lên trước lỗi trước:** lần duyệt không được mở rộng để tìm tất cả lỗi rồi chọn theo tier nhỏ nhất. Các tier dưới đây phân loại **loại lỗi** và định nghĩa **tie-breaking trong cùng tier**; chúng không áp đặt hàng đợi ưu tiên toàn cục trên toàn chương trình.

**Các tier lỗi** (để tài liệu hóa và xử lý tie trong cùng tier):

1. **Lỗi khai báo** (Redeclared, UndeclaredIdentifier, UndeclaredFunction, UndeclaredStruct)
2. **Lỗi suy luận kiểu** (`TypeCannotBeInferred`; xem mục 5)
3. **Lỗi kiểu** (TypeMismatchInStatement, TypeMismatchInExpression)
4. **Lỗi luồng điều khiển** (MustInLoop)

**Trong cùng một tier:** nếu có nhiều hơn một lỗi cùng tier xảy ra trước khi bộ kiểm tra dừng, báo cáo lỗi **đầu tiên** theo thứ tự duyệt (thứ tự phụ thuộc cách kiểm tra các cấu trúc, không chỉ đơn thuần từ trái sang phải trong source).

**Một** lỗi mỗi lần chạy.

---

### Quản Lý Phạm Vi

Lexical scope (khối, shadowing, và `for` init so với thân vòng lặp) được định nghĩa chuẩn tắc trong **`tyc_specification.md` § Scope Rules**. Bộ kiểm tra nên tuân theo mô hình đó; các quy tắc Redeclared / UndeclaredIdentifier trong tài liệu này là hệ quả của nó.

- **Global scope:** Hàm và struct (tên duy nhất trong từng loại; tên struct và tên hàm có thể trùng nhau — xem quy tắc Redeclared ở trên). Binding global không bỏ qua **khai báo trước khi dùng** cho các lời gọi và sử dụng kiểu struct (mục 3–4); tuân theo **`tyc_specification.md` § Scope Rules, Global Scope**.
- **Function scope:** Tham số (hiển thị trong toàn thân hàm; xem quy tắc Redeclared — biến cục bộ không được dùng lại tên tham số)
- **Local scope (block):** Biến khai báo trong các khối `{}`
- **Nested scopes:** Phạm vi trong có thể che khuất biến cục bộ ở ngoài (không che khuất tham số của hàm bao ngoài)

---

### Hệ Thống Suy Luận Kiểu

TyC sử dụng suy luận kiểu hoàn chỉnh với các quy tắc sau:

1. **Literal:** int / float / string như thông thường
2. **`auto`:** Từ biểu thức khởi tạo nếu có; ngược lại từ lần sử dụng đầu tiên có thể xác định kiểu
3. **Thất bại:** `auto` không rõ ràng hoặc không bao giờ dùng → `TypeCannotBeInferred(<ctx>)` (xem mục 5)
4. **Biểu thức:** Quy tắc toán tử/toán hạng áp dụng khi đã biết kiểu
5. **Kiểu trả về hàm:** Tường minh hoặc suy luận từ tổng thể các câu lệnh return của hàm (quy tắc đặc tả 5), không nhất thiết từ một lần duyệt top-to-bottom nghiêm ngặt

---

### Quy Tắc Hệ Thống Kiểu

- **Kiểm tra kiểu nghiêm ngặt:** Không có type coercion ngầm định ngoại trừ trong phép toán số học (int + float → float)
- **Không có function overloading:** Tên hàm phải duy nhất trong các hàm (tên struct và tên hàm có thể trùng nhau)
- **Kiểu struct:** Phải được khai báo tường minh trước khi sử dụng
- **Kiểu void:** Chỉ dùng làm kiểu trả về của hàm, không dùng cho biến hoặc tham số

---

### Hàm Built-in

Các hàm built-in sau được khai báo ngầm định và luôn có sẵn:

- `int readInt()`
- `float readFloat()`
- `string readString()`
- `void printInt(int value)`
- `void printFloat(float value)`
- `void printString(string value)`

---

### Điểm Vào Chương Trình

Một chương trình TyC phải có ít nhất một hàm tên `main` không nhận tham số và trả về `void`. Hàm này là điểm vào của chương trình.

---

_Tài liệu được chuẩn bị cho Phân Tích Ngữ Nghĩa Tĩnh TyC_
_Cập nhật lần cuối: Tháng 4 năm 2026_
