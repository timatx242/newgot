// Get image slug from URL path
const pathSegments = window.location.pathname.split('/');
let imageSlug = '';
const imagePageIndex = pathSegments.indexOf('image-page.html');
if (imagePageIndex !== -1 && imagePageIndex + 1 < pathSegments.length) {
    // The slug is the segment immediately after 'image-page.html'
    imageSlug = pathSegments[imagePageIndex + 1];
}

// Convert slug back to title format (replace hyphens with spaces)
const imageTitleFromSlug = decodeURIComponent(imageSlug.replace(/-/g, ' '));

// Загрузка данных изображения
document.addEventListener('DOMContentLoaded', async () => {
  // Получаем все карточки с главной страницы
  const response = await fetch('index.html');
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const cards = doc.querySelectorAll('.card');

  // Находим нужную карточку по заголовку (извлеченному из slug)
  const currentCard = Array.from(cards).find(card => {
    const title = card.getAttribute('data-title');
    return title.toLowerCase() === imageTitleFromSlug.toLowerCase();
  });

  if (currentCard) {
    // Заполняем данные на странице
    const mainImage = document.getElementById('mainImage');
    const imageTitle = document.getElementById('imageTitle');
    const downloadBtn = document.getElementById('downloadBtn');

    mainImage.src = currentCard.getAttribute('data-image');
    mainImage.alt = currentCard.getAttribute('data-title');
    imageTitle.textContent = currentCard.getAttribute('data-title');
    downloadBtn.href = currentCard.getAttribute('data-pdf');

    // Обновляем заголовок страницы
    document.title = currentCard.getAttribute('data-title') + ' - Галерея';

    // Показываем случайные You might also like
    showRandomRelatedImages(cards, currentCard);
  }
});

// Функция для отображения случайных похожих изображений
function showRandomRelatedImages(allCards, currentCard) {
  const relatedGrid = document.getElementById('relatedImages');
  const cardsArray = Array.from(allCards);
  
  // Удаляем текущую карточку из массива
  const filteredCards = cardsArray.filter(card => 
    card.getAttribute('data-title') !== currentCard.getAttribute('data-title')
  );
  
  // Перемешиваем массив
  const shuffled = filteredCards.sort(() => 0.5 - Math.random());
  
  // Берем первые 10 карточек
  const selected = shuffled.slice(0, 10);
  
  // Создаем HTML для похожих изображений
  selected.forEach(card => {
    const title = card.getAttribute('data-title');
    const image = card.getAttribute('data-image');
    const slug = title.toLowerCase().replace(/\s+/g, '-'); // Generate slug for related images
    
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.innerHTML = `
      <a href="image-page.html/${encodeURIComponent(slug)}/">
        <img src="${image}" alt="${title}">
      </a>
    `;
    
    relatedGrid.appendChild(cardElement);
  });
  
  // Remove click listeners from related image cards to prevent modal from opening
  relatedGrid.querySelectorAll('.card').forEach(card => {
      const newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);
  });
}

// Функционал кнопки "Поделиться"
document.getElementById('shareBtn').addEventListener('click', async () => {
  const title = document.getElementById('imageTitle').textContent;
  const url = window.location.href;

  try {
    if (navigator.share) {
      await navigator.share({
        title: title,
        url: url
      });
    } else {
      // Если Web Share API не поддерживается
      await navigator.clipboard.writeText(url);
      alert('Ссылка скопирована в буфер обмена!');
    }
  } catch (err) {
    console.error('Ошибка при попытке поделиться:', err);
  }
}); 
