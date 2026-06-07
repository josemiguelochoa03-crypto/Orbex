let usuarioActual = null;
let puntos = 0;

let puntuajeMateriales = {
    plastico: 5,
    papel: 4,
    vidrio: 7.5,
    organico: 2.5,
    }

let catalogoRecompensas = [
    {nombre:"Bonificacion +0.5 en cualquier materia", puntos: 100 },
    {nombre:"bonificacion +1.0 en tareas", puntos: 200 },
    {nombre:"Oportunidad de recuperacion", puntos: 350 },
    {nombre:"Reconocimiento de lider ambiental", puntos: 500 }
]    

let Puntosguardados = localStorage.getItem("Orbexpuntos");
if (Puntosguardados) {
    puntos = parseInt(Puntosguardados);
}

let usuarioGuardado = localStorage.getItem("Orbexusuario");
if (usuarioGuardado) {
    usuarioActual = JSON.parse(usuarioGuardado);
    puntos = parseInt(localStorage.getItem("Orbexpuntos")) || 0;
}
if (usuarioActual) {
    document.getElementById("inicio").innerHTML =
    "<h1>Bienvenido, " + usuarioActual.nombre + "</h1>" +
    "<p>ID: " + usuarioActual.id + " | puntos: " + puntos + "</p>" +
    "<button onclick='verPerfil()'>Ir a mi perfil</button>";
    mostrarRecompensas();
    actualizarStatPuntos();
}

function guardarPuntos() {
    localStorage.setItem("Orbexpuntos", puntos.toString());
}

function ingresar() {
    document.getElementById("modal-registro").classList.add("mostrar");
}

function mostrarToast(mensaje) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }
    toast.textContent = mensaje;
    toast.classList.add("mostrar");
    setTimeout(function() {
        toast.classList.remove("mostrar");
    }, 2500);
}

function cerrarModal() {
    document.getElementById("modal-registro").classList.remove("mostrar");
}

function registrarDesdeModal() {
    let nombre = document.getElementById("input-nombre").value.trim();
    let id = document.getElementById("input-id").value.trim();
    if (!nombre || !id) {
        mostrarToast("Completa todos los campos");
        return;
    }
    usuarioActual = { nombre: nombre, id: id };
    puntos = 0;
    guardarusuario();
    guardarPuntos();
    cerrarModal();
    document.getElementById("inicio").innerHTML =
        "<h1>Bienvenido, " + nombre + "</h1>" +
        "<p>ID: " + id + " | Puntos: " + puntos + "</p>" +
        "<button onclick='verPerfil()'>Ir a mi perfil</button>";
    mostrarRecompensas();
    actualizarStatPuntos();
}
function guardarusuario() {
    localStorage.setItem("Orbexusuario", JSON.stringify(usuarioActual));
}

function vistaPreviaFoto(event) {
    let archivo = event.target.files[0];
    if (!archivo) return;
    let lector = new FileReader();
    lector.onload = function(e) {
        document.getElementById("foto-imagen").src = e.target.result;
        document.getElementById("foto-preview").style.display = "block";
        document.getElementById("foto-texto").textContent = "✅ Foto seleccionada";
        window.fotoBase64 = e.target.result;
    };
    lector.readAsDataURL(archivo);
}

function registrarReciclaje() {
    if (!usuarioActual) {
        mostrarToast("Primero debes registrarte");
        return;
    }
    if (!window.fotoBase64) {
        mostrarToast("Debes seleccionar una foto");
        return;
    }
    let tipo = document.getElementById("tipoMaterial").value;
    let kg = parseFloat(document.getElementById("cantidadKg").value);
    if (!kg || kg <= 0) {
        mostrarToast("Ingresa una cantidad válida");
        return;
    }
    let puntosGanados = puntuajeMateriales[tipo] * kg;

    let pendientes = JSON.parse(localStorage.getItem("Orbexpendientes") || "[]");
    pendientes.push({
        id: Date.now(),
        estudiante: usuarioActual.nombre,
        idEstudiante: usuarioActual.id,
        tipo: tipo,
        kg: kg,
        puntos: puntosGanados,
        foto: window.fotoBase64,
        fecha: new Date().toLocaleString("es-CO"),
        estado: "pendiente"
    });
    localStorage.setItem("Orbexpendientes", JSON.stringify(pendientes));

    document.getElementById("mensajeReciclaje").textContent =
        "✅ Evidencia enviada. Espera validación para recibir +" + puntosGanados + " puntos";
    document.getElementById("cantidadKg").value = "";
    document.getElementById("foto-preview").style.display = "none";
    document.getElementById("foto-texto").textContent = "Haz clic para seleccionar una foto";
    document.getElementById("foto-input").value = "";
    window.fotoBase64 = null;
}
function mostrarRecompensas() {
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; max-width: 1000px; margin: 0 auto;">';
    catalogoRecompensas.forEach(function(r) {
        let puede = puntos >= r.puntos;
        html += '<div style="background: rgba(17,25,22,0.8); border: 1px solid ' + (puede ? '#22c55e' : 'rgba(34,197,94,0.2)') + '; border-radius: 16px; padding: 25px 20px; text-align: center;">' +
            '<h3 style="color: #22c55e; margin-bottom: 10px;">' + r.nombre + '</h3>' +
            '<p style="color: #6b7280; margin-bottom: 15px;">' + r.puntos + ' pts</p>' +
            (puede ? '<button onclick="canjear(' + r.puntos + ', \'' + r.nombre + '\')" style="background: #22c55e; color: #0a0f0d; border: none; padding: 10px 25px; border-radius: 8px; font-weight: bold; cursor: pointer;">Canjear</button>' : '<button disabled style="background: rgba(255,255,255,0.05); color: #6b7280; border: none; padding: 10px 25px; border-radius: 8px; cursor: not-allowed;">Sin puntos</button>') +
            '</div>';
    });
    html += '</div>';
    document.getElementById("lista-recompensas").innerHTML = html;
}

function canjear(costo, nombre) {
    if (puntos < costo) {
        mostrarToast("No tienes suficientes puntos");
        return;
    }
    puntos -= costo;
    guardarPuntos();
    // Guardar historial de canjes
    let canjes = JSON.parse(localStorage.getItem("Orbexcanjes_" + usuarioActual.id) || "[]");
    canjes.push({ nombre: nombre, puntos: costo, fecha: new Date().toLocaleString("es-CO") });
    localStorage.setItem("Orbexcanjes_" + usuarioActual.id, JSON.stringify(canjes));
    mostrarRecompensas();
    actualizarStatPuntos();
    if (usuarioActual) {
        document.getElementById("inicio").innerHTML =
            "<h1>" + usuarioActual.nombre + "</h1>" +
            "<p>ID: " + usuarioActual.id + " | Puntos: " + puntos + "</p>" +
            "<button onclick='verPerfil()'>Ir a mi perfil</button>";
    }
    mostrarToast("¡Canjeaste: " + nombre + "!");
}

function actualizarStatPuntos() {
    let el = document.getElementById("stat-puntos");
    if (el) el.textContent = puntos;
}

function abrirValidacion() {
    let clave = prompt("Ingresa la clave de validador:");
    if (clave === "orbex2026") {
        document.getElementById("panel-validacion").classList.add("mostrar");
        cargarPendientes();
    } else {
        mostrarToast("Clave incorrecta");
    }
}

function cerrarValidacion() {
    document.getElementById("panel-validacion").classList.remove("mostrar");
}

function cargarPendientes() {
    let pendientes = JSON.parse(localStorage.getItem("Orbexpendientes") || "[]");
    let html = "";

    if (pendientes.length === 0) {
        html = '<p style="color: #6b7280; text-align: center;">No hay registros pendientes</p>';
    } else {
        pendientes.forEach(function(p, i) {
            if (p.estado === "pendiente") {
                html += '<div style="background: rgba(17,25,22,0.9); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 15px; margin-bottom: 10px;">' +
                    '<p><strong>' + p.estudiante + '</strong> (ID: ' + p.idEstudiante + ')</p>' +
                    '<p>' + p.kg + ' kg de ' + p.tipo + ' → <strong>+' + p.puntos + ' pts</strong></p>' +
                    (p.foto ? '<img src="' + p.foto + '" style="width:100%; max-height:150px; object-fit:cover; border-radius:8px; margin:10px 0;">' : '') +
                    '<p style="color: #6b7280; font-size: 0.85rem;">' + p.fecha + '</p>' +
                    '<div style="display: flex; gap: 10px; margin-top: 10px;">' +
                    '<button onclick="aprobar(' + i + ')" style="background: #22c55e; color: #0a0f0d; border: none; padding: 8px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">✅ Aprobar</button>' +
                    '<button onclick="rechazar(' + i + ')" style="background: #ef4444; color: white; border: none; padding: 8px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">❌ Rechazar</button>' +
                    '</div></div>';
            }
        });
    }

    document.getElementById("lista-pendientes").innerHTML = html;
}

function aprobar(index) {
    let pendientes = JSON.parse(localStorage.getItem("Orbexpendientes") || "[]");
    let p = pendientes[index];
    if (!p || p.estado !== "pendiente") return;

    p.estado = "aprobado";

    // Sumar puntos al estudiante
    let puntosEst = parseInt(localStorage.getItem("Orbexpuntos_" + p.idEstudiante) || "0");
    puntosEst += p.puntos;
    localStorage.setItem("Orbexpuntos_" + p.idEstudiante, puntosEst.toString());

    localStorage.setItem("Orbexpendientes", JSON.stringify(pendientes));

    // Si el usuario actual es el que recibe los puntos, actualizar en vivo
    if (usuarioActual && usuarioActual.id === p.idEstudiante) {
        puntos = puntosEst;
        guardarPuntos();
        mostrarRecompensas();
        actualizarStatPuntos();
    }

    mostrarToast("Aprobado: +" + p.puntos + " pts para " + p.estudiante);
    cargarPendientes();
}

function rechazar(index) {
    let pendientes = JSON.parse(localStorage.getItem("Orbexpendientes") || "[]");
    let p = pendientes[index];
    if (!p || p.estado !== "pendiente") return;

    p.estado = "rechazado";
    localStorage.setItem("Orbexpendientes", JSON.stringify(pendientes));

    mostrarToast("Registro rechazado");
    cargarPendientes();
}

function verPerfil() {
    document.getElementById("perfil").style.display = "block";
    document.getElementById("perfil").scrollIntoView({ behavior: "smooth" });
    document.getElementById("perfil-nombre").textContent = usuarioActual.nombre;
    document.getElementById("perfil-id").textContent = "ID: " + usuarioActual.id;
    document.getElementById("perfil-avatar").textContent = usuarioActual.nombre.charAt(0).toUpperCase();
    actualizarPerfil();
}

function actualizarPerfil() {
    document.getElementById("perfil-puntos").textContent = puntos;
    let pendientes = JSON.parse(localStorage.getItem("Orbexpendientes") || "[]");
    let misRegistros = pendientes.filter(function(p) { return p.idEstudiante === usuarioActual.id; });
    let aprobados = misRegistros.filter(function(p) { return p.estado === "aprobado"; });
    let canjes = JSON.parse(localStorage.getItem("Orbexcanjes_" + usuarioActual.id) || "[]");
    document.getElementById("perfil-reciclajes").textContent = aprobados.length;
    document.getElementById("perfil-canjes").textContent = canjes.length;

    let nivel = puntos >= 500 ? "Líder Ambiental" : puntos >= 250 ? "Reciclador" : puntos >= 100 ? "Aprendiz" : "Principiante";
    document.getElementById("perfil-nivel").textContent = "Nivel: " + nivel;

    cargarHistorial();
    cargarCanjesPerfil();
}

function cambiarTab(tab) {
    document.querySelectorAll(".tab").forEach(function(t) { t.classList.remove("activo"); });
    document.querySelectorAll(".tab-contenido").forEach(function(t) { t.classList.remove("activo"); });
    event.target.classList.add("activo");
    document.getElementById("tab-" + tab).classList.add("activo");
}

function cargarHistorial() {
    let pendientes = JSON.parse(localStorage.getItem("Orbexpendientes") || "[]");
    let misRegistros = pendientes.filter(function(p) { return p.idEstudiante === usuarioActual.id; });
    let html = "";
    if (misRegistros.length === 0) {
        html = '<p style="color: #6b7280; text-align: center; padding: 40px;">No has registrado reciclajes aún</p>';
    } else {
        misRegistros.reverse().forEach(function(p) {
            let color = p.estado === "aprobado" ? "#22c55e" : p.estado === "rechazado" ? "#ef4444" : "#f59e0b";
            let texto = p.estado === "aprobado" ? "✅ Aprobado" : p.estado === "rechazado" ? "❌ Rechazado" : "⏳ Pendiente";
            html += '<div style="background: rgba(17,25,22,0.8); border: 1px solid rgba(34,197,94,0.15); border-radius: 12px; padding: 15px; margin-bottom: 10px;">' +
                '<div style="display: flex; justify-content: space-between; align-items: start;">' +
                '<div><p style="font-weight: 600;">' + p.kg + ' kg de ' + p.tipo + '</p>' +
                '<p style="color: #6b7280; font-size: 0.85rem;">' + p.fecha + '</p></div>' +
                '<div style="text-align: right;"><span style="color: ' + color + '; font-weight: 600;">' + texto + '</span>' +
                '<p style="color: #22c55e; font-weight: bold;">+' + p.puntos + ' pts</p></div></div>' +
                (p.foto ? '<img src="' + p.foto + '" style="width:60px; height:60px; object-fit:cover; border-radius:8px; margin-top:8px;">' : '') +
                '</div>';
        });
    }
    document.getElementById("lista-historial").innerHTML = html;
}

function cargarCanjesPerfil() {
    let canjes = JSON.parse(localStorage.getItem("Orbexcanjes_" + usuarioActual.id) || "[]");
    let html = "";
    if (canjes.length === 0) {
        html = '<p style="color: #6b7280; text-align: center; padding: 40px;">No has canjeado recompensas aún</p>';
    } else {
        canjes.reverse().forEach(function(c) {
            html += '<div style="background: rgba(17,25,22,0.8); border: 1px solid rgba(34,197,94,0.15); border-radius: 12px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">' +
                '<div><p style="font-weight: 600;">🎁 ' + c.nombre + '</p>' +
                '<p style="color: #6b7280; font-size: 0.85rem;">' + c.fecha + '</p></div>' +
                '<span style="color: #ef4444; font-weight: bold;">-' + c.puntos + ' pts</span></div>';
        });
    }
    document.getElementById("lista-canjes-perfil").innerHTML = html;
}
function cerrarSesion() {
    usuarioActual = null;
    puntos = 0;
    location.reload();
}