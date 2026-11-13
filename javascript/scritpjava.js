const formulario = document.getElementById("formulario");

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    // Obtener los datos
    let usuario = document.getElementById("usuario").value.trim();
    let password = document.getElementById("password").value;
    let correo = document.getElementById("correo").value.trim();
    let telefono = document.getElementById("telefono").value.trim();
    let ciudad = document.getElementById("ciudad").value.trim();
    let acepto = document.getElementById("acepto").checked;

    let mensaje = document.getElementById("mensaje");

    // Validar usuario
    if (usuario.length < 3) {
        mensaje.textContent = "El usuario debe tener mínimo 3 caracteres.";
        return;
    }

    // Validar contraseña
    if (password.length < 8) {
        mensaje.textContent = "La contraseña debe tener mínimo 8 caracteres.";
        return;
    }

    // Validar correo
    let regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regexCorreo.test(correo)) {
        mensaje.textContent = "Ingresa un correo electrónico válido.";
        return;
    }

    // Validar teléfono
    let regexTelefono = /^[0-9]{10}$/;

    if (!regexTelefono.test(telefono)) {
        mensaje.textContent = "El teléfono debe contener exactamente 10 dígitos.";
        return;
    }

    // Validar ciudad
    if (ciudad === "") {
        mensaje.textContent = "Selecciona tu ciudad de origen.";
        return;
    }

    // Validar términos
    if (!acepto) {
        mensaje.textContent = "Debes aceptar los términos del servicio.";
        return;
    }

    // Registro exitoso
    mensaje.textContent = "¡Registro exitoso! Bienvenido " + usuario;

    console.log("Datos del usuario:");
    console.log("Usuario:", usuario);
    console.log("Correo:", correo);
    console.log("Teléfono:", telefono);
    console.log("Ciudad:", ciudad);

});