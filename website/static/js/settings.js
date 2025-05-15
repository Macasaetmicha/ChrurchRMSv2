document.addEventListener("DOMContentLoaded", () => {
    fetch('/api_db/get-current-user')
        .then(res => res.json())
        .then(user => {
            document.getElementById("name").textContent = user.name;
            document.getElementById("role").textContent = 
                user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();

            document.getElementById("userName").textContent = user.username;
            document.getElementById("email").textContent = user.email;
            document.getElementById("cont_num").textContent = user.contact_number;
        })
        .catch(err => console.error("User fetch failed:", err));

    const buttons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));

            button.classList.add('active');

            sections.forEach(section => section.classList.add('d-none'));

            const targetId = button.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) {
                target.classList.remove('d-none');
            }
        });
    });
});
