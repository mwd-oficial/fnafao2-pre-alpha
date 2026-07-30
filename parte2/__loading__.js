pc.script.createLoadingScreen((app) => {
    const createCss = () => {
        const css = `
            body {
                background-color: #000000;
                margin: 0;
                padding: 0;
                overflow: hidden;
            }

            #application-splash-wrapper {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: 100%;
                background-color: #000000;
            }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    };

    const showSplash = () => {
        const wrapper = document.createElement('div');
        wrapper.id = 'application-splash-wrapper';
        document.body.appendChild(wrapper);
    };

    const hideSplash = () => {
        const splashWrapper = document.getElementById('application-splash-wrapper');
        if (splashWrapper) {
            splashWrapper.remove();
        }
        window.parent.postMessage({acao:'parte2carregada'}, '*');
    };

    createCss();
    showSplash();

    app.on('preload:end', () => {
        app.off('preload:progress');
    });
    
    app.on('start', hideSplash);
});