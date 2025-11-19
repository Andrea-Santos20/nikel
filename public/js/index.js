const myModal = new bootstrap.Modal('#register-modal');

document.getElementById("create-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const email = document.getElementById("email-create-input").value;
    const password = document.getElementById("password-create-input").value;

    if(email.length < 5) {
       alert(`Preencha o campoo com um e-mail válido.`);
    }

    if(password.length < 4) {
        alert(`A senha deve ter no mínimo 4 dígitos.`);
        return;
    }

    saveAccount({ 
        login: email, 
        password: password,
        transactions: [],
    });

    myModal.hide();

    alert("Conta criada com sucesso!");
    
});

function saveAccount(data) {
    localStorage.setItem(data.login, JSON.stringify(data));

}