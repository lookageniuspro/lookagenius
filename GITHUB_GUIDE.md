# دليل النشر التلقائي - GitHub Actions 🚀

لجعل موقعك "يتحدث" تلقائياً عند إضافة دورات جديدة من لوحة التحكم، اتبع الخطوات التالية:

## 1. إعداد Git Gateway
إذا كنت تستخدم **Netlify** (موصى به لـ Decap CMS):
- اذهب إلى **Site settings > Identity**.
- فعل **Enable Identity**.
- تحت **Services > Git Gateway**، اضغط على **Enable Git Gateway**.

## 2. تفعيل GitHub Actions (اختياري للنشر المخصص)
إذا كنت تريد النشر على **GitHub Pages**:
- اذهب إلى مستودعك (Repository) على GitHub.
- اذهب إلى **Settings > Pages**.
- اختر **GitHub Actions** كمصدر للنشر (Build and deployment).

## 3. التحديث التلقائي للمحتوى
عندما تقوم بحفظ دورة جديدة من `your-site.com/admin/`، سيقوم Decap CMS تلقائياً بعمل "Commit" لملفات الـ Markdown في مجلد `_courses/`. هذا الـ Commit سيقوم بتشغيل الـ Action وإعادة بناء الموقع فوراً.

> [!TIP]
> تأكد من تحديث رابط المستودع في ملف `admin/config.yml` ليعمل النظام بشكل صحيح.
