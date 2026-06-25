(() => {
    initDB();

    // Force upgrade services to new format (with features array) if old data detected
    const oldServices = window.db.getServices();
    if (oldServices.length > 0 && typeof oldServices[0].price === 'number') {
        const data = window.db.getData();
        data.services = JSON.parse(JSON.stringify(defaultData.services));
        window.db.saveData(data);
    }

    const container = document.getElementById('servicesContainer');
    if (!container) return;

    const services = window.db.getServices();

    const categoryColors = {
        'academic': '#00D4FF',
        'engineering': '#A855F7',
        'accounting': '#00FFAA',
        'legal': '#FBBF24',
        'creative': '#FF3366',
        'medical': '#FF6B6B',
        'retail': '#0D8ABC',
        'fitness': '#10B981'
    };

    container.innerHTML = services.map((svc, index) => `
        <div class="service-card ag-glass" data-aos="fade-up" data-aos-delay="${(index % 3) * 100}">
            <div class="service-icon-wrapper">
                <i class="fa-solid ${svc.icon}"></i>
            </div>
            <h3>${svc.title}</h3>
            <p>${svc.description}</p>
            <ul class="service-features">
                ${(svc.features || []).map(f => `
                    <li><i class="fa-solid fa-check-circle" style="color:${categoryColors[svc.category] || '#00D4FF'};"></i> ${f}</li>
                `).join('')}
            </ul>
            <div style="margin-top: 10px; color: var(--success); font-weight: bold; font-size: 0.9rem;">
                <span>Professional Package: </span><span>$${svc.price}</span>
            </div>
            <button class="ag-btn service-booking-btn" data-service-name="${svc.title.replace(/"/g, '&quot;')}" style="width: 100%; font-size: 14px; margin-top: auto; cursor: pointer; border: none; border-radius: 50px; background: linear-gradient(135deg, ${categoryColors[svc.category] || '#00D4FF'}, ${svc.category === 'creative' ? '#A855F7' : '#A855F7'}); color: white; padding: 12px;">Order Service Now <i class="fa-solid fa-arrow-left"></i></button>
        </div>
    `).join('');

    // WhatsApp booking handler for dynamically rendered buttons
    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.service-booking-btn');
        if (!btn) return;
        const serviceName = btn.getAttribute('data-service-name') || 'Our Services';
        const message = encodeURIComponent('I want to inquire about: ' + serviceName);
        window.open(`https://wa.me/201098768356?text=${message}`, '_blank');
    });
})();
