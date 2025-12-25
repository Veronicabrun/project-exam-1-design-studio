// js/modal.js
document.addEventListener("DOMContentLoaded", async function () {
  const API_BASE = "https://www.veronicabp.no/wp-json/wp/v2/posts";

  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  const mainElement = document.querySelector("main");
  const hrLines = document.querySelectorAll(".hr-line");
  const secondHrLineDiv = hrLines?.[1] || null;

  if (!postId) {
    console.error("No post id in URL. Example: post.html?id=49");
    return;
  }

  const loadingIndicator = document.createElement("div");
  loadingIndicator.classList.add("loading-indicator");
  if (secondHrLineDiv) mainElement.insertBefore(loadingIndicator, secondHrLineDiv);
  else mainElement.prepend(loadingIndicator);

  function extractFirstImageUrlFromHtml(html) {
    if (!html) return "";

    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) return match[1];

    const srcsetMatch = html.match(/srcset=["']([^"']+)["']/i);
    if (srcsetMatch && srcsetMatch[1]) {
      const first = srcsetMatch[1].split(",")[0]?.trim()?.split(" ")[0];
      return first || "";
    }

    return "";
  }

  function removeFirstImageFromContent(html) {
    if (!html) return "";

    const figureMatch = html.match(/<figure[\s\S]*?<\/figure>/i);
    if (figureMatch) return html.replace(figureMatch[0], "");

    const imgMatch = html.match(/<img[\s\S]*?>/i);
    if (imgMatch) return html.replace(imgMatch[0], "");

    return html;
  }

  function getBestImageUrl(post) {
    const embeddedUrl = post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";
    const jetpackUrl = post?.jetpack_featured_media_url || "";
    const contentUrl = extractFirstImageUrlFromHtml(post?.content?.rendered || "");

    const best = embeddedUrl || contentUrl || jetpackUrl || "";

    return {
      imageUrl: best,
      usedContentImage: !embeddedUrl && !!contentUrl,
    };
  }

  async function fetchPost() {
    try {
      const url = `${API_BASE}/${postId}?_embed`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch post. Status: ${response.status}`);
      }

      const post = await response.json();
      displayPost(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      loadingIndicator.remove();

      const errorBox = document.createElement("div");
      errorBox.classList.add("error");
      errorBox.textContent = "Could not load the post. Please try again later.";

      if (secondHrLineDiv) mainElement.insertBefore(errorBox, secondHrLineDiv);
      else mainElement.appendChild(errorBox);
    }
  }

  function displayPost(post) {
    loadingIndicator.remove();

    const title = post?.title?.rendered || "Untitled";
    document.title = `${title} | Design Studio`;

    const { imageUrl, usedContentImage } = getBestImageUrl(post);

    const postContainer = document.createElement("section");
    postContainer.classList.add("post-container");

    const postHeaderContainer = document.createElement("div");
    postHeaderContainer.classList.add("post-header-container");

    const postHeader = document.createElement("h2");
    postHeader.classList.add("post-header");
    postHeader.textContent = title;

    postHeaderContainer.appendChild(postHeader);
    postContainer.appendChild(postHeaderContainer);

    if (imageUrl) {
      const postImageContainer = document.createElement("div");
      postImageContainer.classList.add("post-image-container");

      const postImage = document.createElement("img");
      postImage.classList.add("post__image");
      postImage.src = imageUrl;
      postImage.alt = title;

      postImageContainer.appendChild(postImage);
      postContainer.appendChild(postImageContainer);

      postImage.addEventListener("click", function () {
        openModal(imageUrl);
      });
    }

    const postTextContainer = document.createElement("section");
    postTextContainer.classList.add("post-text-container");

    const postText = document.createElement("div");
    postText.classList.add("post-text");

    let contentHtml = post?.content?.rendered || "";
    if (usedContentImage) {
      contentHtml = removeFirstImageFromContent(contentHtml);
    }

    postText.innerHTML = contentHtml;
    postTextContainer.appendChild(postText);
    postContainer.appendChild(postTextContainer);

    const backToAllPostsButton = document.createElement("button");
    backToAllPostsButton.classList.add("back-to-posts");
    backToAllPostsButton.textContent = "ALL POSTS";
    backToAllPostsButton.addEventListener("click", function () {
      window.location.href = "blog.html";
    });
    postContainer.appendChild(backToAllPostsButton);

    if (secondHrLineDiv) mainElement.insertBefore(postContainer, secondHrLineDiv);
    else mainElement.appendChild(postContainer);
  }

  function openModal(imageUrl) {
    const modal = document.getElementById("modal");
    const modalImage = document.getElementById("modal-image");
    if (!modal || !modalImage) return;

    modal.style.display = "block";
    modalImage.src = imageUrl;
  }

  function closeModal() {
    const modal = document.getElementById("modal");
    if (!modal) return;
    modal.style.display = "none";
  }

  window.addEventListener("click", function (event) {
    const modal = document.getElementById("modal");
    if (modal && event.target === modal) closeModal();
  });

  const closeButton = document.querySelector(".close");
  if (closeButton) closeButton.addEventListener("click", closeModal);

  fetchPost();
});
