import '../styles/page404.css';

let explo = $("#explo");

explo.on("click", () => {
    $("#text").html(`<p>Un loup garou vous a aperçu et vous a sauté dessus. Malgré tous vos efforts pour vous débattre, il gagne le combat. Grâce à vous, quelqu'un n'aura pas faim au réveil.</p>`);
    setTimeout(function () {
        $(document.body).hide(5000);
        setTimeout(function (){
            window.location.replace("/");
        }, 5000);
    }, 6000);
});