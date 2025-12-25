// js/api/wordpressApi.js
const apiUrl = "https://www.veronicabp.no/wp-json/wp/v2/posts";
let offset = 0;

import { displayErrorMessage, removeErrorMessage } from "./error-message.js";

function showLoadingIndicator(container) {
  const loadingIndicator = document.createElement("div");
  loadingIndicator.classList.add("loading-indicator");
  container.appendChild(loadingIndicator);
}

function hideLoadingIndicator() {
  const loadingIndicator = document.querySelector(".loading-indicator");
  if (loadingIndicator) loadingIndicator.remove();
}

// Henter første <img> fra post.content.rendered (fallback hvis ingen featured image finnes)
function getFirstImageFromContent(post) {
  const html = post?.content?.rendered || "";
  const match = html.match(/<img[^>]+src="([^">]+)"/i);
  return match ? match[1] : "";
}

function getPostImageUrl(post) {
  const embeddedUrl =
    post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
  return embeddedUrl || getFirstImageFromContent(post) || "";
}

async function fetchPosts() {
  try {
    const response = await fetch(
      `${apiUrl}?_embed&per_page=10&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error(`Network response was not ok (status ${response.status})`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
}

async function displayPosts() {
  const blogContainer = document.querySelector(".blog-container");
  showLoadingIndicator(blogContainer);

  try {
    const posts = await fetchPosts();
    hideLoadingIndicator();

    if (!posts || posts.length === 0) {
      return;
    }

    posts.forEach((post) => {
      const imageUrl = getPostImageUrl(post);

      const blogSection = document.createElement("section");
      blogSection.classList.add("blog-section");

      const leftContainer = document.createElement("div");
      leftContainer.classList.add("left-blog-container");
      leftContainer.innerHTML = `
        <div class="container-text">
          <h2 class="text-blog-container">${post.title.rendered}</h2>
          <a href="post.html?id=${post.id}" class="cta-blog">READ HERE</a>
        </div>
      `;

      const rightContainer = document.createElement("div");
      rightContainer.classList.add("right-blog-container");
      rightContainer.innerHTML = `
        <img class="blog-img" src="${imageUrl}" alt="${post.title.rendered}">
      `;

      blogSection.appendChild(leftContainer);
      blogSection.appendChild(rightContainer);
      blogContainer.appendChild(blogSection);
    });

    offset += 10;
    removeErrorMessage(); // rydder feilmelding hvis det tidligere feilet
  } catch (error) {
    console.error("Error displaying posts:", error);
    displayErrorMessage(
      "Something went wrong while retrieving posts. Please try again later."
    );
  } finally {
    hideLoadingIndicator();
  }
}

document.querySelector(".cta-blog-bottom").addEventListener("click", (event) => {
  event.preventDefault();
  displayPosts();
});

window.addEventListener("load", displayPosts);
