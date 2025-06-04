// ==================== МОДАЛЬНОЕ ОКНО ====================
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const downloadBtn = document.getElementById('downloadBtn');
const closeModal = document.getElementById('closeModal');

// Обработка клика по карточке
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    const image = card.getAttribute('data-image');
    const title = card.getAttribute('data-title');
    const description = card.getAttribute('data-description');
    const pdf = card.getAttribute('data-pdf');

    modalImage.src = image;
    modalTitle.textContent = title;
    modalDescription.textContent = description;

    if (pdf && pdf !== '#') {
      downloadBtn.setAttribute('href', pdf);
      downloadBtn.setAttribute('download', '');
    } else {
      downloadBtn.setAttribute('href', '#');
      downloadBtn.removeAttribute('download');
    }

    modal.classList.add('show');
    const hash = title.replace(/\s+/g, '-');
    history.replaceState(null, "", `#${hash}`);
  });
});

// Закрытие модального окна по кнопке
closeModal.addEventListener('click', () => {
  modal.classList.remove('show');
  history.replaceState(null, "", location.pathname);
});

// Закрытие модального окна по клику вне его области
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('show');
    history.replaceState(null, "", location.pathname);
  }
});

// ==================== ПОИСК ====================
const searchInput = document.getElementById('searchInput');
const searchForm = document.querySelector('.search-wrapper');

// Перехватываем отправку формы поиска и ввод текста
if (searchForm) {
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    redirectToSearchPage();
  });

  searchInput.addEventListener('input', () => {
    // Можно добавить задержку для предотвращения слишком частых редиректов
    // setTimeout(redirectToSearchPage, 300);
  });
}

// Функция для перенаправления на главную страницу с параметром поиска
function redirectToSearchPage() {
  const query = searchInput.value.trim();
  const baseUrl = window.location.origin + '/index.html';
  const searchParams = new URLSearchParams();
  if (query) {
    searchParams.set('search', query);
  }
  const newUrl = `${baseUrl}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  window.location.href = newUrl; // Перенаправляем пользователя
}

// Код ниже выполняется ТОЛЬКО на главной странице (index.html)
// Проверяем, находимся ли мы на главной странице
if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
  const gallery = document.getElementById('gallery');
  const cards = document.querySelectorAll('.card');
  const cardCount = cards.length;
  const cardsPerPage = 36;
  let currentPage = 1;

  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');

  // Функция для отображения карточек на текущей странице
  function displayCards() {
    const startIndex = (currentPage - 1) * cardsPerPage;
    const endIndex = startIndex + cardsPerPage;

    cards.forEach((card, index) => {
      if (index >= startIndex && index < endIndex) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });

    // Обновление состояния кнопок пагинации
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = endIndex >= cardCount;

    // Прокрутка к началу галереи при смене страницы
    if (gallery) {
      gallery.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Функция поиска (работает только на главной странице)
  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    let found = false;
    
    // Сброс пагинации при поиске
    currentPage = 1;

    cards.forEach(card => {
      const title = card.getAttribute('data-title')?.toLowerCase() || '';
      const description = card.getAttribute('data-description')?.toLowerCase() || '';
      const pdf = card.getAttribute('data-pdf')?.toLowerCase() || '';

      const match = title.includes(query) || description.includes(query) || pdf.includes(query);
      card.style.display = match ? 'block' : 'none';

      if (match) {
        found = true;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Если есть результаты поиска, отключаем пагинацию
    if (query) {
      if (prevPageBtn) prevPageBtn.style.display = 'none';
      if (nextPageBtn) nextPageBtn.style.display = 'none';
    } else {
      // Если поиск сброшен, включаем пагинацию и отображаем карточки для текущей страницы
      if (prevPageBtn) prevPageBtn.style.display = 'inline-block';
      if (nextPageBtn) nextPageBtn.style.display = 'inline-block';
      displayCards();
    }

    // Обновление URL с параметрами поиска (только на главной)
    const searchParams = new URLSearchParams(window.location.search);
    if (query) {
      searchParams.set('search', query);
    } else {
      searchParams.delete('search');
    }
    const newUrl = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }

  // Инициализация поиска или пагинации при загрузке главной страницы
  document.addEventListener('DOMContentLoaded', () => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get('search');

    if (searchInput && searchQuery) {
      searchInput.value = searchQuery;
      performSearch();
    } else {
      // Если нет поискового запроса, проверяем хэш для открытия карточки ИЛИ отображаем первую страницу пагинации
      const hash = decodeURIComponent(window.location.hash.substring(1));
      if (!hash) {
         displayCards(); // Отображаем первую страницу, если нет хэша
      } else {
        // Если есть хэш, пытаемся открыть карточку (существующая логика)
        const allCards = document.querySelectorAll('.card');
        const targetCard = [...allCards].find(card => card.getAttribute("data-title").toLowerCase() === hash.replace(/-/g, ' ').toLowerCase());
        if (targetCard) targetCard.click(); // Это вызовет модалку или переход, если модалка удалена
      }
    }
  });

  // Обработчики событий для кнопок пагинации
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        displayCards();
      }
    });
  }

  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(cardCount / cardsPerPage);
      if (currentPage < totalPages) {
        currentPage++;
        displayCards();
      }
    });
  }
}

// Код ниже выполняется на ВСЕХ страницах
// ==================== УСЛОВИЯ ПОЛЬЗОВАНИЯ ====================
document.getElementById("termsBtn").addEventListener("click", () => {
  document.getElementById("termsModal").classList.add("show");
});
document.getElementById("closeTerms").addEventListener("click", () => {
  document.getElementById("termsModal").classList.remove("show");
});
document.getElementById("termsModal").addEventListener("click", (e) => {
  const modalContent = document.querySelector("#termsModal .modal-content");
  if (!modalContent.contains(e.target)) {
    document.getElementById("termsModal").classList.remove("show");
  }
});

// ==================== ЗАЩИТА ОТ ПРОСМОТРА КОДА ====================
/*
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.key === 'F12') e.preventDefault();
  if (e.ctrlKey && ['u', 's'].includes(e.key.toLowerCase())) e.preventDefault();
  if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) e.preventDefault();
});
*/

// ==================== ПОДСТАВИТЬ PDF ИЗ GOOGLE SHEETS ====================
fetch("https://script.google.com/macros/s/AKfycbysxY9hP1_gHHiVZNdZ3p3vmXJj79nfJ6E7XnOKJPQstd4L2C-XjcYNK-EsmB1T0SUv/exec")
  .then(res => res.json())
  .then(data => {
    const allCards = document.querySelectorAll(".card");
    allCards.forEach(card => {
      const title = card.getAttribute("data-title");
      const match = data.find(item => item.name === title);
      if (match) {
        card.setAttribute("data-pdf", match.pdf);
      }
    });

    // Открыть модальное окно если есть хэш в URL, но только на главной странице
    const urlHash = decodeURIComponent(location.hash.slice(1)).replace(/-/g, ' ').toLowerCase();
    const targetCard = [...allCards].find(card => card.getAttribute("data-title").toLowerCase() === urlHash);
    // Ensure this only runs on index.html and not on image-page.html
    if ((window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) && targetCard) {
        targetCard.click();
    }
  });

// ==================== ОТКРЫТИЕ КАРТОЧКИ ПО ЯКОРЮ ====================
window.addEventListener('DOMContentLoaded', () => {
  const hash = decodeURIComponent(window.location.hash.substring(1));
  if (!hash) return;

  const cards = document.querySelectorAll('.card');
  // Add a check to ensure this only runs on index.html
  if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('/index.html')) {
      const targetCard = [...cards].find(card => card.getAttribute("data-title").toLowerCase() === hash.replace(/-/g, ' ').toLowerCase());
      if (targetCard) targetCard.click();
  }
});
