export class Tools {
    static generateRandomString(length: number): string {
        let result           = '';
        let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }



    static popup() {
        let div = $("<div>");
        div.addClass("popup");
        let outer = $("<div>");
        outer.append(div);
        outer.addClass("fond_blanc");
        let close = $("<span>").addClass("close").text("✖");
        div.append(close);
        let text = $("<div>").addClass("innerPopup");
        div.append(text);
        close.on("click", function () {
            outer.addClass("disappear");
            setTimeout(function(){outer.remove();}, 1000);
        });
        div.on("click", function(e){
            e.stopPropagation();
        });
        outer.on("click", function () {
            outer.addClass("disappear");
            setTimeout(function(){outer.remove();}, 1000);
        });
        return {div: outer, text};
    }
}