const myModal = new bootstrap.Modal('#register-modal');
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");

checkLogged();

document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;
    const checkSession = document.getElementById("session-check").checked;   

    axios.post('http://localhost:3333/login', {
        login: email,
        password,
    })
    .then(function (response) {
        // manipula a resposta da requisição
        console.log(response);
        saveSession({ login: email, password }, checkSession);    
        //Se houver conta ir para a home
        window.location.href = "home.html";
    })
    .catch(function (error) {
        const msg = error.response.data.msg
        alert(msg);
    });
});

//CRIAR CONTA
document.getElementById("create-form").addEventListener("submit", function(e) {
    e.preventDefault();
    const email = document.getElementById("email-create-input").value;
    const password = document.getElementById("password-create-input").value;

    if(email.length < 3) {
       alert(`Preencha o campo com um e-mail válido.`);
    }

    if(password.length < 4) {
        alert(`A senha deve ter no mínimo 4 dígitos.`);
        return;
    }

   axios.post('http://localhost:3333/users', {
        login: email,
        password,
    })
    .then(function (response) {
        // manipula a resposta da requisição
        console.log(response);         
        
        myModal.hide();
        
        alert(response.data.msg);
    })
    .catch(function (error) {
        const msg = error.response.data.msg
        alert(msg);
    });    
});

function checkLogged() {
    if(session) {
        sessionStorage.setItem("logged", session);
        logged = session;
    }

    if(logged) {
        window.location.href = "home.html";
    }
}

function saveSession(data, saveSession) {
    if(saveSession) {
        localStorage.setItem("session", JSON.stringify(data));
    }

    sessionStorage.setItem("logged", JSON.stringify(data));
}