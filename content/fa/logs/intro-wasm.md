---
title: آشنایی با WASM
date: 2023-09-12T16:33:46.294Z
thumbnail: content/web-assembly-logo.png
description: "وب‌اسمبلی (WebAssembly) یک استاندارد باز است که امکان اجرای کدهای باینری بهینه را در محیط‌های جاوا اسکریپت فراهم می‌کند. هدف اصلی آن افزایش سرعت و کارایی برنامه‌های وب است، اما می‌توان آن را در محیط‌های دیگر نیز اجرا کرد."

toc: true
intro: false
comments: true
cat: tuts
tuts: work-with-wasm
---

## معرفی WebAssembly (WASM)

وب در سال‌های اخیر تغییرات چشمگیری داشته است. برنامه‌های کاربردی پیچیده‌تر، بازی‌های آنلاین پیشرفته‌تر و اپلیکیشن‌های تحت وب با نیازهای پردازشی سنگین‌تری همراه شده‌اند. جاوا اسکریپت، هرچند قدرتمند و محبوب، همیشه قادر نیست عملکرد لازم برای اجرای چنین برنامه‌هایی را فراهم کند. به همین دلیل توسعه‌دهندگان به دنبال راهکاری برای افزایش سرعت و کارایی برنامه‌های تحت وب بوده‌اند.

WebAssembly یا به اختصار WASM به عنوان یک راه حل مناسب به وجود آمده است. WASM یک استاندارد باز و فرمت باینری است که به توسعه‌دهندگان این امکان را می‌دهد تا کدهایی را که در زبان‌هایی مانند C، C++، Rust و Go نوشته شده‌اند، به کدهای بهینه‌شده و قابل اجرا در مرورگر تبدیل کنند. این کدهای باینری در محیط ایزوله‌ای اجرا می‌شوند که امنیت و پایداری بالایی را به همراه دارد.

از جمله مزایای استفاده از WebAssembly می‌توان به سرعت بالای اجرا، امنیت بیشتر، چندزبانه بودن و کاهش قابل توجه حجم کدهای اجرایی اشاره کرد. این تکنولوژی در حال حاضر توسط شرکت‌های بزرگی همچون گوگل، مایکروسافت و موزیلا حمایت می‌شود و روز به روز نقش پررنگ‌تری در صنعت توسعه وب پیدا می‌کند.

## ساخت اولین پروژه WASM با Go و TinyGo

### نصب ابزارهای لازم

برای ایجاد برنامه WASM با زبان Go به TinyGo نیاز دارید. می‌توانید با استفاده از Homebrew آن را نصب کنید:

```bash
brew install tinygo
```

بررسی نسخه‌های نصب‌شده:

```bash
go version
tinygo version
```

### نوشتن اولین برنامه Go برای WASM

فایل `main.go` را ایجاد کرده و کد زیر را در آن قرار دهید:

```go
package main

import "fmt"

func main() {
    fmt.Println("سلام از Go و WASM!")
}
```

### کامپایل به فرمت WASM

از دستور زیر برای کامپایل کد Go به فرمت WebAssembly استفاده کنید:

```bash
tinygo build -o main.wasm -no-debug -opt=2 main.go
```

### ایجاد صفحه HTML و اجرای WASM

صفحه HTML را به صورت زیر ایجاد کنید:

```html
<!DOCTYPE html>
<html lang="fa">
  <head>
    <meta charset="UTF-8" />
    <title>اولین پروژه WASM</title>
    <script src="wasm_exec.js"></script>
  </head>
  <body>
    <h1>اولین پروژه با WebAssembly و Go</h1>
    <script>
      const go = new Go();
      WebAssembly.instantiateStreaming(
        fetch("main.wasm"),
        go.importObject
      ).then((result) => {
        go.run(result.instance);
      });
    </script>
  </body>
</html>
```

## تعامل جاوا اسکریپت و WASM

شما می‌توانید توابع Go را به‌صورت مستقیم از جاوا اسکریپت فراخوانی کنید:

### کد Go (تابع add)

```go
package main

//export add
func add(a, b int) int {
    return a + b
}

func main() {}
```

### فراخوانی از جاوا اسکریپت

```javascript
const wasmUrl = "main.wasm";

WebAssembly.instantiateStreaming(fetch(wasmUrl), go.importObject).then(
  (result) => {
    go.run(result.instance);

    document.getElementById("calc").addEventListener("click", () => {
      const a = parseInt(document.getElementById("a").value);
      const b = parseInt(document.getElementById("b").value);
      const res = result.instance.exports.add(a, b);
      document.getElementById("result").textContent = res;
    });
  }
);
```

### کد HTML برای انجام عملیات

```html
<input type="number" id="a" placeholder="عدد اول" />
<input type="number" id="b" placeholder="عدد دوم" />
<button id="calc">محاسبه</button>
<p>نتیجه: <span id="result"></span></p>
```

## تغییر DOM با استفاده از WASM

برای تغییرات مستقیم در DOM از Go و WASM، از کتابخانه `syscall/js` استفاده کنید:

### کد Go برای تغییر DOM

```go
package main

import (
	"syscall/js"
)

func main() {
	document := js.Global().Get("document")
	div := document.Call("createElement", "div")
	div.Set("innerHTML", "سلام از طریق Go و WASM!")
	document.Get("body").Call("appendChild", div)

	select {}
}
```

### کامپایل و اجرا

```bash
tinygo build -o main.wasm -target wasm -no-debug main.go
```

## نتیجه‌گیری

در این ماژول، ضمن آشنایی مقدماتی با WebAssembly، نحوه ایجاد، کامپایل و اجرای برنامه‌های WASM با زبان Go و ابزار TinyGo را فرا گرفتید. همچنین تعامل با جاوا اسکریپت و تغییرات مستقیم DOM از طریق WASM را بررسی کردیم. در ماژول‌های بعدی به مباحث پیشرفته‌تری از این تکنولوژی قدرتمند خواهیم پرداخت.

## منابع بیشتر

- [وب‌سایت رسمی WebAssembly](https://webassembly.org)
- [مستندات TinyGo](https://tinygo.org/docs/)
- [آموزش‌های تکمیلی در GitHub](https://github.com/mehotkhan/tinygo-wasm-tutorial)
