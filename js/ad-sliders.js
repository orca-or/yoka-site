"use strict";

document.querySelectorAll(".yoka-ad-slider").forEach((slider, sliderIndex) => {
    const slides = Array.from(
        slider.querySelectorAll(".yoka-ad-slide")
    );

    const previousButton = slider.querySelector(".yoka-ad-arrow.prev");
    const nextButton = slider.querySelector(".yoka-ad-arrow.next");
    const dotsContainer = slider.querySelector(".yoka-ad-dots");

    if (slides.length <= 1) return;

    // ============================================================
    // CONFIGURAÇÃO E PERSISTÊNCIA
    // ============================================================

    const storageKey = `yoka-ad-slider-${slider.id || sliderIndex}`;

    let currentIndex = 0;

    try {
        const savedIndex = Number(localStorage.getItem(storageKey));

        if (
            localStorage.getItem(storageKey) !== null &&
            Number.isInteger(savedIndex) &&
            savedIndex >= 0 &&
            savedIndex < slides.length
        ) {
            currentIndex = savedIndex;
        }
    } catch (error) {
        console.warn("Yoka Ads: não foi possível recuperar a posição do slider.");
    }

    let timer = null;

    const interval = Math.max(
        2000,
        Number(slider.dataset.interval) || 15000
    );

    // ============================================================
    // CRIAR INDICADORES
    // ============================================================

    dotsContainer.replaceChildren();

    slides.forEach((slide, index) => {
        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = "yoka-ad-dot";

        dot.setAttribute(
            "aria-label",
            `Mostrar anúncio ${index + 1}`
        );

        dot.addEventListener("click", () => {
            showSlide(index);
            restartTimer();
        });

        dotsContainer.appendChild(dot);
    });

    const dots = Array.from(
        dotsContainer.querySelectorAll(".yoka-ad-dot")
    );

    // ============================================================
    // MOSTRAR SLIDE
    // ============================================================

    function showSlide(index) {
        currentIndex = (index + slides.length) % slides.length;

        slides.forEach((slide, i) => {
            const active = i === currentIndex;

            slide.classList.toggle("active", active);

            slide.setAttribute(
                "aria-hidden",
                String(!active)
            );

            dots[i].classList.toggle("active", active);

            dots[i].setAttribute(
                "aria-current",
                active ? "true" : "false"
            );
        });

        // Guardar a posição actual
        try {
            localStorage.setItem(storageKey, String(currentIndex));
        } catch (error) {
            console.warn("Yoka Ads: não foi possível guardar a posição do slider.");
        }
    }

    // ============================================================
    // NAVEGAÇÃO
    // ============================================================

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    function previousSlide() {
        showSlide(currentIndex - 1);
    }

    // ============================================================
    // TEMPORIZADOR
    // ============================================================

    function stopTimer() {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
    }

    function startTimer() {
        stopTimer();

        if (!document.hidden) {
            timer = setInterval(nextSlide, interval);
        }
    }

    function restartTimer() {
        startTimer();
    }

    // ============================================================
    // EVENTOS DOS BOTÕES
    // ============================================================

    if (nextButton) {
        nextButton.addEventListener("click", () => {
            nextSlide();
            restartTimer();
        });
    }

    if (previousButton) {
        previousButton.addEventListener("click", () => {
            previousSlide();
            restartTimer();
        });
    }

    // ============================================================
    // PAUSAR AO INTERAGIR COM O SLIDER
    // ============================================================

    slider.addEventListener("mouseenter", stopTimer);

    slider.addEventListener("mouseleave", startTimer);

    slider.addEventListener("focusin", stopTimer);

    slider.addEventListener("focusout", (event) => {
        if (!slider.contains(event.relatedTarget)) {
            startTimer();
        }
    });

    // ============================================================
    // VISIBILIDADE DA PÁGINA
    // ============================================================

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopTimer();
        } else {
            startTimer();
        }
    });

    // ============================================================
// INICIALIZAÇÃO
// ============================================================

// Esconder todas as imagens antes de apresentar a posição guardada
slides.forEach((slide) => {
    slide.classList.remove("active");
    slide.setAttribute("aria-hidden", "true");
});

// Apresentar directamente a imagem guardada
showSlide(currentIndex);

// Activar as transições depois da inicialização
requestAnimationFrame(() => {
    slider.classList.add("yoka-ad-slider-ready");
});

// Iniciar a mudança automática
startTimer();
});









