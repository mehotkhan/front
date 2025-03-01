---
title: آشنایی با WASM
date: 2023-09-12T16:33:46.294Z
thumbnail: content/web-assembly-logo.png
description: "وب‌اسمبلی (WebAssembly) یک استاندارد باز است که امکان اجرای کدهای باینری بهینه را در محیط‌های جاوا اسکریپت فراهم می‌کند. هدف اصلی آن افزایش سرعت و کارایی برنامه‌های وب است، اما می‌توان آن را در محیط‌های دیگر نیز اجرا کرد."

toc: false
intro: false
category: books
---

## مقدمه

در توسعه ابزارهای وب، سرعت و کارایی از اهمیت بالایی برخوردارند. نرم‌افزارهای سریع‌تر و بهینه‌تر تجربه کاربری بهتری ایجاد می‌کنند. طبق آمار، اگر زمان بارگذاری یک وب‌سایت بیش از ۳ ثانیه طول بکشد، حدود ۴۰٪ از کاربران خود را از دست خواهید داد. این موضوع اهمیت بهینه‌سازی برنامه‌های وب را نشان می‌دهد.

جاوا اسکریپت تاکنون پیشرفت زیادی کرده است، اما همیشه نیاز به راهکاری برای بهبود سرعت وجود دارد. برای حل این چالش، WebAssembly (WASM) توسعه یافت. WASM یک فرمت باینری است که کدهای کامپایل‌شده را در مرورگر اجرا می‌کند و امکان اجرای سریع‌تر برنامه‌ها را فراهم می‌آورد.

## معرفی WASM

WebAssembly یا WASM یک استاندارد باز است که به توسعه‌دهندگان امکان می‌دهد کدهای خود را در زبان‌های مختلف نوشته و سپس به فرمت WASM کامپایل کنند. این کدها در ماشین مجازی جاوا اسکریپت اجرا می‌شوند و قابلیت‌هایی نظیر امنیت بالا و دسترسی به APIهای مرورگر را دارند.

## استفاده از WASM با Go و TinyGo

### نصب ابزارهای لازم

```bash
go version
tinygo version
```

### ایجاد پروژه و کامپایل برنامه WASM

**فایل HTML:**

```html
<!doctype html>
<html dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>وب‌اسمبلی با تاینی‌گو</title>
    <script src="wasm_exec.js"></script>
    <script src="wasm.js"></script>
  </head>
  <body>
    <h1>وب‌اسمبلی (Wasm)</h1>
  </body>
</html>
```

**فایل جاوا اسکریپت:**

```js
WASM_URL = "wasm.wasm";
let wasm;
const initWasm = () => {
  const go = new Go();
  WebAssembly.instantiateStreaming(fetch(WASM_URL), go.importObject).then(
    (obj) => {
      wasm = obj.instance;
      go.run(wasm);
    }
  );
};
initWasm();
```

**کد Go:**

```go
package main
import "fmt"
func main() {
    fmt.Println("Hello world from Go :)")
}
```

**کامپایل و اجرای پروژه:**

```bash
tinygo build -o main.wasm -no-debug -opt=2 main.go
npx serve .
```

## تعامل WASM با جاوا اسکریپت

برای ارسال داده‌ها به WASM و دریافت نتیجه از آن، می‌توان توابع Go را از جاوا اسکریپت فراخوانی کرد.

**فایل `index.html` برای محاسبه دو عدد:**

```html
<input type="number" id="a" value="2" /> +
<input type="number" id="b" value="2" /> =
<input type="number" id="result" />
<button>محاسبه</button>
<script>
  document.querySelector("button").addEventListener("click", () => {
    var a = parseInt(document.getElementById("a").value);
    var b = parseInt(document.getElementById("b").value);
    var res = wasm.exports.add(a, b);
    document.getElementById("result").value = res;
  });
</script>
```

**کد Go برای تابع `add`:**

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello world from Go :)")
}

//export add
func add(x, y int) int {
    return x + y
}
```

**اجرای کامپایل:**

```bash
tinygo build -o main.wasm -no-debug -opt=2 main.go
```

## تغییرات در DOM با WASM

برای تغییر محتوا در صفحه وب از Go و WASM، می‌توان از `syscall/js` استفاده کرد.

**کد Go برای افزودن یک پیام به DOM:**

```go
package main

import (
    "fmt"
    "syscall/js"
)

func main() {
    fmt.Println("Hello world from Go :)")
    document := js.Global().Get("document")
    p := document.Call("createElement", "p")
    p.Set("innerHTML", "Hello WASM from Go!")
    document.Get("body").Call("appendChild", p)
}
```

**اجرای کامپایل:**

```bash
tinygo build -o main.wasm -no-debug -opt=2 main.go
```

پس از اجرا، متن "Hello WASM from Go!" در صفحه نمایش داده می‌شود.

## نتیجه‌گیری

در این آموزش، با WebAssembly (WASM) و نحوه استفاده از آن در زبان Go و کامپایلر TinyGo آشنا شدیم. WASM امکان بهینه‌سازی و افزایش کارایی وب‌سایت‌ها را فراهم می‌کند و می‌توان از آن برای بهبود عملکرد اپلیکیشن‌های وب استفاده کرد.

## منابع بیشتر

- [TinyGO](https://tinygo.org/)
- [LLVM](https://llvm.org/)
- [WebAssembly](https://webassembly.org/)
- [Golang](https://go.dev/)
- [سورس‌های آموزش](https://github.com/mehotkhan/tinygo-wasm-tuts)