document.addEventListener("DOMContentLoaded", function () {
    const dataContainer = document.getElementById("dataContainer");
    const jwtToken = dataContainer.getAttribute("data-jwtToken");
    const clientUrl = dataContainer.getAttribute("data-clientUrl");

    if (jwtToken && clientUrl) {
        window.opener.postMessage({
            token: jwtToken,
            ok: true
        }, clientUrl);
        window.close();
    }
});

