// js/carousel.js
const apiUrl = "https://www.veronicabp.no/wp-json/wp/v2/posts";
const carouselContainer = document.querySelector(".carousel-container");
const carouselInner = carouselContainer.querySelector(".carousel-inner");
const carouselPrevButton = carouselContainer.querySelector(".carousel-prev");
const carouselNextButton = carouselContainer.querySelector(".carousel-next");

let currentIndex = 0;
let images = [];

const loadingIndicator = document.createElement("div");
loadingIndicator.classList.add("loading-indicator");
carouselContainer.appendChild(loadingIndicator);

function showLoadingIndicator() {
  loadingIndicator.style.display = "block";
}

function hideLoadingIndicator() {
  loadingIndicator.style.display = "none";
}

function getFeaturedImageUrl(post) {
  const embeddedUrl = post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url;

  const contentImg =
    post?.content?.rendered?.match(/<img[^>]+src="([^">]+)"/i)?.[1] || "";

  return embeddedUrl || contentImg || "";
}

async function fetchImages() {
  try {
    showLoadingIndicator();

    const url = `${apiUrl}?_embed&per_page=12`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const posts = await response.json();

    images = posts
      .map((post) => ({
        id: post.id,
        src: getFeaturedImageUrl(post),
        alt: post.title?.rendered || "Blog image",
      }))
      .filter((img) => img.src);

    return images;
  } catch (error) {
    console.error("Error fetching images:", error);
    images = [];
    return [];
  } finally {
    hideLoadingIndicator();
  }
}

function updateCarousel() {
  if (!images || images.length === 0) {
    carouselInner.innerHTML =
      "<p style='padding:10px;'>No images to display.</p>";
    return;
  }

  if (currentIndex < 0) currentIndex = 0;
  if (currentIndex > images.length - 1) currentIndex = images.length - 1;

  carouselInner.innerHTML = "";

  const startIndex = currentIndex;
  const endIndex = Math.min(currentIndex + 3, images.length);

  for (let i = startIndex; i < endIndex; i++) {
    const image = images[i];

    const carouselCard = document.createElement("div");
    carouselCard.classList.add("carousel-card", "carousel-featured");

    const img = document.createElement("img");
    img.classList.add("carousel__image");
    img.src = image.src;
    img.alt = image.alt;
    img.style.opacity = i === currentIndex ? 1 : 0.5;

    const link = document.createElement("a");
    link.href = "blog.html";
    link.appendChild(img);

    carouselCard.appendChild(link);
    carouselInner.appendChild(carouselCard);
  }
}

carouselPrevButton.addEventListener("click", () => {
  currentIndex = Math.max(0, currentIndex - 1);
  updateCarousel();
});

carouselNextButton.addEventListener("click", () => {
  currentIndex = Math.min(currentIndex + 1, images.length - 1);
  updateCarousel();
});

fetchImages().then(updateCarousel);




