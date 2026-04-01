const myModal = new bootstrap.Modal('#transaction-modal');
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");
let data = {
    transactions: []
};

checkLogged();

function userHeader() {
    let header = null;

    if (logged) {
        const user = JSON.parse(logged);
        header = { 'user': user.login, 'password': user.password }; // ✅ .login
    } else {
        const user = JSON.parse(session);
        header = { 'user': user.login, 'password': user.password }; // ✅ .login
    }

    return header;
}

document.getElementById("button-logout").addEventListener("click", logout);

document
    .getElementById("transaction-form")
    .addEventListener("submit", function(e) {
        e.preventDefault();

        const value = parseFloat(document.getElementById("value-input").value);
        const description = document.getElementById("description-input").value;
        const date = document.getElementById("date-input").value;
        const type = document.querySelector('input[name="inlineRadioOptions"]:checked').value;

        // ✅ axios DENTRO do listener
        axios
            .post("http://localhost:3333/transactions",
                { value, type: Number(type), description, date },
                { headers: userHeader() }
            )
            .then(function(response) {
                console.log(response);
                e.target.reset();
                myModal.hide();
                alert(response.data.msg);
                getTransactions(); // ✅ nome correto
            })
            .catch(function(error) {
                alert(error.response.data.msg);
            });
    }); // ✅ fecha o addEventListener aqui

function getTransactions() {
    axios
        .get("http://localhost:3333/transactions", {
            headers: userHeader() // ✅ corrigido: era "headres: userHeader" (sem parênteses)
        })
        .then(function(response) {
            console.log(response);
            data.transactions = response.data.data;

            let transactionsHTML = ``;

            if (data.transactions.length) {
                data.transactions.forEach((item) => {
                    let type = "Entrada";
                    if (item.type === 2) {
                        type = "Saída";
                    }
                    transactionsHTML += `
                        <tr>
                            <th scope="row">${formatDate(item.date)}</th>
                            <td>${item.value}</td>
                            <td>${type}</td>
                            <td>${item.description}</td>
                        </tr>
                    `;
                });
            }

            document.getElementById("transactions-list").innerHTML = transactionsHTML;
        })
        .catch(function(error) {
            alert(error.response.data.msg);
        });
}

function checkLogged() {
    if (session) {
        sessionStorage.setItem("logged", session);
        logged = session;
    }

    if (!logged) {
        window.location.href = "index.html";
        return;
    }

    getTransactions();
}

function logout() {
    sessionStorage.removeItem("logged");
    localStorage.removeItem("session");
    window.location.href = "index.html";
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC' // evita deslocamento de fuso horário
    });
}