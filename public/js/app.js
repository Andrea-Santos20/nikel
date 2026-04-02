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
           <div class="mb-3" id="row-${cashIn[i].id}">
                <h3 class="fs-6 fw-bold mb-0">R$ ${cashIn[i].value}</h3>
                <div class="d-flex align-items-center mt-1" style="gap:0">
                    <span class="text-muted small" style="width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${cashIn[i].description}</span>                    
                    <span class="text-muted small" style="width:110px">${formatDate(cashIn[i].date)}</span>
                    <button class="btn btn-sm btn-outline-primary p-0 px-1 ms-1" onclick="editTransaction(${cashIn[i].id}, '${cashIn[i].description}', ${cashIn[i].value}, '${cashIn[i].date}', ${cashIn[i].type})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger p-0 px-1 ms-1" onclick="deleteTransaction(${cashIn[i].id})">
                        <i class="bi bi-trash"></i>
                    </button>
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
            <div class="mb-3" id="row-${cashOut[i].id}">
                <h3 class="fs-6 fw-bold mb-0">R$ ${cashOut[i].value}</h3>
                <div class="d-flex align-items-center mt-1" style="gap:0">
                    <span class="text-muted small" style="width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap">${cashOut[i].description}</span>
                    
                    <span class="text-muted small" style="width:110px">${formatDate(cashOut[i].date)}</span>
                    <button class="btn btn-sm btn-outline-primary p-0 px-1 ms-1" onclick="editTransaction(${cashOut[i].id}, '${cashOut[i].description}', ${cashOut[i].value}, '${cashOut[i].date}', ${cashOut[i].type})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger p-0 px-1 ms-1" onclick="deleteTransaction(${cashOut[i].id})">
                        <i class="bi bi-trash"></i>
                    </button>
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

function editTransaction(id, description, value, date, type) {
    // Busca a linha na tela
    const row = document.getElementById(`row-${id}`);

    // Formata a data para o input (YYYY-MM-DD)
    const dateFormatted = date.split('T')[0];

    // Substitui o conteúdo da linha por campos editáveis
    row.innerHTML = `
        <div class="col-12 d-flex justify-content-between align-items-center gap-2">
            <div class="d-flex gap-2 align-items-center flex-wrap">
                <input type="number" class="form-control form-control-sm" id="edit-value-${id}" value="${value}" style="width:90px">
                <input type="text" class="form-control form-control-sm" id="edit-desc-${id}" value="${description}" style="width:140px">
                <input type="date" class="form-control form-control-sm" id="edit-date-${id}" value="${dateFormatted}" style="width:140px">
                <select class="form-select form-select-sm" id="edit-type-${id}" style="width:100px">
                    <option value="1" ${type == 1 ? 'selected' : ''}>Entrada</option>
                    <option value="2" ${type == 2 ? 'selected' : ''}>Saída</option>
                </select>
            </div>
            <div class="d-flex gap-1">
                <button class="btn btn-sm btn-success" onclick="saveTransaction(${id})">
                    <i class="bi bi-check-lg"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="getTransactions()">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        </div>
    `;
}

function saveTransaction(id) {
    const value = document.getElementById(`edit-value-${id}`).value;
    const description = document.getElementById(`edit-desc-${id}`).value;
    const date = document.getElementById(`edit-date-${id}`).value;
    const type = document.getElementById(`edit-type-${id}`).value;

    axios.put(`http://localhost:3333/transactions/${id}`,
        { value: Number(value), description, date, type: Number(type) },
        { headers: userHeader() }
    )
    .then(function(response) {
        alert(response.data.msg);
        getTransactions(); // recarrega a lista
    })
    .catch(function(error) {
        alert(error.response.data.msg);
    });
}

function deleteTransaction(id) {
    if (!confirm("Tem certeza que deseja excluir este lançamento?")) return;

    axios.delete(`http://localhost:3333/transactions/${id}`,
        { headers: userHeader() }
    )
    .then(function(response) {
        alert(response.data.msg);
        getTransactions(); // recarrega a lista
    })
    .catch(function(error) {
        const msg = error?.response?.data?.msg || "Erro inesperado. Tente novamente.";
        alert(msg);
    });
}