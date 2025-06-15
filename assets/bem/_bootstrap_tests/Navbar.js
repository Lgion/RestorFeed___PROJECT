import Moulinette from './Moulinette.js'

class Navbar extends Moulinette{

    #COMPONENT = "navbar"
    #BLOCK_PARAMS_LIST = {
        // step 0
        "behavior": ["standard", "search"],
        // step 1
        "expand": ["never", "always", "sm", "md", "lg", "xl", "xxl"],
        // step 2
        "mode": ["dark", "light"]
    }
    #BLOCK_DEFAULT = {
        "behavior": "standard",
        "expand": "md",
        "mode": "dark"
    }
    #ELEMENTS_LIST = ["logo", "collapse", "menu_main", "menu_secondary", "search_input"]
    #BEHAVIORS = {
        "standard": {"logo": "a", "collapse": "button", "menu_main": "menu"},
        "search": {"logo": "a", "collapse": "button", "menu_main": "menu.seo",  "search_input": "form.search"},
        "account": {"logo": "a", "collapse": "button", "menu_main": "menu.seo",     "menu_secondary": "ul"}
    }

    constructor(currentComponent){
        //APPEL DU COMPOSANT PARENT
        super(currentComponent, "navbar")

        //DÉFINITION DES PARAMÈTRES VIDES 
        //QUI SE REMPLIRONT EN COMBINANT, LES DONNÉES PAR DÉFAUT AUX DONNÉES UTILISATEUR
        this.block = {}
        this.elements_behavior = {}
        this.elements = []

        //DÉFINITION DE VARIABLE CLASSIQUES
        let key, elements = {}

        //DÉFINITION DES PARAMÈTRES À APPLIQUER
        // => AGGLOMÉRATION DES CHOIX DU DEV, AVEC LE COMPORTEMENT PAR DEFAUT DU COMPOSANT
        console.log(this.#BLOCK_PARAMS_LIST)
        console.log(this.currentComponent._.type);
        console.log(this.currentComponent._.expand);
        console.log(this.currentComponent._.mode);
        // for(key in this.#BLOCK_PARAMS_LIST)
            // this.block[key] = !this.currentComponent._[key] ? this.#BLOCK_DEFAULT[key] : this.currentComponent._.block[key]
        this.block = {...this.#BLOCK_DEFAULT, ...this.currentComponent._.block}
        // console.log(this.block)
        
        // RÉCUPÉRER LES PARAMÈTRES EN LIEN AVEC LA VALEUR DU PARAMÈTRE 'behavior' 
        this.elements_behavior = {...this.#BEHAVIORS[this.block.behavior]}

        //RÉCUPÉRER LES OBJETS JQUERY REPRÉSENTANTS CHACUNS DES ÉLÉMENTS DE this.elements
        for(key in this.elements_behavior){
            console.log('tag_'+this.elements_behavior[key]);
            console.log('get'+key.substring(0,1).toUpperCase()+key.substring(1))
            this.elements.push(
                this['get'+key.substring(0,1).toUpperCase()+key.substring(1)](
                    this['tag_'+this.elements_behavior[key]](key)
                )
            )
        }
        console.log(this.elements);
        
        //LANCER LA CRÉATION DES ÉLÉMENT DU COMPOSANT
        this.init()

        /*
            LOGO
            COLLAPSE BUTTON
            MENU
            FORM
            LISTE UL (menu secondaire)
        */
    }
    init(){
        // $(this.currentComponent).html('').append(
            // this.getComponentFromJSON_(this.currentComponent._)
        // )
        $(this.currentComponent).html('')
        this.elements.map(e=>{
            console.log(e)
            console.log(this.currentComponent)
            $(this.currentComponent).append($(e))
        })
    }


    getLogo = (element) => {
        return element
    }
    getCollapse = (element) => {
        element.appendChild(document.createElement('span'))
        return element
    }
    getMenu_main = (element) => {
        return element
    }


    getComponentFromJSON(objecItems){
        this.elements
    }
    getComponentFromJSON_(objectItems){
        objectItems =   typeof objectItems == "string" ? 
                            objectItems.split(',').map(e=>e.trim()) : 
                        typeof objectItems == "undefined" ? 
                            [] : 
                        objectItems
        let a, button, span, menu, menu_items = []
        let type = objectItems.type
        let type_default = objectItems.type_default
    
        console.log(objectItems);
        console.log(typeof objectItems);
        let root_elements = [
            a = $('<a>')
                .html(objectItems.logo.a.html || "contenu html par défaut")
                .attr({title: "titre par défault", href: "#", ...objectItems.logo.a.attr})
                .data('_', objectItems.logo.a)
            , button = $('<button>').append($('<span>'))
                .attr({type: "button", "data-toggle": "collapse", "data-target": "#navbarID", ...objectItems.collapse.button.attr})
                .data('_', objectItems.collapse.button)
            , menu = $('<menu>')
                .attr({id: objectItems.collapse.button.attr["data-target"] || "navbarID"})
                .append(objectItems.menu_main.menu.items.map(e=>{
                    return $('<li>').append($('<a>')
                        .html(e.html)
                        .attr({"aria-current": "page", href: "#", ...e.attr})
                    )
                }))
                .data('_', objectItems.collapse.menu)
        ]
        return root_elements
    }
}


const toexport = {Navbar}

export default toexport