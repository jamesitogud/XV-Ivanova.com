// ================= FORMULARIO DE CONFIRMACIÓN DE ASISTENCIA =================
// Se envía el <form> directo a un iframe oculto (target="hidden_iframe"),
// así se evita el bloqueo de CORS que da "fetch" con Apps Script.
//
// REGLA DE BLOQUEOS (nada se bloquea por defecto, todo es condicional):
// - Al cargar la página: todo normal, nada en gris.
// - "No podré asistir"            -> gris: "¿Cómo asistirás?" Y "¿Quiénes te acompañarán?"
// - "Sí, asistiré" (solo eso)     -> todo normal, no pasa nada todavía.
// - "Sí, asistiré" + "Solo/a"     -> gris: "¿Quiénes te acompañarán?"
// - "Sí, asistiré" + "Acompañado" -> todo normal, sin restricciones.

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-rsvp');
  const iframe = document.querySelector('iframe[name="hidden_iframe"]');
  if (!form || !iframe) return;

  const MAX_INTEGRANTES = 6;

  const radiosAsistencia = form.querySelectorAll('input[name="asistencia"]');
  const radiosModalidad = form.querySelectorAll('input[name="modalidad"]');
  const campoModalidad = document.getElementById('campo-modalidad');
  const campoFamilia = document.getElementById('campo-familia');
  const listaFamilia = document.getElementById('lista-familia');
  const btnAgregar = document.getElementById('btn-agregar-familia');

  function bloquear(elemento, inputs, si) {
    elemento.classList.toggle('campo-bloqueado', si);
    inputs.forEach(function (input) {
      input.disabled = si;
      if (si && input.type === 'text') input.value = '';
      if (si && input.type === 'radio') input.checked = false;
    });
  }

  function actualizarBloqueos() {
    const asistenciaSel = form.querySelector('input[name="asistencia"]:checked');
    const noAsiste = !!asistenciaSel && asistenciaSel.value === 'No podré asistir';

    const modalidadSel = form.querySelector('input[name="modalidad"]:checked');
    const vaSolo = !!modalidadSel && modalidadSel.value === 'Solo/a';
    const vaAcompanado = !!modalidadSel && modalidadSel.value === 'Acompañado/a';

    // "¿Cómo asistirás a la celebración?" — gris SOLO si no va a asistir
    bloquear(campoModalidad, radiosModalidad, noAsiste);

    // "¿Quiénes te acompañarán?" — gris si no asiste, O si va solo/a
    const bloquearFamilia = noAsiste || vaSolo;
    bloquear(campoFamilia, listaFamilia.querySelectorAll('.input-familia'), bloquearFamilia);
    btnAgregar.disabled = bloquearFamilia;

    const primerInput = listaFamilia.querySelector('.input-familia');
    if (primerInput) primerInput.required = vaAcompanado;
  }

  radiosAsistencia.forEach(function (r) { r.addEventListener('change', actualizarBloqueos); });
  radiosModalidad.forEach(function (r) { r.addEventListener('change', actualizarBloqueos); });
  // Nota: NO se llama actualizarBloqueos() al cargar la página a propósito.
  // Así, mientras nadie haya elegido nada, todo se queda tal cual está en
  // el HTML (sin ningún gris), como debe ser.

  // ---------- Agregar integrantes (máximo 6) ----------
  btnAgregar.addEventListener('click', function () {
    const actuales = listaFamilia.querySelectorAll('.input-familia').length;
    if (actuales >= MAX_INTEGRANTES) {
      btnAgregar.hidden = true;
      return;
    }
    const nuevo = document.createElement('input');
    nuevo.type = 'text';
    nuevo.name = 'familia[]';
    nuevo.className = 'input-familia';
    nuevo.placeholder = 'Nombre de la persona ' + (actuales + 1);
    listaFamilia.appendChild(nuevo);

    if (actuales + 1 >= MAX_INTEGRANTES) {
      btnAgregar.hidden = true;
    }
  });

  // ---------- Envío del formulario ----------
  let yaEnviado = false;

  form.addEventListener('submit', function () {
    const boton = form.querySelector('.btn-rsvp-submit');
    boton.disabled = true;
    boton.textContent = 'Enviando...';
    yaEnviado = true;
  });

  iframe.addEventListener('load', function () {
    if (yaEnviado) {
      window.location.href = 'gracias.html';
    }
  });
});