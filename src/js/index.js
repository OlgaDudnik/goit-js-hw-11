import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import './../css/styles.css';
import axios from 'axios';

axios.defaults.baseURL = 'https://pixabay.com/api/';
let searchQuery = '';

const apiParams = {
  key: '27728709-f63cbd1e0c095508b1fe784c9',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  per_page: 40,
};

const gallery = document.querySelector('.gallery');
const form = document.getElementById('search-form');
const searchInput = form.querySelector('input[name="searchQuery"]');
const loadMoreBtn = document.querySelector('.load-more');
let totalPages = 0;
let currentPage = 1;
let isLastPage = false;

function generateUrl() {
  return new URLSearchParams(apiParams).toString();
}

loadMoreBtn.addEventListener('click', onLoadMoreBtn);

function onLoadMoreBtn() {
  currentPage += 1;
  getImages(searchQuery, true);
}

form.addEventListener('submit', e => {
  e.preventDefault();

  let isSameSearchQuery = searchInput.value === searchQuery;

  if (isSameSearchQuery) {
    currentPage += 1;
  } else {
    currentPage = 1;
  }

  if (loadMoreBtn.classList.contains('hidden')) {
    loadMoreBtn.classList.remove('hidden');
  }

  searchQuery = searchInput.value;
  form.reset();

  getImages(searchQuery, isSameSearchQuery);
});

function createMarkup(images) {
  return images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a class="gallery-link" href="${largeImageURL}">
        <div class="photo-card">
          <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          <div class="info">
            <p class="info-item"><b>Likes</b>${likes}</p>
            <p class="info-item"><b>Views</b>${views}</p>
            <p class="info-item"><b>Comments</b>${comments}</p>
            <p class="info-item"><b>Downloads</b>${downloads}</p>
          </div>
        </div>
        </a>`;
      }
    )
    .join('');
}

function getImages(query, loadMore) {
  const apiUrl = '?' + generateUrl() + `&page=${currentPage}&q=${query}`;

  axios
    .get(apiUrl)
    .then(({ data }) => {
      if (loadMore) {
        gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
      } else {
        gallery.innerHTML = createMarkup(data.hits);
      }

      if (!data.totalHits) {
        loadMoreBtn.classList.add('hidden');
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      } else {
        createMarkup(data.hits);
        let simpleLightBox = new SimpleLightbox('.gallery a');
        Notify.success(`Hooray! We found ${data.totalHits} images.`);
      }

      totalPages = Math.ceil(data.totalHits / apiParams.per_page);

      if (currentPage >= totalPages) {
        loadMoreBtn.classList.add('hidden');
        Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(error => console.log(error));
}
