async function sendRequest(url, method, data) {
    url = `https://tg-api.tehnikum.school/tehnikum_course/minesweeper/${url}`;

    const options = {
        method,
        headers: {
            'Accept': 'application/json',
        }
    };

    if (method === "POST") {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(data);
    } else if (method === "GET") {
        url += "?" + new URLSearchParams(data);
    }

    let response = await fetch(url, options);
    return await response.json();
}

let username;
let balance;
let points = 1000;
let authorizationForm = document.getElementById("authorization");

authorizationForm.addEventListener("submit", authorization);

async function authorization(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    username = formData.get('username');

    try {
        let response = await sendRequest("user", "GET", { username });
        
        if (response.error) {
            let regResponse = await sendRequest("user", "POST", { username });
            
            if (regResponse.error) {
                alert(regResponse.message);
            } else {
                balance = regResponse.balance;
                showUser();
            }
        } else {
            balance = response.balance;
            showUser();
        }
    } catch (error) {
        console.error("Error during request:", error);
        alert("An error occurred while processing your request.");
    }
}

function showUser() {
    let popUpSection = document.querySelector('section');
    popUpSection.style.display = "none";
    let userInfo = document.querySelector("header span");
    userInfo.innerHTML = `[${username}, ${balance}]`;
    localStorage.setItem("username", username);

    let gameButton = document.getElementById("gameButton");
    if (localStorage.getItem("game_id")) {
        gameButton.setAttribute("data-game", "stop");
    } else {
        gameButton.setAttribute("data-game", "start");
    }
}

document.querySelector('.exit').addEventListener("click", exit);

function exit() {
    let popUpSection = document.querySelector('section');
    popUpSection.style.display = "flex";

    let userInfo = document.querySelector("header span");
    userInfo.innerHTML = `[]`; // Корректное присвоение

    localStorage.removeItem("username");
}

async function checkUser() {
    if (localStorage.getItem("username")) {
        username = localStorage.getItem("username");
        let response = await sendRequest("user", "GET", { username });
        if (response.error) {
            alert(response.message);
        } else {
            balance = response.balance;
            showUser();
        }
    } else {
        let popUpSection = document.querySelector('section');
        popUpSection.style.display = "flex";
    }
}

let pointBtns = document.getElementsByName("point");
pointBtns.forEach(elem => {
    elem.addEventListener('input', setPoints);
});

function setPoints() {
    let checkedBtn = document.querySelector("input:checked");
    if (checkedBtn) { // Проверка на наличие checkedBtn
        points = +checkedBtn.value;
    }
}

let gameButton = document.getElementById("gameButton");
if (gameButton) {
    gameButton.addEventListener("click", startOrStopGame);
}

function startOrStopGame() {
    let option = gameButton.getAttribute("data-game");
    if (option === "start") {
        if (points > 0) {
            startGame();
        }
    } else if (option === "stop") {
        // Логика для остановки игры, если нужно
    }
}

async function startGame() {
    let response = await sendRequest("new_game", "POST", { username, points });
    if (response.error) {
        alert(response.message);
    } else {
        console.log(response);
    }
}
