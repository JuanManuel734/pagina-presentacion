document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.getElementById("dark-mode-toggle");

    // Leer el estado del modo oscuro desde sessionStorage
    const darkMode = sessionStorage.getItem("dark-mode");
    if (darkMode === "enabled") {
        document.body.classList.add("dark-mode");
        toggle.checked = true;
    }

    // Escuchar cambios en el estado del toggle y guardar en sessionStorage
    toggle.addEventListener("change", function () {
        if (toggle.checked) {
            document.body.classList.add("dark-mode");
            sessionStorage.setItem("dark-mode", "enabled");
        } else {
            document.body.classList.remove("dark-mode");
            sessionStorage.setItem("dark-mode", "disabled");
        }
    });
});


// Mostrar el loader cuando se cambia de página
function showLoader() {
    document.getElementById("loader-wrapper").style.display = "flex";
    document.getElementById("content").style.display = "none";
}

// Ocultar el loader una vez que el contenido se ha cargado
document.addEventListener("DOMContentLoaded", function() {
    // Añade un retraso adicional antes de ocultar el loader
    setTimeout(function() {
        document.getElementById("loader-wrapper").style.display = "none";
        document.getElementById("content").style.display = "block";
    }, 500); // Ajusta el tiempo según sea necesario (5000 ms = 5 segundos)
});

// Escuchar todos los enlaces de la página para mostrar el loader antes de navegar
document.querySelectorAll("a").forEach(function(link) {
    link.addEventListener("click", function(event) {
        showLoader();
    });
});

// Mostrar el loader al cerrar o recargar la página
window.addEventListener("beforeunload", function(event) {
    showLoader();
});
