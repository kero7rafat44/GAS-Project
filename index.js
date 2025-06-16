
// تفعيل/إخفاء تأثيرات التلوث عند الضغط على العنوان
document.querySelectorAll(".toggle-section h2").forEach(header => {
    header.addEventListener("click", () => {
        const content = header.nextElementSibling;
        const icon = header.querySelector(".toggle-icon");
        content.classList.toggle("show");
        icon.textContent = content.classList.contains("show") ? "▲" : "▼";
    });
});