$(document).ready(function () {
  // --- Login ---
  const loginForm = $('#loginForm');
  if (loginForm.length) {
    loginForm.on('submit', function (event) {
      event.preventDefault();
      const email = $('#email').val();
      const password = $('#password').val();

      if (email === 'demo@alke.com' && password === '123456') {
        localStorage.setItem('loginExitoso', 'true');
        window.location.href = 'menu.html';
      } else {
        mostrarMensaje('Credenciales inválidas ❌', 'danger');
      }
    });
  }

  // --- Estado ---
  let saldo = parseInt(localStorage.getItem('saldo')) || 10000;
  let movimientos = JSON.parse(localStorage.getItem('movimientos')) || [];

  // Mostrar saldo con color dinámico
  function mostrarSaldo() {
    $('#saldo').text('$' + saldo);
    $('#saldoMenu').text('$' + saldo);

    // Quitar clases previas
    $('#saldo, #saldoMenu').removeClass('saldo-positive saldo-negative');

    // Aplicar según el valor actual
    if (saldo >= 0) {
      $('#saldo, #saldoMenu').addClass('saldo-positive');
    } else {
      $('#saldo, #saldoMenu').addClass('saldo-negative');
    }
  }

  // --- Mensajes dinámicos ---
  function mostrarMensaje(texto, tipo = 'success') {
    const color = tipo === 'success' ? 'text-success' : 'text-danger';
    $('#mensaje')
      .hide()
      .html(`<p class="${color}">${texto}</p>`)
      .fadeIn(400)
      .delay(2000)
      .fadeOut(400);
  }

  // --- Movimientos y saldo ---
  function guardarMovimiento(tipo, detalle, monto) {
    const fecha = new Date().toLocaleDateString();
    const registro = {
      fecha,
      tipo,
      detalle,
      monto: monto > 0 ? '+' + monto : monto,
      saldo,
    };
    movimientos.push(registro);
    localStorage.setItem('movimientos', JSON.stringify(movimientos));
  }

  function actualizarSaldo(monto) {
    saldo += monto;
    localStorage.setItem('saldo', saldo);
    mostrarSaldo();

    // Animación visual al cambiar
    $('#saldo, #saldoMenu').fadeOut(200).fadeIn(200);
  }

  // --- Depósito ---
  const depositForm = $('#depositForm');
  if (depositForm.length) {
    depositForm.on('submit', function (event) {
      event.preventDefault();
      const monto = parseInt($('#amount').val());
      if (monto > 0) {
        actualizarSaldo(monto);
        guardarMovimiento('Depósito', 'Depósito en efectivo', monto);
        mostrarMensaje(`Depósito realizado ✅ Nuevo saldo: $${saldo}`, 'success');
        depositForm[0].reset();
      } else {
        mostrarMensaje('Ingrese un monto válido ❌', 'danger');
      }
    });
    mostrarSaldo();
  }

  // --- Enviar dinero ---
  const sendForm = $('#sendForm');
  if (sendForm.length) {
    sendForm.on('submit', function (event) {
      event.preventDefault();
      const contacto = $('#contact').val().trim();
      const monto = parseInt($('#sendAmount').val());
      if (contacto !== '' && monto > 0 && monto <= saldo) {
        actualizarSaldo(-monto);
        guardarMovimiento('Envío', contacto, -monto);
        mostrarMensaje(`Transferencia realizada a ${contacto} por $${monto} ✅`, 'success');
        sendForm[0].reset();
      } else {
        mostrarMensaje('Datos inválidos ❌', 'danger');
      }
    });
    mostrarSaldo();
  }

  // --- Recepción de dinero ---
  const receiveForm = $('#receiveForm');
  if (receiveForm.length) {
    receiveForm.on('submit', function (event) {
      event.preventDefault();
      const remitente = $('#sender').val().trim();
      const monto = parseInt($('#receiveAmount').val());
      if (remitente !== '' && monto > 0) {
        actualizarSaldo(monto);
        guardarMovimiento('Recepción', remitente, monto);
        mostrarMensaje(`Has recibido $${monto} de ${remitente} ✅`, 'success');
        receiveForm[0].reset();
      } else {
        mostrarMensaje('Datos inválidos ❌', 'danger');
      }
    });
    mostrarSaldo();
  }

  // --- Autocompletar con resaltado ---
  function getContactos() {
    return $('#contactList li')
      .map(function () {
        return $(this).text().trim();
      })
      .get();
  }

  function renderSugerencias(items, query) {
    const $sug = $('#suggestions');
    $sug.empty();

    if (items.length === 0) {
      $sug.fadeOut(150);
      $('#matchCount').remove();
      $('#contact').after('<small id="matchCount" class="text-danger">Sin coincidencias</small>');
      return;
    }

    items.forEach((c) => {
      const regex = new RegExp(`(${query})`, 'gi');
      const resaltado = c.replace(regex, '<span class="highlight">$1</span>');
      $sug.append(`<li class="list-group-item">${resaltado}</li>`);
    });

    $('#matchCount').remove();
    $('#contact').after(
      `<small id="matchCount" class="text-success">Se encontraron ${items.length} coincidencia(s)</small>`
    );
    $sug.fadeIn(150);
  }

  $('#contact').on('input', function () {
    const query = $(this).val().toLowerCase();
    const contactos = getContactos();

    if (!query) {
      $('#suggestions').fadeOut(150);
      $('#matchCount').remove();
      return;
    }

    const filtrados = contactos.filter((c) => c.toLowerCase().includes(query));
    renderSugerencias(filtrados, query);
  });

  $('#suggestions').on('click', 'li', function () {
    const textoPlano = $(this).text();
    $('#contact').val(textoPlano);
    $('#suggestions').fadeOut(150);
    $('#matchCount').remove();
  });

  $('#contact').on('blur', function () {
    setTimeout(() => {
      $('#suggestions').fadeOut(150);
      $('#matchCount').remove();
    }, 150);
  });

  // --- Agregar nuevo contacto ---
  const addContactForm = $('#addContactForm');
  if (addContactForm.length) {
    addContactForm.on('submit', function (event) {
      event.preventDefault();
      const nuevoContacto = $('#newContact').val().trim();
      if (nuevoContacto !== '') {
        $('#contactList').append(`<li class="list-group-item">${nuevoContacto}</li>`);
        mostrarMensaje('Contacto agregado ✅', 'success');
        addContactForm[0].reset();
      } else {
        mostrarMensaje('Ingrese un contacto válido ❌', 'danger');
      }
    });
  }

  // --- Movimientos dinámicos ---
  const tablaMovimientos = $('#tablaMovimientos');
  if (tablaMovimientos.length) {
    mostrarSaldo();
    movimientos.forEach((mov) => {
      tablaMovimientos.append(`
        <tr>
          <td>${mov.fecha}</td>
          <td>${mov.tipo}</td>
          <td>${mov.detalle}</td>
          <td>${mov.monto}</td>
          <td>${mov.saldo}</td>
        </tr>
      `);
    });
    if (movimientos.length === 0) {
      mostrarMensaje('No hay movimientos registrados aún.', 'danger');
    }
  }

  // --- Animaciones y bienvenida en menú ---
  if (window.location.pathname.includes('menu.html')) {
    if (localStorage.getItem('loginExitoso') === 'true') {
      $('#mensaje')
        .hide()
        .html(
          '<p class="alert alert-success">🎉 Login exitoso, bienvenida Josseline a tu billetera digital</p>'
        )
        .fadeIn(600)
        .delay(2500)
        .fadeOut(600);
      localStorage.removeItem('loginExitoso');
    }
    $('#welcomeTitle').hide().slideDown(800).fadeOut(200).fadeIn(200);
  }

  // --- Cerrar sesión (enlace) ---
  const logoutLink = $('#logoutLink');
  if (logoutLink.length) {
    logoutLink.on('click', function (event) {
      event.preventDefault();
      localStorage.removeItem('loginExitoso');
      mostrarMensaje('Sesión cerrada correctamente 🚪', 'success');
      setTimeout(() => {
        window.location.href = 'index.html'; // o 'login.html'
      }, 1500);
    });
  }

  // --- Inicializar saldo al cargar ---
  mostrarSaldo();
});
