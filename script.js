/*
__loading__.js da parte 2
const hideSplash = () => {
    const splashWrapper = document.getElementById('application-splash-wrapper');
    if (splashWrapper) {
        splashWrapper.remove();
    }
    window.parent.postMessage({acao:'parte2carregada'}, '*');
};

__game-scripts.js
setTimeout((()=>{window.location.reload()}
para
setTimeout((()=>{window.parent.postMessage({acao:'parte1'}, '*');}
ou
setTimeout((()=>{window.parent.postMessage({acao:'parte2'}, '*');}
*/

const iframe = document.querySelector('iframe');
const bloqueioTelaInicial = document.querySelector("#bloqueio-tela-inicial")
const cursorNone = document.querySelector("#cursor-none")
const telaErroGrafico = document.querySelector("#tela-erro-grafico")
let playClicado = false

function pausarJogo() {
    if (iframe.src.includes("iframe/index.html")) return
    try {
        const app = iframe.contentWindow.pc.Application.getApplication();
        if (app) {
            app.timeScale = 0;
            if (app.systems && app.systems.sound && app.systems.sound.context) {
                app.systems.sound.context.suspend();
            }
        }
    } catch (e) {
        console.error("Erro ao pausar o jogo:", e);
    }
}

function retomarJogo() {
    if (iframe.src.includes("iframe/index.html")) return
    try {
        const app = iframe.contentWindow.pc.Application.getApplication();
        if (app) {
            app.timeScale = 1;
            if (app.systems && app.systems.sound && app.systems.sound.context) {
                app.systems.sound.context.resume();
            }
        }
    } catch (e) {
        console.error("Erro ao retomar o jogo:", e);
    }
}

window.addEventListener('message', function (event) {
    const dados = event.data;
    if (dados) {
        switch (dados.acao) {
            case 'parte1':
                prepararParte1();
                break;
            case 'parte1carregada':
                irParte1();
                break;
            case 'play:clicked':
                playClicado = true
                break;
            case 'parte2':
                prepararParte2();
                break;
            case 'parte2carregada':
                irParte2();
                break;
        }
    }
})

// --- Qualidade gráfica ---
let qualidadeEscolhida = null;
let parte2Carregada = false;

// --- Controle de erro gráfico (WebGL context lost) ---
let transicaoForcada = false; // true durante a perda de contexto proposital da transição parte1 -> parte2
let telaErroGraficoAtiva = false;

function construirUrl(urlBase) {
    var separador = urlBase.indexOf('?') === -1 ? '?' : '&';
    return urlBase + separador + 'quality=' + qualidadeEscolhida;
}

function prepararParte1() {
    playClicado = false
    bloqueioTelaInicial.style.display = "block"
    iframe.src = construirUrl("./parte1/index.html");
    iframe.style.opacity = 0;
    iframe.style.filter = "blur(50px)"
    setTimeout(() => {
        iframe.style.transitionDuration = "10s"
    }, 10);
}

function irParte1() {
    monitorarContextoWebGL();
    setTimeout(() => {
        iframe.style.opacity = 1;
        iframe.style.filter = "blur(0px)"
        setTimeout(() => {
            bloqueioTelaInicial.style.display = "none"
            setTimeout(() => {
                iframe.style.transitionDuration = "0s"
            }, 2000 + 10);
        }, 8000 + 10);
    }, 50);
}

function forcarPerdaContexto() {
    try {
        const canvas = iframe.contentDocument.querySelector('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        const ext = gl && gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
    } catch (e) {
        console.error("Erro ao forçar perda de contexto:", e);
    }
}

function destruirAppAtual() {
    try {
        const app = iframe.contentWindow.pc.Application.getApplication();
        if (app) {
            app.destroy(); // libera o contexto WebGL, para o game loop, remove listeners
        }
    } catch (e) {
        console.error("Erro ao destruir app anterior:", e);
    }
}

function prepararParte2() {
    transicaoForcada = true // a partir daqui, qualquer webglcontextlost é esperado, não é erro
    cursorNone.style.display = "block"
    iframe.style.opacity = 0;
    setTimeout(() => {
        iframe.style.transitionDuration = "5s"
        destruirAppAtual();
        forcarPerdaContexto();
    }, 500);
    setTimeout(() => {
        iframe.contentWindow.postMessage({ acao: "fimparte1" }, "*");
        setTimeout(() => {
            iframe.src = "about:blank";
            setTimeout(() => {
                iframe.src = construirUrl("./parte2/index.html");
            }, 300);
        }, 100);
    }, 1600);
}

function irParte2() {
    transicaoForcada = false // parte2 carregou normalmente, voltamos a monitorar erros de verdade
    monitorarContextoWebGL();
    pointerLock()
    iframe.style.opacity = 1;
    cursorNone.style.display = "none"
    setTimeout(() => {
        iframe.style.transitionDuration = "0s"
    }, 5000 + 100);
}

function pointerLock() {
    try {
        const canvas = iframe.contentDocument.querySelector('canvas');
        if (canvas) {
            canvas.focus();
            canvas.requestPointerLock();
        } else {
            // fallback, caso o canvas ainda não exista nesse instante
            iframe.requestPointerLock();
        }
    } catch (e) {
        console.error("Erro ao fazer pointer lock:", e);
        return null;
    }
}

// --- Monitoramento de perda de contexto WebGL (tela branca / rostinho triste) ---
function monitorarContextoWebGL() {
    try {
        const canvas = iframe.contentDocument.querySelector('canvas');
        if (canvas) {
            canvas.addEventListener('webglcontextlost', function (event) {
                if (transicaoForcada) return; // perda esperada, provocada por forcarPerdaContexto()
                exibirErroGrafico();
            }, { once: true });
        }
    } catch (e) {
        console.error("Erro ao monitorar contexto WebGL:", e);
    }
}

function exibirErroGrafico() {
    if (telaErroGraficoAtiva) return;
    telaErroGraficoAtiva = true;
    pausarJogo();
    telaErroGrafico.style.display = "flex";
}

document.querySelector("#btn-recarregar").addEventListener("click", function () {
    const url = new URL(window.location.href);
    url.searchParams.set("_r", Date.now()); // força nova navegação, evita bfcache
    window.location.href = url.toString();
});

const telaQualidade = document.querySelector("#tela-qualidade");

function mostrarEscolhaQualidade() {
    telaCheia.style.display = "none";
    telaQualidade.style.display = "flex";
}

function escolherQualidade(qualidade) {
    qualidadeEscolhida = qualidade;
    telaQualidade.style.display = "none";
    prepararParte1();
}

document.querySelector("#btn-baixa").addEventListener("click", function () {
    escolherQualidade("low");
});

document.querySelector("#btn-alta").addEventListener("click", function () {
    escolherQualidade("high");
});

// --- Tela cheia ---
const isCelular = (navigator.userAgentData !== undefined && navigator.userAgentData.mobile) || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
//isCelular = true

if (isCelular) {
    document.querySelector("#tela-cheia > p").innerHTML = "Para uma melhor experiência, <br> toque para ativar a tela cheia"
}

const telaCheia = document.querySelector("#tela-cheia")
function launchFullscreen(element) {
    telaCheia.style.display = "none"
    if (playClicado) pointerLock()
    setTimeout(() => {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE/Edge
            element.msRequestFullscreen();
        }
    }, 1);
}

telaCheia.addEventListener("click", function () {
    launchFullscreen(document.documentElement);
});

document.addEventListener("fullscreenchange", function () {
    if (document.fullscreenElement) {
        if (!qualidadeEscolhida) {
            mostrarEscolhaQualidade();
        } else {
            telaCheia.style.display = "none"
            if (!algumaTelaDeOverlayVisivel()) {
                retomarJogo()
            }
        }
    } else {
        telaCheia.style.display = "flex"
        telaQualidade.style.display = "none"
        pausarJogo()
    }
})

const telaViraLandscape = document.querySelector("#tela-vira-landscape")

// --- Função central: existe alguma div cobrindo o iframe agora? ---
function algumaTelaDeOverlayVisivel() {
    return (
        !document.fullscreenElement ||
        telaQualidade.style.display === "flex" ||
        telaViraLandscape.style.display === "flex" ||
        telaErroGrafico.style.display === "flex"
    );
}

// --- Reforça a pausa quando a aba volta a ficar visível/focada,
// mas alguma tela de overlay ainda está cobrindo o jogo ---
function reforcarPausaSeNecessario() {
    if (algumaTelaDeOverlayVisivel()) {
        setTimeout(pausarJogo, 10);
    }
}

document.addEventListener("visibilitychange", function () {
    reforcarPausaSeNecessario()
    if (!document.hidden && playClicado) {
        pointerLock()
    }
});
window.addEventListener("focus", reforcarPausaSeNecessario);
window.addEventListener("pageshow", reforcarPausaSeNecessario);

window.addEventListener("resize", verificaOrientacao)
window.addEventListener("orientationchange", function () {
    setTimeout(verificaOrientacao, 100);
});

function verificaOrientacao() {
    var portrait = window.innerHeight > window.innerWidth
    if (portrait) {
        telaViraLandscape.style.display = "flex"
        pausarJogo()
    } else {
        telaViraLandscape.style.display = "none"
        if (!algumaTelaDeOverlayVisivel()) {
            retomarJogo()
        }
    }
}
verificaOrientacao()