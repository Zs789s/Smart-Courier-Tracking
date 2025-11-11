(function(){
    // user.js - fetch orders.json (expected at project root) and render in tables
    const userOrdersTable = document.getElementById('user-orders-table');
    const userOrdersTbody = userOrdersTable ? userOrdersTable.querySelector('tbody') : null;
    const noUserOrders = document.getElementById('no-user-orders');

    // Try common locations for orders.json: ../orders.json (project root from backend/), ./orders.json
    const candidates = ['../orders.json', './orders.json', '/orders.json'];

    function renderUserOrders(orders){
        if(!orders || orders.length === 0){
            if(noUserOrders) noUserOrders.classList.remove('hidden');
            return;
        }
        if(userOrdersTable) userOrdersTable.classList.remove('hidden');
        orders.forEach(o => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${o.tracking_number ?? o.tracking_num ?? ''}</td>
                <td>${o.carrier ?? ''}</td>
                <td>${o.service ?? ''}</td>
                <td>${o.status ?? ''}</td>
                <td>${o.location ?? ''}</td>
                <td>${o.estimated_delivery ?? ''}</td>
                <td>${summarizeHistory(o.history)}</td>
            `;
            userOrdersTbody.appendChild(tr);
        });
    }

    function summarizeHistory(h){
        try{
            if(!h) return '';
            const arr = (typeof h === 'string') ? JSON.parse(h) : h;
            if(!Array.isArray(arr) || arr.length === 0) return '';
            // show the latest 2 status entries
            const recent = arr.slice(0,2).map(e => `${e.date ?? ''} — ${e.status ?? ''} — ${e.location ?? ''}`);
            return recent.join('<br>');
        }catch(e){
            return '';
        }
    }

    async function tryFetchCandidates(list){
        for(const path of list){
            try{
                const res = await fetch(path, {cache: 'no-store'});
                if(!res.ok) continue;
                const payload = await res.json();
                return {path, payload};
            }catch(e){
                // ignore and try next
            }
        }
        return null;
    }

    (async function init(){
        const result = await tryFetchCandidates(candidates);
        if(!result){
            if(noUserOrders) noUserOrders.classList.remove('hidden');
            return;
        }
        const data = result.payload;
        // expect either {orders:[], users:[]} or {orders: [...]} or array-of-orders
        if(Array.isArray(data)){
            renderUserOrders(data);
        }else{
            if(data.orders) renderUserOrders(data.orders);
        }
    })();
})();