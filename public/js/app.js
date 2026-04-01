const myModal = new bootstrap.Modal('#transaction-modal');
let logged = sessionStorage.getItem("logged");
const session = localStorage.getItem("session");
let cashIn = [];
let cashOut = [];
let data = {
    transactions: [],
};

checkLogged();

function userHeader() {
    let header = null;

    if(logged) {
        const user = JSON.parse(logged);
        header = {'user': user.login, 'password': user.password} // ✅ .login
    } else {
        const user = JSON.parse(session);
        header = {'user': user.login, 'password': user.password} // ✅ .login
    }

    return header;
}

document.getElementById("button-logout").addEventListener("click", logout);
document
    .getElementById("transactions-button")
    .addEventListener("click", function() {
        window.location.href = "transactions.html";
    });

document
    .getElementById("transaction-form")
    .addEventListener("submit", function(e) {
        e.preventDefault(); 
        const value = parseFloat(document.getElementById("value-input").value);
        const description = document.getElementById("description-input").value;
        const date = document.getElementById("date-input").value;
        const type = document.querySelector('input[name="inlineRadioOptions"]:checked').value; // name="inlineRadioOptions" Conforme home.html      

    axios
        .post("http://localhost:3333/transactions",             
            {
                value,
                type: Number(type),
                description,
                date,
            },
            {
                headers: userHeader(),
            }
        )
        .then(function (response) {
            // manipula a resposta da requisição
            console.log(response);
            e.target.reset() ;
            myModal.hide();          
            
            alert(response.data.msg);
            
            getTransactions();            
        })
        .catch(function (error) {
            alert(error.response.data.msg)                        
        });
    });

function getTransactions() {
    axios
        .get("http://localhost:3333/transactions",             
            {
                headers: userHeader(),
            }
        )
        .then(function (response) {
            // manipula a resposta da requisição
            console.log(response);      
            
            data.transactions = response.data.data;
            
            getCashIn();
            getCashOut();
            getTotal();                
            
        })
        .catch(function (error) {
            alert(error.response.data.msg)                        
        })
}

function checkLogged() {
    if(session) {
        sessionStorage.setItem("logged", session);
        logged = session;
    }

    if(!logged) {
        window.location.href = "index.html";
        return;
    }

    const dataUser = localStorage.getItem(logged);
    if(dataUser) {
        data = JSON.parse(dataUser);
        
    }

    getTransactions();    
}

function logout() {
    sessionStorage.removeItem("logged");
    localStorage.removeItem("session"); 

    window.location.href = "index.html";
}

function getCashIn() {
    const transactions = data.transactions;

    const cashIn = transactions
        .map((t, index) => ({ ...t, index }))
        .filter((item) => item.type === 1);

    if (cashIn.length) {
        let cashInHtml = ``;
        let limit = cashIn.length > 5 ? 5 : cashIn.length;

        for (let i = 0; i < limit; i++) {
            cashInHtml += `
            <div class="row mb-4">
                <div class="col-12">
                    <h3 class=""fs-12>R$ ${cashIn[i].value}</h3>
                    <div class="container p-0">
                        <div class="row align-items-center">

                            <div class="col-8 d-flex justify-content-between">
                                <p class="m-0">${cashIn[i].description}</p>
                                <span>${formatDate(cashIn[i].date)}</span>
                            </div>

                            <div class="col-4 d-flex justify-content-end">
                                <button class="btn btn-sm btn-outline-primary" onclick="editTransaction(${cashIn[i].index})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteTransaction(${cashIn[i].index})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            `;
        }

        document.getElementById("cash-in-list").innerHTML = cashInHtml;
    }
}

function getCashOut() {
    const transactions = data.transactions;
    
    const cashOut = transactions
        .map((t, index) => ({ ...t, index }))
        .filter((item) => item.type === 2);

    if (cashOut.length) {
        let cashOutHtml = ``;
        let limit = cashOut.length > 5 ? 5 : cashOut.length;

        for (let i = 0; i < limit; i++) {
            cashOutHtml += `
            <div class="row mb-4">
                <div class="col-12">
                    <h3 class=""fs-12>R$ ${cashOut[i].value}</h3>
                    <div class="container p-0">
                        <div class="row align-items-center">
                            
                            <div class="col-8 d-flex justify-content-between">
                                <p class="m-0">${cashOut[i].description}</p>
                                <span>${formatDate(cashOut[i].date)}</span>
                            </div>

                            <div class="col-4 d-flex justify-content-end">
                                <button class="btn btn-sm btn-outline-primary" onclick="editTransaction(${cashOut[i].index})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger ms-2" onclick="deleteTransaction(${cashOut[i].index})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            `;
        }

        document.getElementById("cash-out-list").innerHTML = cashOutHtml;
    }
}

function getTotal() {
    const transactions = data.transactions;
    let total = 0;

    transactions.forEach((item) => {
        if(item.type === 1) {
            total += Number(item.value);
        } else {
            total -= Number(item.value);
        }
    });

    document.getElementById("total").innerHTML = `R$ ${total}`;
}

function saveData(data) {
    localStorage.setItem(data.login, JSON.stringify(data));
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