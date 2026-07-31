(function () {
    function tentarAnexar() {
        var app = pc.Application.getApplication();
        if (!app) {
            // app ainda não existe, tenta de novo em breve
            setTimeout(tentarAnexar, 100);
            return;
        }

        app.on("play:clicked", function () {
            window.parent.postMessage({ acao: "play:clicked" }, "*");
        });
        
        window.addEventListener('message', function (event) {
            const dados = event.data;
            if (dados && dados.acao === 'fimparte1') {
                document.body.style.cursor = "none"
            }
        })

        console.log("[bridge] listener de play:clicked registrado");
    }

    tentarAnexar();
})();