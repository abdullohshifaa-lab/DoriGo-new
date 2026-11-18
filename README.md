# DoriGo — dorini eshigingizgacha yetkazamiz

Dorigo demo loyihasi: mavjud mijozlar oqimi saqlangan va sotuvchi/kuryer boshqaruv panellari qo‘shilgan. React + Vite + Tailwind CSS + Framer Motion + Lucide.

## Ishga tushirish

```bash
npm install
npm run dev
# Production build tekshiruvi
npm run build
```

Node.js 18+ kerak.

## Mijoz sahifalari

| Yo‘l | Ekran |
| --- | --- |
| `/` | Bosh sahifa |
| `/search` | Dori qidirish |
| `/results?q=…` | Dorixona natijalari va saralash |
| `/details` | Dori/dorixona tafsiloti va buyurtma xulosasi |
| `/address` | Manzil va demo to‘lov tanlovi |
| `/confirmed/:id` | Buyurtma tasdig‘i |
| `/track/:id` | Buyurtma holatini kuzatish va bekor qilish |
| `/orders` | Buyurtmalar tarixi |
| `/profile` | Profil, til va mavzu |
| `/urgent` | Shoshilinch qidiruv |
| `/panel` | Sotuvchi/kuryer demo kirish va boshqaruv |

HashRouter ishlatilgani sababli panel manzili brauzerda `/#/panel` ko‘rinishida ochiladi.

## Demo kirish

- **Sotuvchi:** login `dorixona`, parol `dorigo123`
- **Kuryer:** login `kuryer`, parol `dorigo123`

Bu ma’lumotlar faqat prototip uchun. Haqiqiy mahsulotda autentifikatsiya server tomonida bo‘lishi kerak.

## Qo‘shilgan imkoniyatlar

- Sotuvchi buyurtmani qabul qiladi, dori tayyorlaydi, ombor qoldig‘ini kamaytiradi va kuryerga topshiradi.
- Kuryer buyurtmani qabul qiladi, yetkazishni boshlaydi va yakunlaydi. Buyurtma holati avtomatik yakunlanmaydi.
- Mijoz va sotuvchi buyurtmani bekor qila oladi; ombor oldin kamaytirilgan bo‘lsa, dori qoldig‘i bir marta tiklanadi.
- Buyurtma berilgan paytdagi narx va summa tarixda saqlanadi.
- Sotuvchi dori qo‘shishi, tahrirlashi, o‘chirishi va narx/qoldiqni boshqarishi mumkin. O‘chirilgan dori eski buyurtma tarixida qoladi.
- Ombor qoldig‘i 5 ta yoki undan kam bo‘lsa, ogohlantirish chiqadi.
- Sotuvchi statistikasi, buyurtma tarixi va qoidaga asoslangan demo AI tavsiyalari bor. Kuryer AI navbat va kechikish xavfi bo‘yicha demo maslahat beradi.
- Mijoz AI katalogdagi dori nomi, tavsifi va narxiga tayanadi; tashxis qo‘ymaydi va dori buyurmaydi.
- Naqd/karta tanlovi faqat demo; haqiqiy pul yechilmaydi.

## Saqlash va cheklovlar

Ma’lumotlar `localStorage` da saqlanadi va bir brauzer ichidagi panellar bilan bo‘lishiladi. Bu versiyada server, haqiqiy to‘lov, real GPS/xarita marshruti yoki turli qurilmalar o‘rtasida sinxronlash yo‘q. AI funksiyalari API kalitisiz ishlaydigan demo qoidalardir.

## Loyiha tuzilmasi

- `src/pages/` — mijoz sahifalari va `Panel.jsx`
- `src/store/AppContext.jsx` — umumiy holat, buyurtmalar, katalog va localStorage
- `src/data/mock.js` — demo dorilar, dorixonalar va yordamchi funksiyalar
- `src/components/` — qayta ishlatiladigan UI komponentlari
