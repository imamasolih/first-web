function initializeHeader() {
    const header = document.querySelector(".site-header");

    if (header) {
    const toggleHeaderShadow = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 10);
    };

    const setHeaderHeight = () => {
        document.documentElement.style.setProperty(
        "--header-height",
        `${header.offsetHeight}px`
        );
    };

    toggleHeaderShadow();
    setHeaderHeight();
    window.addEventListener("scroll", toggleHeaderShadow, { passive: true });
    window.addEventListener("resize", setHeaderHeight);
    }
};
