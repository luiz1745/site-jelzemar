// Script para funcionalidades do site
document.addEventListener('DOMContentLoaded', function() {
    // Adicionar evento de clique para os cards de produto
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const productTitle = this.querySelector('.product-title').textContent;
            alert(`Você clicou no produto: ${productTitle}\nEm breve, você será redirecionado para a página do produto.`);
        });
    });
    
    // Simular busca
    const searchForm = document.querySelector('.search-bar form');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = this.querySelector('input').value;
            if (searchTerm.trim() !== '') {
                alert(`Buscando por: ${searchTerm}`);
                // Aqui você pode adicionar a lógica de busca real
            }
        });
    }
    
    // Adicionar eventos para os banners
    const banners = document.querySelectorAll('.banner-card');
    banners.forEach(banner => {
        banner.addEventListener('click', function() {
            const bannerTitle = this.querySelector('.banner-title').textContent;
            alert(`Redirecionando para a página de ${bannerTitle}`);
            // Aqui você pode adicionar o redirecionamento real quando as páginas estiverem prontas
        });
    });
    
    // Atualizar ano do copyright
    const copyrightElement = document.querySelector('.copyright p');
    if (copyrightElement) {
        const currentYear = new Date().getFullYear();
        copyrightElement.innerHTML = copyrightElement.innerHTML.replace('2023', currentYear);
    }
    
    // Seleção de método de pagamento
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function() {
            document.querySelectorAll('.payment-method').forEach(m => {
                m.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Formatação de campos
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 5) {
                value = value.substring(0,5) + '-' + value.substring(5,8);
            }
            e.target.value = value;
        });
    }
    
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value.substring(0, 19);
        });
    }
    
    const cardExpiryInput = document.getElementById('card-expiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                value = value.substring(0,2) + '/' + value.substring(2,4);
            }
            e.target.value = value;
        });
    }
    
    // Validação básica do formulário
    const payButton = document.querySelector('.payment-form .btn');
    if (payButton) {
        payButton.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Pedido realizado com sucesso! Em breve você receberá um e-mail de confirmação.');
            // Aqui você implementaria a lógica real de processamento do pagamento
        });
    }
    
    // Script para destacar o item ativo no menu
    const currentPage = window.location.hash || '#home';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Navegação suave para âncoras
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
                
                // Atualizar menu ativo
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });
});