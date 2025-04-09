const posts = ["post1.md", "post2.md"];

async function fetchPost(file) {
  const res = await fetch("posts/" + file);
  const text = await res.text();

  const title = text.match(/title: \"(.+?)\"/)?.[1] || "Sin título";
  const category = text.match(/category: \"(.+?)\"/)?.[1] || "General";
  const content = text.split("---").pop();

  return { file, title, category, content };
}

async function render() {
  const url = new URL(window.location.href);
  const show = url.searchParams.get("show");

  if (show) {
    const post = await fetchPost(show);
    document.getElementById("post-content").innerHTML = `
      <h2>${post.title}</h2>
      <div>${post.content}</div>
      <a href="blog.html">← Volver</a>
    `;
    return;
  }

  const allPosts = await Promise.all(posts.map(fetchPost));
  const categories = [...new Set(allPosts.map(p => p.category))];

  if (document.getElementById("filters")) {
    document.getElementById("filters").innerHTML = categories.map(cat =>
      `<button onclick="filter('${cat}')">${cat}</button>`
    ).join("") + `<button onclick="filter()">Todos</button>`;
  }

  showPosts(allPosts);
}

function showPosts(data) {
  const url = new URL(window.location.href);
  const filterCat = url.searchParams.get("cat");

  const list = document.getElementById("post-list") || document.getElementById("latest-posts");
  if (!list) return;

  const filtered = filterCat ? data.filter(p => p.category === filterCat) : data;
  const items = filtered.map(p => `
    <li>
      <a href="blog.html?show=${p.file}">${p.title}</a>
      <p><small>${p.category}</small></p>
    </li>
  `);

  list.innerHTML = items.join("");
}

function filter(cat) {
  const url = new URL(window.location.href);
  if (cat) {
    url.searchParams.set("cat", cat);
  } else {
    url.searchParams.delete("cat");
  }
  window.location.href = url.toString();
}

render();
