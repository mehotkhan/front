---
title: آشنایی با WASM
thumbnail: content/web-assembly-logo.png
description: " وب‌اسمبلی (انگلیسی: WebAssembly) یا وَسم (انگلیسی: Wasm، اغلب به
  طور مخفف) استانداردی باز است که یک فرمت کدی باینری و قابل حمل برای برنامه‌های
  اجرایی،برای اجرا در محیط های جاوا اسکریپ است .هدف اصلی وب‌اسمبلی میسر کردن
  اپلیکیشن‌های با کارایی-بالا در صفحهات وب است، اما فرمت طوری طراحی شده که
  بتواند در محیط‌های دیگر، هم اجرا و تعبیه گردد."
date: 2023-09-12T16:33:46.294Z
banner: false
comments: true
toc: true
postIntro: true
category: notes
---

### مقدمه

در توسعه ابزارهای وب، سرعت و کارایی از اهمیت بسیار بالایی برخوردارند. هرچه نرم‌افزارهای تحت وب سریع‌تر و بهینه‌تر اجرا شوند، تجربه کاربری بهتری فراهم می‌شود و این می‌تواند تأثیر زیادی بر رضایت کاربران نهایی داشته باشد.

طبق گزارش‌های گوگل، اگر زمان بارگذاری وب‌سایت شما بیش از ۳ ثانیه طول بکشد، حدود ۴۰ درصد از کاربران خود را از دست خواهید داد. این آمار نشان می‌دهد که بهینه‌سازی سرعت و کارایی برنامه‌های وب یکی از چالش‌های اصلی در این حوزه است.

جاوا اسکریپت، به عنوان زبان اصلی برنامه‌نویسی تحت وب، تاکنون با تلاش‌های زیادی از سوی کمپانی‌های بزرگ برای بهبود عملکرد و سرعت مواجه شده است. مرورگرهای مدرن و موتورهای جاوا اسکریپت به طور قابل توجهی نسبت به گذشته بهینه‌تر شده‌اند. booksخانه‌های مدرنی مانند React و Vue و باندلرهای مانند WebPack و Vite نیز به افزایش کارایی صفحات وب کمک کرده‌اند. با این حال، همیشه چالشی اساسی باقی مانده است: آیا امکان دستیابی به سرعت و کارایی بیشتر وجود دارد؟

### معرفی WASM

برای حل این مشکل، تکنولوژی asm.js توسط موزیلا معرفی شد و بعداً وب‌اسمبلی یا WASM توسعه یافت. WASM یک فرمت باینری برای اجرای برنامه‌های وب است که طراحی شده تا وابستگی به معماری خاصی نداشته باشد و بتواند در مرورگرها اجرا شود.

**WASM (WebAssembly)** یک استاندارد باز است که به توسعه‌دهندگان امکان می‌دهد کدهای خود را به زبان‌های مختلف نوشته و سپس به فرمت WASM کامپایل کنند. این کدها در ماشین مجازی جاوا اسکریپت اجرا می‌شوند و قابلیت‌هایی نظیر امنیت بالا و دسترسی به API‌های مرورگر را دارند. WASM به شما این امکان را می‌دهد که کدهای مالتی‌ترد بنویسید، DOM را تغییر دهید و با آن تعامل کنید.

### استفاده از WASM با Go و TinyGo

در این آموزش، نحوه استفاده از WASM را با زبان برنامه‌نویسی Go و کامپایلر TinyGo بررسی خواهیم کرد. TinyGo به دلیل تولید فایل‌های باینری با حجم کمتر نسبت به کامپایلر پیش‌فرض Go بسیار مفید است. برای مثال، یک برنامه ساده "سلام دنیا" با Go به صورت پیش‌فرض حدود ۲ مگابایت است، در حالی که با TinyGo تنها حدود ۸۵ کیلوبایت خواهد بود.

#### نوشتن و کامپایل برنامه

۱. **نصب ابزارها**

ابتدا اطمینان حاصل کنید که آخرین نسخه‌های Go و TinyGo بر روی سیستم شما نصب شده است:

```bash
go version
tinygo version   `

```

۲. آماده‌سازی فایل‌های پروژه

فایل HTML: index.html

```html
<!doctype html>
<html dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>وسم با تاینی‌گو</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="wasm_exec.js"></script>
    <script src="wasm.js"></script>
  </head>
  <body>
    <h1>وب‌اسمبلی (Wasm)</h1>
  </body>
</html>
```

فایل جاوا اسکریپت: wasm.js

```js
WASM_URL = "wasm.wasm";
let wasm;
const initWasm = () => {
  const go = new Go();
  if ("instantiateStreaming" in WebAssembly) {
    WebAssembly.instantiateStreaming(fetch(WASM_URL), go.importObject).then(
      function (obj) {
        wasm = obj.instance;
        go.run(wasm);
      }
    );
  }
};
initWasm();
```

- **دانلود فایل wasm_exec.js**: [دانلود](https://github.com/tinygo-org/tinygo/blob/release/targets/wasm_exec.js)

۳. **نوشتن برنامه "سلام دنیا"**

**کد Go**:

```go
package main
import "fmt"
func main() {    fmt.Println("Hello world from Go :)")  }   `

```

**کامپایل به WASM**:

```bash

tinygo build -o main.wasm -no-debug -opt=2 main.go

```

با استفاده از NPM، وب‌سرور محلی را اجرا کنید:

```bash

npx serve .
```

سپس، با رفتن به آدرس <http://localhost:3000>، پیام "Hello world from Go" را مشاهده خواهید کرد.

### فراخوانی توابع Go از جاوا اسکریپت

برای این که توابع Go را از جاوا اسکریپت فراخوانی کنیم و داده‌ها را از HTML به WASM ارسال کنیم، باید تغییراتی در فایل HTML ایجاد کنیم:

**تغییرات در فایل `index.html`**:

```html
<!doctype html>

<html dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>وسم با تاینی‌گو</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="wasm_exec.js"></script>
    <script src="wasm.js"></script>
  </head>
  <body>
    <h1>وب‌اسمبلی (Wasm)</h1>
    <p>
      دو عدد را وارد کنید و نتیجه را به کمک صدا زدن تابع add در فایل Wasm محاسبه
      کنید.
    </p>
    <input type="number" id="a" value="2" /> +
    <input type="number" id="b" value="2" /> =
    <input type="number" id="result" />
    <button>محاسبه</button>
    <script>
      const button = document.querySelector("button");

      button.addEventListener("click", (event) => {
        var a = parseInt(document.getElementById("a").value);
        var b = parseInt(document.getElementById("b").value);
        var res = wasm.exports.add(a, b);
        var sum_box = document.getElementById("result");
        sum_box.value = res;
      });
    </script>
  </body>
</html>
```

**کد Go برای تابع `add`**:

```go
package main import "fmt" func main() {
fmt.Println("Hello world from Go :)") } //export add func add(x, y int) int {
return x + y }


```

**کامپایل و تست**:

```bash
 tinygo build -o main.wasm -no-debug -opt=2 main.go

```

با رفرش کردن صفحه، قادر خواهید بود نتایج محاسبات را مشاهده کنید.

### تغییرات در DOM

برای تغییر DOM با استفاده از WASM، می‌توانیم از booksخانه `syscall/js` استفاده کنیم:

**کد Go برای تغییر DOM**:

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
p.Set("style", "font-size:30px;border-top:1px solid #ddd;padding-top:5px")
document.Get("body").Call("appendChild", p)
}

//export add
func add(x, y int) int {
return x + y
}

```

**کامپایل و تست**:

```bash
tinygo build -o main.wasm -no-debug -opt=2 main.go

```

با رفرش کردن صفحه، المان جدیدی با متن "Hello WASM from Go!" مشاهده خواهید کرد.

### سخن پایانی

در این آموزش، با مبانی WebAssembly (WASM) و نحوه استفاده از آن با زبان Go و کامپایلر TinyGo آشنا شدیم. WASM امکانات زیادی برای بهینه‌سازی و افزایش کارایی وب‌سایت‌ها فراهم می‌کند و با توجه به مزایای آن، می‌توانید بخش‌هایی از پروژه‌های وب خود را به سمت WASM ببرید تا سرعت و دقت بیشتری را تجربه کنید.

### منابع بیشتر

- [TinyGO](https://tinygo.org/)
- [LLVM](https://llvm.org/)
- [WebAssembly](https://webassembly.org/)
- [Golang](https://go.dev/)
- [سورس‌های آموزش](https://github.com/mehotkhan/tinygo-wasm-tuts)
