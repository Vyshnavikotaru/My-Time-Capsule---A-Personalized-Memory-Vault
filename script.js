document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("memory-form");
    const memoryList = document.getElementById("memory-list");
    const themeToggle = document.getElementById("theme-toggle");
    const searchInput = document.getElementById("search-input");
    const filterCategory = document.getElementById("filter-category");

    let memories = JSON.parse(localStorage.getItem("memories")) || [];
    let editIndex = null;

    // Set footer year
    document.getElementById("year").textContent = new Date().getFullYear();

    function saveToLocalStorage() {
        localStorage.setItem("memories", JSON.stringify(memories));
    }

    function renderMemories() {
        memoryList.innerHTML = "";
        const today = new Date();
        const searchText = searchInput.value.toLowerCase();
        const selectedCategory = filterCategory.value;

        // Filter memories
        const filtered = memories.filter(memory => {
            const matchesSearch = memory.title.toLowerCase().includes(searchText);
            const matchesCategory = selectedCategory === "all" || memory.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        if (filtered.length === 0) {
            memoryList.innerHTML = "<p style='text-align:center;opacity:0.7;'>No memories found.</p>";
            return;
        }

        filtered.forEach((memory, index) => {
            const unlockDate = new Date(memory.unlockDate);
            const isUnlocked = unlockDate <= today;

            const card = document.createElement("div");
            card.classList.add("card", isUnlocked ? "unlocked" : "locked");

            let content = `
                <span class="badge">${memory.category}</span>
                <h3>${memory.title}</h3>
                <small>Unlock Date: ${memory.unlockDate}</small><br>
            `;

            if (isUnlocked) {
                content += `<p>${memory.description}</p>`;
            } else {
                const countdown = Math.ceil((unlockDate - today) / (1000 * 60 * 60 * 24));
                content += `<p>🔒 Locked - Opens in ${countdown} day${countdown !== 1 ? "s" : ""}</p>`;
            }

            content += `
                <div style="margin-top:8px;">
                    <button onclick="editMemory(${memories.indexOf(memory)})">✏ Edit</button>
                    <button onclick="deleteMemory(${memories.indexOf(memory)})">🗑 Delete</button>
                </div>
            `;
            card.innerHTML = content;
            memoryList.appendChild(card);
        });
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const category = document.getElementById("category").value;
        const unlockDate = document.getElementById("unlock-date").value;

        if (!title || !description || !category || !unlockDate) return;

        if (editIndex !== null) {
            memories[editIndex] = { title, description, category, unlockDate };
            editIndex = null;
            form.querySelector("button[type='submit']").textContent = "💾 Save Memory";
        } else {
            memories.push({ title, description, category, unlockDate });
        }

        saveToLocalStorage();
        renderMemories();
        form.reset();
    });

    window.editMemory = (index) => {
        const memory = memories[index];
        document.getElementById("title").value = memory.title;
        document.getElementById("description").value = memory.description;
        document.getElementById("category").value = memory.category;
        document.getElementById("unlock-date").value = memory.unlockDate;
        editIndex = index;
        form.querySelector("button[type='submit']").textContent = "✅ Update Memory";
        window.scrollTo({ top: form.offsetTop, behavior: "smooth" });
    };

    window.deleteMemory = (index) => {
        if (confirm("Are you sure you want to delete this memory?")) {
            memories.splice(index, 1);
            saveToLocalStorage();
            renderMemories();
        }
    };

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        themeToggle.textContent = document.body.classList.contains("dark") ? "☀ Light Mode" : "🌙 Dark Mode";
    });

    searchInput.addEventListener("input", renderMemories);
    filterCategory.addEventListener("change", renderMemories);

    renderMemories();
});
