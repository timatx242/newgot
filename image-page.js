// Получение параметров из URL
const urlParams = new URLSearchParams(window.location.search);
const imageId = urlParams.get('id');

// Загрузка данных изображения
document.addEventListener('DOMContentLoaded', async () => {
  // Получаем все карточки с главной страницы
  const response = await fetch('index.html');
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const cards = doc.querySelectorAll('.card');

  // Находим нужную карточку
  const currentCard = Array.from(cards).find(card => {
    const title = card.getAttribute('data-title');
    return title === decodeURIComponent(imageId);
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
    
    const cardElement = document.createElement('div');
    cardElement.innerHTML = `
      <a href="image-page.html?id=${encodeURIComponent(title)}">
        <img src="${image}" alt="${title}">
      </a>
    `;
    
    relatedGrid.appendChild(cardElement);
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
