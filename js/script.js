// ================= FORMULARIO DE CONFIRMACIÓN DE ASISTENCIA =================
// Se envía el <form> directo a un iframe oculto (target="hidden_iframe"),
// así se evita el bloqueo de CORS que da "fetch" con Apps Script.

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

  // ---------- Solo/a vs En familia ----------
  function actualizarModalidad() {
    const enFamilia = form.querySelector('input[name="modalidad"]:checked');
    if (enFamilia && enFamilia.value === 'Acompañado/a') {
      campoFamilia.hidden = false;
      listaFamilia.querySelectorAll('.input-familia').forEach(function (input) {
        input.disabled = false;
      });
      listaFamilia.querySelectorAll('.input-familia')[0].required = true;
      btnAgregar.disabled = false;
    } else {
      campoFamilia.hidden = true;
      listaFamilia.querySelectorAll('.input-familia').forEach(function (input) {
        input.required = false;
        input.disabled = true;   // clave: así no se manda aunque quede algo escrito
        input.value = '';
      });
      btnAgregar.disabled = true;
    }
  }
  radiosModalidad.forEach(function (radio) {
    radio.addEventListener('change', actualizarModalidad);
  });

  // ---------- Agregar integrantes (máximo 10) ----------
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

  // ---------- Si "No podré asistir": bloquea modalidad y familia ----------
  radiosAsistencia.forEach(function (radio) {
    radio.addEventListener('change', function () {
      const noAsiste = radio.value === 'No podré asistir' && radio.checked;

      radiosModalidad.forEach(function (r) {
        r.disabled = noAsiste;
        r.required = !noAsiste;
        if (noAsiste) r.checked = false;
      });

      if (noAsiste) {
        campoFamilia.hidden = true;
        listaFamilia.querySelectorAll('.input-familia').forEach(function (input) {
          input.required = false;
          input.disabled = true;
        });
        btnAgregar.disabled = true;
        campoModalidad.classList.add('campo-bloqueado');
      } else {
        campoModalidad.classList.remove('campo-bloqueado');
        listaFamilia.querySelectorAll('.input-familia').forEach(function (input) {
          input.disabled = false;
        });
        btnAgregar.disabled = false;
        actualizarModalidad();
      }
    });
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